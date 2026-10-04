import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";
import { scrollToId } from "@/lib/scroll";
import { WHATSAPP_NUMBER, STORE_NAME } from "@/config";

const HERO_IMG =
  "https://images.unsplash.com/photo-1760039894970-eb66a3633c5a?crop=entropy&cs=srgb&fm=jpg&q=85";

const BUBBLES = [
  { left: "8%", size: 10, duration: 14, delay: 0 },
  { left: "18%", size: 6, duration: 18, delay: 4 },
  { left: "32%", size: 14, duration: 12, delay: 2 },
  { left: "55%", size: 8, duration: 16, delay: 7 },
  { left: "72%", size: 12, duration: 13, delay: 1 },
  { left: "86%", size: 7, duration: 19, delay: 5 },
  { left: "93%", size: 10, duration: 15, delay: 9 },
];

const line = {
  hidden: { y: "115%" },
  show: (i) => ({
    y: "0%",
    transition: { duration: 1, delay: 0.35 + i * 0.13, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fade = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay },
});

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const waMessage = encodeURIComponent(
    `Olá, ${STORE_NAME}! Quero saber mais sobre os peixes ornamentais disponíveis.`
  );

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <img
          src={HERO_IMG}
          alt="Luz atravessando águas escuras do oceano"
          className="h-[120%] w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-transparent to-navy" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/30 to-transparent" />
      </motion.div>

      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="mx-auto w-full max-w-7xl px-5 pt-24 md:px-8"
      >
        <motion.p
          {...fade(0.15)}
          className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-aqua md:text-xs"
        >
          <span className="h-px w-10 bg-aqua/60" />
          AquaPalhada — Aquarismo Premium
        </motion.p>

        <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-8xl">
          <span className="mask-line">
            <motion.span custom={0} variants={line} initial="hidden" animate="show">
              A mais bela
            </motion.span>
          </span>
          <span className="mask-line">
            <motion.span custom={1} variants={line} initial="hidden" animate="show">
              vida para o
            </motion.span>
          </span>
          <span className="mask-line">
            <motion.span custom={2} variants={line} initial="hidden" animate="show">
              seu{" "}
              <em className="font-playfair text-glow font-medium italic text-aqua">aquário.</em>
            </motion.span>
          </span>
        </h1>

        <motion.p
          {...fade(0.85)}
          className="mt-8 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg"
        >
          Peixes ornamentais, invertebrados e acessórios selecionados — do viveiro direto para o
          seu aquário, com envio seguro e orientação de quem entende de água.
        </motion.p>

        <motion.div {...fade(1)} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            data-testid="hero-cta-catalogo"
            onClick={() => scrollToId("catalogo")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-aqua px-8 py-4 text-sm font-bold uppercase tracking-wider text-navy transition-transform hover:scale-[1.03] active:scale-95"
          >
            Explorar catálogo
          </button>
          <a
            data-testid="hero-cta-whatsapp"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-whats/50 px-8 py-4 text-sm font-bold uppercase tracking-wider text-whats transition-colors hover:bg-whats/10"
          >
            <MessageCircle className="h-4 w-4" />
            Pedir no WhatsApp
          </a>
        </motion.div>
      </motion.div>

      <motion.button
        data-testid="hero-scroll-hint"
        onClick={() => scrollToId("categorias")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        aria-label="Rolar para baixo"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-aqua/70"
      >
        <ArrowDown className="float-soft h-5 w-5" />
      </motion.button>
    </section>
  );
};

export default Hero;
