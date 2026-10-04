# AquaPalhada — Guia de instalação no seu servidor

Este pacote contém o código-fonte completo da sua loja:
- `backend/` → API (Python/FastAPI) que guarda produtos e faz o login do painel
- `frontend/` → o site em si (React)

## Importante saber antes
O site NÃO é só um punhado de páginas estáticas: ele tem uma parte que roda no servidor
(cadastro de produtos, login do admin, carrinho). Para funcionar, seu servidor precisa de:
1. **Python 3.10+** e **Node.js 18+** com **yarn**
2. **MongoDB** rodando (local ou em nuvem, ex.: MongoDB Atlas gratuito)

Se a sua hospedagem for apenas de "arquivos HTML" (tipo cpanel/public_html simples), ela NÃO
serve esta aplicação — você precisa de uma VPS ou de um serviço que rode Python
(Hostinger VPS, Contabo, DigitalOcean, Railway, Render, etc.).

## Passo a passo na VPS

### 1. Banco de dados
- Opção fácil: crie um cluster gratuito no **MongoDB Atlas** e copie a string de conexão.
- Opção VPS: instale mongodb-org e use `mongodb://localhost:27017`.

### 2. Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env   # preencha MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGINS
```
Gere o JWT_SECRET com: `python3 -c "import secrets; print(secrets.token_hex(32))"`

Rode a API (porta 8001):
```bash
uvicorn server:app --host 0.0.0.0 --port 8001
```
Use systemd ou `nohup` para manter rodando. O admin é criado automaticamente no primeiro boot.

### 3. Frontend
```bash
cd frontend
yarn install
cp .env.example .env
nano .env   # REACT_APP_BACKEND_URL=https://SEUDOMINIO.com.br  (sem / no final)
yarn build   # gera a pasta build/
```

### 4. Publicar
Aponte seu nginx (ou similar) para servir a pasta `frontend/build/` no seu domínio e
repasse as rotas `/api/` para `http://127.0.0.1:8001`. Exemplo mínimo do nginx:

```nginx
server {
  server_name SEUDOMINIO.com.br;
  root /var/www/aquapalhada/frontend/build;
  client_max_body_size 10M;

  location /api/ {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

### 5. WhatsApp
Troque o número da loja em `frontend/src/config.js` (formato: 55 + DDD + número) e rode
`yarn build` de novo.

### 6. Dados de exemplo
A loja começa com 10 produtos fictícios — você os vê e edita no painel `/admin`
(e-mail e senha definidos no `.env` do backend).

## Problemas comuns
- **Carrinho não finaliza / pedidos não chegam**: confira WHATSAPP_NUMBER em `frontend/src/config.js`.
- **Erro de CORS no login**: adicione o domínio do site em `CORS_ORIGINS` no `.env` do backend.
- **Upload de imagem falha**: verifique se a pasta `backend/uploads` existe e tem permissão de escrita.
