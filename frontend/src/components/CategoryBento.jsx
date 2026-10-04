import { motion } from "framer-motion";
import { ArrowUpRight, Fish, Bug, Package } from "lucide-react";

const CATEGORIES = [
  {
    key: "peixes",
    label: "Peixes Ornamentais",
    icon: Fish,
    span: "h-72 md:col-span-2 md:row-span-2 md:h-auto",
    img: "https://images.unsplash.com/photo-1573976366069-ee53f0cc76db?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    key: "invertebrados",
    label: "Invertebrados",
    icon: Bug,
    span: "h-60 md:col-span-2",
    img: "https://images.unsplash.com/photo-1703319959677-b8dd4f14c80e?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    key: "acessorios",
    label: "Acessórios & Rações",
    icon: Package,
    span: "h-60 md:col-span-2",
    img: "https://images.unsplash.com/photo-1579967327980-2a4117da0e4a?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
];

const CategoryBento = ({ products = [], onSelect }) => {
  const countFor = (key) => products.filter((p) => p.category === key).length;

  return (
    <section id="categorias" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="mb-12 flex flex-col gap-3 md:mb-16"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-aqua">
          Navegue por categoria
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Escolha o seu oceano
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
        {CATEGORIES.map((c, idx) => (
          <motion.button
            key={c.key}
            data-testid={`category-tile-${c.key}`}
            onClick={() => onSelect(c.key)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: idx * 0.12 }}
            className={`group relative overflow-hidden rounded-2xl border border-aqua/10 text-left ${c.span}`}
          >
            <img
              src={c.img}
              alt={c.label}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute inset-0 bg-aqua/0 transition-colors duration-500 group-hover:bg-aqua/10" />
            <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
              <c.icon className="mb-3 h-6 w-6 text-aqua" />
              <h3 className="text-2xl font-bold text-white md:text-3xl">{c.label}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                {countFor(c.key)} itens disponíveis
                <ArrowUpRight className="h-4 w-4 text-aqua transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBento;
