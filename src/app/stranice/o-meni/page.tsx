import Image from "next/image";

const sertifikati = [
  {
    id: 1,
    src: "/o_meni/sertifikati/s1.jpg",
    title: "Masterclass: Glamour Look",
    desc: "Specijalan kurs za svečanu šminku visoke pokrivne moći i elegancije. Tokom kursa uči se pravilna priprema lica, kombinovanje boja, naglašavanje očiju i usana, kao i profesionalni trikovi za dugotrajan i besprekoran izgled."
  },
  {
    id: 2,
    src: "/o_meni/sertifikati/s2.jpg",
    title: "Puder obrve obuka",
    desc: "Obuka za puder obrve namenjena savladavanju tehnike trajnog šminkanja obrva sa prirodnim, senčenim efektom. Tokom obuke polaznici nauče pravilno oblikovanje obrva, izbor pigmenata, rad sa aparatom, kao i higijenske i bezbednosne standarde."
  },
  {
    id: 3,
    src: "/o_meni/sertifikati/s3.jpg",
    title: "Trajna šminka",
    desc: "Kurs trajne šminke koji pruža savladavanje tehnike estetskog iscrtavanja obrva, usana i ajlajnera uz dugotrajan i prirodan efekat. Polaznici tokom kursa prolaze kroz teoriju o koži, pigmentima i higijeni, kao i praktičan rad na modelima."
  },
];

export default function ONama() {
  return (
    <main className="min-h-screen bg-[#FFFBE9]">

      <section className="pt-20 pb-10 px-6 text-center max-w-3xl mx-auto">
        <span className="text-[var(--color-primary)] uppercase tracking-[0.3em] text-xs font-bold block mb-3">
          Upoznajte šminkerku
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
          Šminka je <span className="italic font-serif text-[var(--color-primary)]">umetnost</span>
        </h1>
        <div className="w-16 h-0.5 bg-[var(--color-accent)] mx-auto"></div>
      </section>

      <section className="pb-24 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

        <div className="relative group w-full max-w-[380px] aspect-[3/4] flex-shrink-0">
          <div className="absolute -top-5 -left-5 w-full h-full bg-[var(--color-accent)] rounded-sm transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
          <div className="absolute -bottom-5 -right-5 w-full h-full border border-[var(--color-primary)] rounded-sm z-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>

          <div className="relative w-full h-full overflow-hidden shadow-xl z-10 bg-white p-2">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/o_meni/sminkerka.jpg"
                alt="Šminkerka"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="relative pl-8 border-l border-[var(--color-accent)]">
            <p className="text-lg text-[var(--color-text)] leading-relaxed mb-6">
              Šminkanje je moj način izražavanja i moja svakodnevna inspiracija. Kroz rad sa različitim ženama naučila sam da prava lepota ne leži u savršenstvu, već u autentičnosti i samopouzdanju. Verujem u šminku koja naglašava prirodne crte, prati ličnost i čini da se svaka žena oseća lepo, sigurno i svoja.
            </p>

            <p className="text-lg text-[var(--color-text)] leading-relaxed italic opacity-90">
              Nakon stotina zadovoljnih klijentkinja i brojnih održanih masterclass-ova, kreirala sam kurseve šminkanja namenjene svima koji žele da savladaju tehnike za svakodnevnu šminku, ali i da unaprede postojeće znanje kroz napredne metode.
            </p>
          </div>

          <div className="flex items-center gap-8 md:gap-10 pt-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--color-primary)]">5+</span>
              <span className="text-[10px] uppercase tracking-widest opacity-60">Godina rada</span>
            </div>
            <div className="w-px h-10 bg-[var(--color-accent)]"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--color-primary)]">500+</span>
              <span className="text-[10px] uppercase tracking-widest opacity-60">Klijentkinja</span>
            </div>
            <div className="w-px h-10 bg-[var(--color-accent)]"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--color-primary)]">5+</span>
              <span className="text-[10px] uppercase tracking-widest opacity-60">Sertifikata</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/40 border-y border-[var(--color-accent)]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--color-text)]">
              Edukacija
            </h2>
            <div className="w-12 h-0.5 bg-[var(--color-primary)] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {sertifikati.map((s) => (
              <div key={s.id} className="text-center group">
                <div className="relative w-full aspect-[3/4] max-w-[320px] mx-auto mb-8 transition-transform duration-500 group-hover:-translate-y-3">

                  <div className="absolute inset-0 bg-[var(--color-accent)]/15 rounded-sm -rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>

                  <div className="relative w-full h-full border border-[var(--color-accent)]/20 shadow-xl overflow-hidden bg-white p-1">
                    <Image
                      src={s.src}
                      alt={s.title}
                      fill
                      className="object-cover z-10"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-[var(--color-primary)] mb-2 uppercase tracking-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--color-text)] opacity-70 leading-relaxed px-4">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}