import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List, Annotated

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from bson import ObjectId
import bcrypt
import jwt

JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@aquapalhada.com.br')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'AquaPalhada@2025')
JWT_ALGORITHM = "HS256"

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aquapalhada")

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

CATEGORIES = ["peixes", "invertebrados", "acessorios"]


# ---------- helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def oid_str(v):
    return str(v)


PyObjectId = Annotated[Optional[str], BeforeValidator(oid_str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        for key, value in list(data.items()):
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        return data

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if not doc:
            return None
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return cls(**doc)


# ---------- models ----------
class Product(BaseDocument):
    name: str
    category: str
    price: float
    description: str = ""
    image_url: str = ""
    unit: str = "unidade"
    stock: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    description: str = ""
    image_url: str = ""
    unit: str = "unidade"
    stock: int = 0
    featured: bool = False


class LoginInput(BaseModel):
    email: str
    password: str


# ---------- auth ----------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


FAILED_LIMIT = 5
LOCK_MINUTES = 15


async def register_failed_attempt(identifier: str):
    now = datetime.now(timezone.utc)
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {
            "$inc": {"attempts": 1},
            "$setOnInsert": {"first_attempt": now.isoformat()},
        },
    )
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("attempts", 0) >= FAILED_LIMIT:
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$set": {"locked_until": (now + timedelta(minutes=LOCK_MINUTES)).isoformat()}},
        )


async def check_locked(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if not rec:
        return
    locked_until = rec.get("locked_until")
    if locked_until:
        locked = datetime.fromisoformat(locked_until)
        if datetime.now(timezone.utc) < locked:
            raise HTTPException(status_code=429, detail="Muitas tentativas. Tente novamente em alguns minutos.")


# ---------- app ----------
app = FastAPI(title="AquaPalhada API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@api_router.get("/")
async def root():
    return {"message": "AquaPalhada API no ar", "status": "ok"}


# ---------- auth routes ----------
@api_router.post("/auth/login")
async def login(input: LoginInput, response: Request):
    request = response
    email = input.email.strip().lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    await check_locked(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        await register_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), user["email"])
    from fastapi.responses import JSONResponse
    resp = JSONResponse(content={"id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "")})
    resp.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return resp


@api_router.post("/auth/logout")
async def logout():
    from fastapi.responses import JSONResponse
    resp = JSONResponse(content={"ok": True})
    resp.delete_cookie(key="access_token", path="/")
    return resp


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user.get("email"), "name": user.get("name", ""), "role": user.get("role", "")}


# ---------- product routes ----------
@api_router.get("/products")
async def list_products(category: Optional[str] = None):
    query = {}
    if category and category in CATEGORIES:
        query["category"] = category
    docs = await db.products.find(query).sort([("featured", -1), ("created_at", -1)]).to_list(500)
    return [Product.from_mongo(d).model_dump(by_alias=False) for d in docs]


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return Product.from_mongo(doc).model_dump(by_alias=False)


@api_router.post("/products")
async def create_product(input: ProductCreate, user: dict = Depends(get_current_user)):
    if input.category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="Categoria inválida")
    product = Product(**input.model_dump())
    result = await db.products.insert_one(product.to_mongo())
    doc = await db.products.find_one({"_id": result.inserted_id})
    return Product.from_mongo(doc).model_dump(by_alias=False)


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, input: ProductCreate, user: dict = Depends(get_current_user)):
    if input.category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="Categoria inválida")
    product = Product(**input.model_dump())
    data = product.to_mongo()
    data.pop("_id", None)
    result = await db.products.replace_one({"_id": ObjectId(product_id)}, data)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    return Product.from_mongo(doc).model_dump(by_alias=False)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"ok": True}


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = Path(file.filename or "image.png").suffix.lower() or ".png"
    if ext not in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
        ext = ".png"
    name = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    (UPLOAD_DIR / name).write_bytes(content)
    return {"url": f"/api/uploads/{name}"}


app.include_router(api_router)


