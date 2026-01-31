import Image from "next/image";
import Link from "next/link";

const sliderLeft = ["/pocetna/prva_sekcija/1p1.jpeg", "/pocetna/prva_sekcija/1p2.jpeg", "/pocetna/prva_sekcija/1p3.jpeg", "/pocetna/prva_sekcija/1p4.jpeg", "/pocetna/prva_sekcija/1p5.jpeg", "/pocetna/prva_sekcija/1p6.jpeg", "/pocetna/prva_sekcija/1p7.jpeg", "/pocetna/prva_sekcija/1p8.jpeg", "/pocetna/prva_sekcija/1p9.jpeg", "/pocetna/prva_sekcija/1p10.jpeg"];
const sliderRight = ["/pocetna/druga_sekcija/2p1.jpeg", "/pocetna/druga_sekcija/2p2.jpeg", "/pocetna/druga_sekcija/2p3.jpeg", "/pocetna/druga_sekcija/2p4.jpeg", "/pocetna/druga_sekcija/2p5.jpeg", "/pocetna/druga_sekcija/2p6.jpeg", "/pocetna/druga_sekcija/2p7.jpeg", "/pocetna/druga_sekcija/2p8.jpeg", "/pocetna/druga_sekcija/2p9.jpeg", "/pocetna/druga_sekcija/2p10.jpeg"];

const trajnaSminkaSlike = [
  "/pocetna/trajna_sminka/trajna_sminka1.jpg",
  "/pocetna/trajna_sminka/trajna_sminka2.jpg",
  "/pocetna/trajna_sminka/trajna_sminka3.jpg",
  "/pocetna/trajna_sminka/trajna_sminka4.jpg",
  "/pocetna/trajna_sminka/trajna_sminka5.jpg",
  "/pocetna/trajna_sminka/trajna_sminka6.jpg",
  "/pocetna/trajna_sminka/trajna_sminka7.jpg",
  "/pocetna/trajna_sminka/trajna_sminka8.jpg"
];

export default function HomePage() {
  return (
    <main className="flex flex-col w-full overflow-x-hidden">

      <section className="relative w-full h-[75vh] bg-[var(--color-accent)] overflow-hidden">
        <Image
          src="/pocetna/glavna.jpg"
          alt="Glavna"
          fill
          priority
          className="object-cover glavna-fade"
        />
      </section>

      <section className="py-24 px-6 md:px-24 bg-[var(--color-accent)] relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-sm md:text-base uppercase tracking-[0.5em] text-[var(--color-primary)] font-bold mb-4 block">Edukacije</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--color-text)] uppercase tracking-tight">KURSEVI</h2>
          <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto mb-10"></div>
          <p className="text-lg md:text-1xl text-[var(--color-text)] leading-relaxed mb-12 font-light italic">
            Istraži dostupne kurseve i unapredi svoje veštine uz stručno vođene edukacije.
            Bilo da si početnik ili želiš da podigneš svoje znanje na viši nivo.
          </p>
          <Link
            href="/stranice/svi-kursevi"
            className="inline-block bg-[var(--color-primary)] text-white px-10 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-[var(--color-text)] transition-all transform hover:scale-105 shadow-2xl"
          >
            Pogledaj ponudu kurseva
          </Link>
        </div>
      </section>

      <section className="py-32 bg-[#FFFBE9] relative overflow-hidden group">
        <div className="text-center mb-24 relative z-20">
          <h2 className="text-6xl md:text-9xl font-serif font-black uppercase tracking-[0.1em] text-[var(--color-primary)] opacity-20 absolute -top-10 left-1/2 -translate-x-1/2 select-none">
            INSENSITIVO
          </h2>
          <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-[0.3em] text-[var(--color-primary)] relative z-10">
            INSENSITIVO
          </h2>
        </div>

        <div className="relative max-w-6xl mx-auto h-[500px] flex items-center justify-center">
          <div className="absolute w-56 h-72 md:w-64 md:h-80 bg-white p-3 shadow-2xl rounded-sm transition-all duration-700 z-10 rotate-[-18deg] -translate-x-12 group-hover:rotate-0 group-hover:-translate-x-[250%] hover:scale-110 hover:z-50">
            <div className="relative w-full h-full overflow-hidden border border-gray-100">
              <Image src="/pocetna/galerija/slika1.jpg" alt="1" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute w-56 h-72 md:w-64 md:h-80 bg-white p-3 shadow-2xl rounded-sm transition-all duration-700 z-20 rotate-[-8deg] -translate-x-6 group-hover:rotate-0 group-hover:-translate-x-[125%] hover:scale-110 hover:z-50">
            <div className="relative w-full h-full overflow-hidden border border-gray-100">
              <Image src="/pocetna/galerija/slika2.jpg" alt="2" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute w-56 h-72 md:w-64 md:h-80 bg-white p-3 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] rounded-sm transition-all duration-700 z-40 rotate-[3deg] group-hover:rotate-0 group-hover:translate-x-0 group-hover:scale-110 hover:z-50">
            <div className="relative w-full h-full overflow-hidden border border-gray-100">
              <Image src="/pocetna/galerija/slika3.jpg" alt="3" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute w-56 h-72 md:w-64 md:h-80 bg-white p-3 shadow-2xl rounded-sm transition-all duration-700 z-20 rotate-[12deg] translate-x-6 group-hover:rotate-0 group-hover:translate-x-[125%] hover:scale-110 hover:z-50">
            <div className="relative w-full h-full overflow-hidden border border-gray-100">
              <Image src="/pocetna/galerija/slika4.jpg" alt="4" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute w-56 h-72 md:w-64 md:h-80 bg-white p-3 shadow-2xl rounded-sm transition-all duration-700 z-10 rotate-[22deg] translate-x-12 group-hover:rotate-0 group-hover:translate-x-[250%] hover:scale-110 hover:z-50">
            <div className="relative w-full h-full overflow-hidden border border-gray-100">
              <Image src="/pocetna/galerija/slika5.jpg" alt="5" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#FFFBE9] relative border-t border-[var(--color-accent)]">
        <h2 className="naslov-sekcije">Moji radovi</h2>

        <div className="slider-container mb-8">
          <div className="slider-track">
            {[...sliderLeft, ...sliderLeft].map((src, idx) => (
              <div key={`sl-${idx}`} className="flex-shrink-0 w-[250px] h-[350px] relative px-2">
                <Image src={src} alt="Rad" fill className="object-cover rounded-2xl shadow-md transition-transform hover:scale-105" />
              </div>
            ))}
          </div>
        </div>

        <div className="slider-container">
          <div className="slider-track-reverse">
            {[...sliderRight, ...sliderRight].map((src, idx) => (
              <div key={`sr-${idx}`} className="flex-shrink-0 w-[250px] h-[350px] relative px-2">
                <Image src={src} alt="Rad" fill className="object-cover rounded-2xl shadow-md transition-transform hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#FFFBE9] px-6 border-t border-[var(--color-accent)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="naslov-sekcije">Trajna šminka</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {trajnaSminkaSlike.map((src, idx) => (
              <div
                key={`trajna-${idx}`}
                className="trajna-sminka-card float-item h-[250px] md:h-[350px]"
                style={{ animationDelay: `${idx * 0.3}s` }}
              >
                <Image
                  src={src}
                  alt={`Trajna šminka ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}