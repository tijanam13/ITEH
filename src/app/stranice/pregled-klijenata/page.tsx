import RoleGuard from "../../components/RoleGuard";
import { db } from "@/db/index";
import { kupljeniKursevi, kurs, korisnik } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { User, Mail, BookOpen, Calendar } from "lucide-react";

export default async function PregledKlijenataPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  if (!token) redirect("/prijava");

  let edukatorId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, uloga: string };

    if (decoded.uloga !== "EDUKATOR" && decoded.uloga !== "ADMIN") {
      redirect("/");
    }

    edukatorId = decoded.sub;
  } catch (err) {
    redirect("/prijava");
    return null;
  }

  const mojiKlijenti = await db
    .select({
      klijentIme: korisnik.ime,
      klijentPrezime: korisnik.prezime,
      klijentEmail: korisnik.email,
      nazivKursa: kurs.naziv,
      datumKupovine: kupljeniKursevi.datum,
    })
    .from(kupljeniKursevi)
    .innerJoin(kurs, eq(kupljeniKursevi.kursId, kurs.id))
    .innerJoin(korisnik, eq(kupljeniKursevi.korisnikId, korisnik.id))
    .where(eq(kurs.edukator, edukatorId))
    .orderBy(desc(kupljeniKursevi.datum));

  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>{

      <div className="min-h-screen bg-[#FFFBE9] p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-[#4a3f35] mb-2">
              Pregled klijenata
            </h1>
            <p className="text-[#AD8B73] font-medium">
              Spisak korisnika koji prate Vaše kurseve
            </p>
          </header>

          {mojiKlijenti.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E3CAA5]">
              <p className="text-[#AD8B73] text-xl font-semibold">
                Još uvek niko nije kupio Vaše kurseve.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E3CAA5]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#AD8B73] text-white">
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Klijent</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Kontakt</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Kupljeni Kurs</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider text-center">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3CAA5]">
                    {mojiKlijenti.map((k, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[#FFFBE9]/50 transition-colors"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E3CAA5] rounded-full flex items-center justify-center text-[#AD8B73] font-bold">
                              {k.klijentIme[0]}{k.klijentPrezime[0]}
                            </div>
                            <span className="font-bold text-[#4a3f35]">
                              {k.klijentIme} {k.klijentPrezime}
                            </span>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2 text-[#AD8B73]">
                            <Mail size={16} />
                            <span className="text-sm">{k.klijentEmail}</span>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-[#AD8B73]" />
                            <span className="font-medium text-[#4a3f35]">{k.nazivKursa}</span>
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Kupljeno:</span>
                            <span className="text-sm font-bold text-[#AD8B73]">
                              {new Date(k.datumKupovine).toLocaleDateString("sr-RS")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#AD8B73] text-white p-6 rounded-3xl shadow-lg">
              <p className="text-sm opacity-80 font-bold uppercase">Ukupno klijenata</p>
              <p className="text-4xl font-black">{mojiKlijenti.length}</p>
            </div>
          </div>
        </div>
      </div>
    }</RoleGuard>

  );
}