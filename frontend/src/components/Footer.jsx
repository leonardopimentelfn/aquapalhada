import { MessageCircle, ShieldCheck, Truck, HeartPulse } from "lucide-react";
import { Logo } from "@/components/Logo";
import { scrollToId } from "@/lib/scroll";
import { WHATSAPP_NUMBER, STORE_NAME } from "@/config";

const Footer = () => {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá, ${STORE_NAME}!`)}`;

  return (
    <footer id="sobre" className="scroll-mt-20 border-t border-aqua/10 bg-navy-800/50">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Loja online de peixes ornamentais e aquarismo. Animais saudáveis de viveiro,
              embalagem térmica e envio seguro para todo o Brasil.
            </p>
            <a
              data-testid="footer-whatsapp"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-whats/40 px-5 py-2.5 text-sm font-semibold text-whats transition-colors hover:bg-whats/10"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a loja
            </a>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-aqua">
              Nossa promessa
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-aqua" />
                Animais com quarentena e saúde garantida
              </li>
              <li className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0 text-aqua" />
                Embalagem térmica e envio expresso
              </li>
              <li className="flex items-center gap-3">
                <HeartPulse className="h-4 w-4 shrink-0 text-aqua" />
                Orientação de água e aclimatação inclusas
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-aqua">Loja</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <button
                  data-testid="footer-link-catalogo"
                  onClick={() => scrollToId("catalogo")}
                  className="transition-colors hover:text-aqua"
                >
                  Catálogo completo
                </button>
              </li>
              <li>
                <a
                  data-testid="footer-link-admin"
                  href="/admin"
                  className="transition-colors hover:text-aqua"
                >
                  Área do lojista
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-aqua/10 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
          </span>
          <span>Feito com dedicação por aquaristas</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
