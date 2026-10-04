import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
import { absoluteUrl, formatBRL } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "peixes", label: "Peixes" },
  { key: "invertebrados", label: "Invertebrados" },
  { key: "acessorios", label: "Acessórios" },
];

const CATEGORY_LABEL = { peixes: "Peixe", invertebrados: "Invertebrado", acessorios: "Acessório" };

const ProductGrid = ({ products = [], category, setCategory }) => {
  const { addItem, openCart } = useCart();
  const visible = category === "todos" ? products : products.filter((p) => p.category === category);

  return (
    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-28 md:px-8">
      <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-aqua">Vitrine</p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Catálogo da loja
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`category-filter-${f.key}`}
              onClick={() => setCategory(f.key)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                category === f.key
                  ? "border-aqua bg-aqua text-navy"
                  : "border-aqua/20 text-slate-300 hover:border-aqua/50 hover:text-aqua"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div
          data-testid="catalog-empty-state"
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-aqua/20 py-20 text-center"
        >
          <ShoppingBag className="h-8 w-8 text-aqua/50" />
          <p className="text-muted-foreground">Nenhum item nesta categoria por enquanto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {visible.map((p, idx) => (
            <motion.article
              key={p.id}
              data-testid={`product-card-${p.id}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (idx % 3) * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-aqua/10 bg-navy-800/60 transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {p.image_url ? (
                  <img
                    src={absoluteUrl(p.image_url)}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy-700">
                    <ShoppingBag className="h-8 w-8 text-aqua/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-800 via-transparent to-transparent opacity-60" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(420px circle at 50% 0%, rgba(0,240,255,0.14), transparent 65%)",
                  }}
                />
                <span className="glass absolute left-4 top-4 rounded-full border border-aqua/20 bg-navy/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-aqua">
                  {CATEGORY_LABEL[p.category] || p.category}
                </span>
                {p.stock === 0 && (
                  <span
                    data-testid={`product-sold-out-${p.id}`}
                    className="absolute right-4 top-4 rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                  >
                    Esgotado
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-playfair text-xl font-semibold text-white">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-5 flex items-end justify-between gap-3 pt-2">
                  <div>
                    <p data-testid={`product-price-${p.id}`} className="text-xl font-bold text-aqua">
                      {formatBRL(p.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">por {p.unit}</p>
                  </div>
                  <button
                    data-testid={`add-to-cart-button-${p.id}`}
                    disabled={p.stock === 0}
                    onClick={() => {
                      addItem(p);
                      openCart();
                    }}
                    className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-transform ${
                      p.stock === 0
                        ? "cursor-not-allowed border border-border text-muted-foreground"
                        : "bg-aqua text-navy hover:scale-105 active:scale-95"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {p.stock === 0 ? "Esgotado" : "Adicionar"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