# ---------- seeding ----------
SEED_PRODUCTS = [
    {
        "name": "Betta Crown Vermelho",
        "category": "peixes",
        "price": 89.9,
        "unit": "unidade",
        "stock": 12,
        "featured": True,
        "description": "Betta splendens macho adulto, nadadeiras em coroa e coloração vermelha intensa. Criado em aquário próprio, acostumado a ração em flocos e pellets.",
        "image_url": "https://images.unsplash.com/photo-1573976366069-ee53f0cc76db?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Guppy Fantasia Colorida",
        "category": "peixes",
        "price": 19.9,
        "unit": "pareja",
        "stock": 40,
        "featured": True,
        "description": "Casal de guppies de linhagem colorida, perfeito para aquários comunitários plantados. Fácil de criar e se reproduz com facilidade.",
        "image_url": "https://images.unsplash.com/photo-1711826949953-6ac54aa7546b?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Tétrada Neon",
        "category": "peixes",
        "price": 8.9,
        "unit": "unidade",
        "stock": 120,
        "featured": False,
        "description": "O clássico peixe de cardume. Azul elétrico e vermelho brilhante para dar vida a qualquer aquário plantado. Vendido por unidade, mínimo sugerido de 8.",
        "image_url": "https://images.unsplash.com/photo-1737688670910-084f54254e73?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Acará Disco Vermelho",
        "category": "peixes",
        "price": 249.9,
        "unit": "unidade",
        "stock": 6,
        "featured": True,
        "description": "O rei do aquário. Disco vermelho de viveiro, corpulento e saudável, com cerca de 10 cm. Exige água macia, quente e aquário alto.",
        "image_url": "https://images.pexels.com/photos/32024484/pexels-photo-32024484.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        "name": "Camarão Cherry",
        "category": "invertebrados",
        "price": 12.9,
        "unit": "unidade",
        "stock": 80,
        "featured": False,
        "description": "Neocaridina davidi vermelha, excelente limpadora de algas e indicada para iniciantes. Reproduz-se bem em água doce estável.",
        "image_url": "https://images.unsplash.com/photo-1703319959677-b8dd4f14c80e?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Camarão Golden Back",
        "category": "invertebrados",
        "price": 19.9,
        "unit": "unidade",
        "stock": 45,
        "featured": False,
        "description": "Neocaridina de linhagem dourada, laranja translúcido que brilha sobre substrato escuro. Igual de resistente que a Cherry.",
        "image_url": "https://images.unsplash.com/photo-1722192147966-14444c832f53?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Caramujo Ninja",
        "category": "invertebrados",
        "price": 15.9,
        "unit": "unidade",
        "stock": 30,
        "featured": False,
        "description": "Caramujo engenheiro que não se reproduz em água doce. Remove algas de vidro, plantas e troncos sem lotar o aquário.",
        "image_url": "https://images.unsplash.com/photo-1647560106999-9af33f03e95d?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Ração Tropical Premium 50g",
        "category": "acessorios",
        "price": 29.9,
        "unit": "pacote",
        "stock": 60,
        "featured": False,
        "description": "Alimento em pellets de baixa deterioração para peixes tropicais ornamentais. Realça cores e não turva a água.",
        "image_url": "https://images.unsplash.com/photo-1656581417767-5eb8ecd8bf3c?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Planta Aquática Natural",
        "category": "acessorios",
        "price": 34.9,
        "unit": "muda",
        "stock": 25,
        "featured": False,
        "description": "Planta aquática cultivada em imersão, pronta para plantar. Oxigena a água, abriga alevinos e completa o paisagismo do aquário.",
        "image_url": "https://images.unsplash.com/photo-1579967327980-2a4117da0e4a?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Filtro Interno Compacto",
        "category": "acessorios",
        "price": 79.9,
        "unit": "unidade",
        "stock": 18,
        "featured": False,
        "description": "Filtro interno de fluxo ajustável para aquários de até 100 litros. Filtra mecanicamente, mantém a água cristalina e opera com baixo ruído.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/352e36cb-79ad-4cfa-8c4e-c1c9cdb3345e/images/6eddf784cfcc7ee5d77c6c3b1e372a51ed9e094e6b271220c38b88b432641b64.jpeg",
    },
]


async def seed_admin():
    admin_email = ADMIN_EMAIL.strip().lower()
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "AquaPalhada Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Admin password updated")


async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        for p in SEED_PRODUCTS:
            await db.products.insert_one(Product(**p).to_mongo())
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
