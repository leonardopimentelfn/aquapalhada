import Marquee from "react-fast-marquee";

const WORDS = [
  "Bettas",
  "Guppys",
  "Tétradas Neon",
  "Acarás Disco",
  "Camarões",
  "Caramujos",
  "Raçoes",
  "Filtros",
  "Plantas Naturais",
];

const EditorialMarquee = () => (
  <section aria-hidden="true" className="overflow-hidden border-y border-aqua/10 bg-navy-800/40 py-10 md:py-14">
    <Marquee speed={35} gradient gradientColor="#050B14" gradientWidth={100} autoFill>
      <span className="mx-8 whitespace-nowrap text-6xl font-black uppercase tracking-widest text-aqua/10 md:text-8xl">
        {WORDS.join("  •  ")}
      </span>
    </Marquee>
  </section>
);

export default EditorialMarquee;
