import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Upload, LogOut, Fish, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api, { absoluteUrl, formatBRL, formatApiErrorDetail } from "@/lib/api";
import { LogoMark } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = [
  { key: "peixes", label: "Peixes Ornamentais" },
  { key: "invertebrados", label: "Invertebrados" },
  { key: "acessorios", label: "Acessórios & Rações" },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

const emptyForm = {
  name: "",
  category: "peixes",
  price: "",
  stock: "",
  unit: "unidade",
  description: "",
  image_url: "",
  featured: false,
};

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5">
      <form
        data-testid="admin-login-form"
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-aqua/10 bg-navy-800 p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="font-playfair text-2xl text-white">Área do Lojista</h1>
          <p className="text-sm text-muted-foreground">
            Acesse para gerenciar produtos e animais
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              data-testid="admin-login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aquapalhada.com.br"
              className="border-aqua/20 bg-navy-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              data-testid="admin-login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-aqua/20 bg-navy-700 text-white"
            />
          </div>
          {error && (
            <p
              data-testid="admin-login-error"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
            >
              {error}
            </p>
          )}
          <Button
            data-testid="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-aqua font-bold text-navy hover:bg-aqua/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ProductForm = ({ initial, onClose, onSaved }) => {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(() =>
    initial?.id
      ? {
          ...emptyForm,
          ...initial,
          price: String(initial.price),
          stock: String(initial.stock),
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      set("image_url", absoluteUrl(data.url));
      toast.success("Imagem enviada");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Falha no upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(String(form.price).replace(",", ".")) || 0,
      stock: parseInt(String(form.stock), 10) || 0,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${initial.id}`, payload);
        toast.success("Produto atualizado");
      } else {
        await api.post("/products", payload);
        toast.success("Produto cadastrado");
      }
      onSaved();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Falha ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto border-aqua/10 bg-navy-800 text-white sm:max-w-lg" data-lenis-prevent>
      <DialogHeader>
        <DialogTitle className="font-playfair text-2xl">
          {isEdit ? "Editar produto" : "Novo produto"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Cadastre peixes, invertebrados ou acessórios na sua loja.
        </DialogDescription>
      </DialogHeader>
      <form data-testid="product-form" onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pf-name">Nome</Label>
          <Input id="pf-name" data-testid="product-form-name" required value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Betta Crown Vermelho"
            className="border-aqua/20 bg-navy-700 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger data-testid="product-form-category" className="border-aqua/20 bg-navy-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-aqua/20 bg-navy-700 text-white">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-unit">Unidade</Label>
            <Input id="pf-unit" data-testid="product-form-unit" value={form.unit}
              onChange={(e) => set("unit", e.target.value)} placeholder="unidade, pareja, pacote..."
              className="border-aqua/20 bg-navy-700 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pf-price">Preço (R$)</Label>
            <Input id="pf-price" data-testid="product-form-price" required type="number" step="0.01" min="0"
              value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="89.90"
              className="border-aqua/20 bg-navy-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-stock">Estoque</Label>
            <Input id="pf-stock" data-testid="product-form-stock" required type="number" min="0"
              value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="10"
              className="border-aqua/20 bg-navy-700 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-desc">Descrição</Label>
          <Textarea id="pf-desc" data-testid="product-form-description" value={form.description}
            onChange={(e) => set("description", e.target.value)} rows={3}
            placeholder="Conte sobre o animal ou produto, cuidados e compatibilidade..."
            className="border-aqua/20 bg-navy-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-img">Imagem (URL)</Label>
          <div className="flex gap-2">
            <Input id="pf-img" data-testid="product-form-image-url" value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)} placeholder="https://..."
              className="border-aqua/20 bg-navy-700 text-white" />
            <input type="file" accept="image/*" hidden id="pf-file"
              onChange={(e) => uploadFile(e.target.files?.[0])} />
            <Button type="button" data-testid="product-form-upload" disabled={uploading}
              onClick={() => document.getElementById("pf-file").click()}
              className="shrink-0 border border-aqua/30 bg-navy-700 text-aqua hover:bg-aqua/10">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>
          </div>
          {form.image_url && (
            <img src={absoluteUrl(form.image_url)} alt="Pré-visualização"
              data-testid="product-form-image-preview"
              className="mt-2 h-28 w-28 rounded-lg border border-aqua/20 object-cover" />
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-aqua/10 bg-navy-700/60 p-4">
          <Label htmlFor="pf-featured" className="cursor-pointer">Produto em destaque</Label>
          <Switch id="pf-featured" data-testid="product-form-featured" checked={form.featured}
            onCheckedChange={(v) => set("featured", v)} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" data-testid="product-form-cancel" onClick={onClose}
            variant="outline" className="flex-1 border-aqua/20 bg-transparent text-white hover:bg-aqua/10 hover:text-white">
            Cancelar
          </Button>
          <Button type="submit" data-testid="product-form-save" disabled={saving}
            className="flex-1 bg-aqua font-bold text-navy hover:bg-aqua/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Salvar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      toast.error("Não foi possível carregar os produtos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => [
      { label: "Produtos", value: products.length },
      { label: "Peixes", value: products.filter((p) => p.category === "peixes").length },
      { label: "Invertebrados", value: products.filter((p) => p.category === "invertebrados").length },
      { label: "Acessórios", value: products.filter((p) => p.category === "acessorios").length },
    ],
    [products]
  );

  const remove = async (p) => {
    if (!window.confirm(`Excluir "${p.name}" definitivamente?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success("Produto excluído");
      load();
    } catch {
      toast.error("Falha ao excluir");
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      <header className="glass sticky top-0 z-40 border-b border-aqua/10 bg-navy/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Painel do Lojista</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button data-testid="admin-new-product" onClick={() => setEditing({})}
              className="gap-2 rounded-full bg-aqua font-bold text-navy hover:bg-aqua/90">
              <Plus className="h-4 w-4" /> Novo produto
            </Button>
            <Button data-testid="admin-logout" onClick={onLogout} variant="outline"
              className="gap-2 rounded-full border-aqua/20 bg-transparent text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} data-testid={`admin-stat-${s.label.toLowerCase()}`}
              className="rounded-2xl border border-aqua/10 bg-navy-800/60 p-5">
              <p className="text-3xl font-black text-aqua">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-aqua" />
          </div>
        ) : products.length === 0 ? (
          <div data-testid="admin-empty-state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-aqua/20 py-24 text-center">
            <Fish className="h-8 w-8 text-aqua/50" />
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            <Button onClick={() => setEditing({})} className="rounded-full bg-aqua font-bold text-navy hover:bg-aqua/90">
              <Plus className="h-4 w-4" /> Cadastrar primeiro produto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-aqua/10 bg-navy-800/60">
            <Table data-testid="admin-product-table">
              <TableHeader>
                <TableRow className="border-aqua/10 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Produto</TableHead>
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground">Preço</TableHead>
                  <TableHead className="text-muted-foreground">Estoque</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} data-testid={`admin-row-${p.id}`} className="border-aqua/10">
                    <TableCell>
                      <div className="flex items-center gap-3 py-1">
                        {p.image_url ? (
                          <img src={absoluteUrl(p.image_url)} alt={p.name}
                            className="h-11 w-11 shrink-0 rounded-lg border border-aqua/10 object-cover" />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-aqua/10 bg-navy-700">
                            <ImageIcon className="h-4 w-4 text-aqua/40" />
                          </span>
                        )}
                        <span className="font-semibold text-white">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{CATEGORY_LABEL[p.category]}</TableCell>
                    <TableCell className="font-bold text-aqua">{formatBRL(p.price)}</TableCell>
                    <TableCell>
                      <span className={p.stock === 0 ? "font-bold text-red-400" : "text-slate-300"}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button data-testid={`admin-edit-${p.id}`} size="icon" variant="outline"
                          onClick={() => setEditing(p)}
                          className="h-9 w-9 border-aqua/20 bg-transparent text-aqua hover:bg-aqua/10">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button data-testid={`admin-delete-${p.id}`} size="icon" variant="outline"
                          onClick={() => remove(p)}
                          className="h-9 w-9 border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      </Dialog>
    </div>
  );
};

const Admin = () => {
  const { user, logout } = useAuth();

  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-aqua" />
      </div>
    );
  }
  if (!user) return <LoginScreen />;
  return <Dashboard user={user} onLogout={logout} />;
};

export default Admin;
