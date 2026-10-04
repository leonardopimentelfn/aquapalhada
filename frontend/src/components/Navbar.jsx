import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { scrollToId } from "@/lib/scroll";

const LINKS = [
  { label: "Início", id: "inicio" },
  { label: "Categorias", id: "categorias" },
  { label: "Catálogo", id: "catalogo" },
  { label: "Sobre", id: "sobre" },
];

const Navbar = () => {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <header className="glass fixed inset-x-0 top-0 z-50 border-b border-aqua/10 bg-navy/70">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <a
          data-testid="navbar-logo"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            go("inicio");
          }}
        >
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-link-${l.id}`}
              onClick={() => go(l.id)}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-aqua"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="navbar-cart-button"
            onClick={openCart}
            aria-label="Abrir carrinho"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-aqua/20 text-aqua transition-colors hover:bg-aqua/10"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span
                data-testid="navbar-cart-badge"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-aqua px-1 text-[11px] font-bold text-navy"
              >
                {count}
              </span>
            )}
          </button>
          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-aqua/20 text-aqua transition-colors hover:bg-aqua/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass border-t border-aqua/10 bg-navy/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-mobile-link-${l.id}`}
                onClick={() => go(l.id)}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-aqua/10 hover:text-aqua"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
