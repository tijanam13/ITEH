"use client";

import { useEffect, useState, Suspense } from "react";
import RoleGuard from "../../components/RoleGuard";
import { fetchEdukatorProdaja } from "@/lib/edukatorClient";
import { Mail } from "lucide-react";

export default function PregledProdajeKursevaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFBE9] flex justify-center items-center text-[#AD8B73] font-bold">
        Učitavanje stranice...
      </div>
    }>
      <PregledProdajeContent />
    </Suspense>
  );
}

function PregledProdajeContent() {
  const [kurseviSaKlijentima, setKurseviSaKlijentima] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchEdukatorProdaja();
        if (res.success) {
          setKurseviSaKlijentima(res.data || []);
        } else {
          setError(res.error || "Greška.");
        }
      } catch (err: any) {
        setError(err?.message || "Greška.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      <div className="min-h-screen bg-[#FFFBE9] p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-[#4a3f35] mb-2">
              Pregled prodaje po kursevima
            </h1>
            <p className="text-[#AD8B73] font-medium">
              Spisak korisnika koji su kupili Vaše kurseve.
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center p-10 text-[#AD8B73] font-bold">
              Učitavanje podataka o prodaji...
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          ) : kurseviSaKlijentima.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E3CAA5]">
              <p className="text-[#AD8B73] text-xl font-semibold">
                Još uvek niste kreirali kurseve ili nemate prodaja.
              </p>
            </div>
          ) : (
            kurseviSaKlijentima.map((k, idx) => (
              <div key={idx} className="mb-10">
                <h2 className="text-2xl font-bold text-[#4a3f35] mb-4 flex flex-wrap items-center gap-2">
                  {k.naziv}
                  <span className="text-xl font-bold text-[#AD8B73]">
                    (Broj klijenata: {k.klijenti ? k.klijenti.length : 0})
                  </span>
                </h2>

                {!k.klijenti || k.klijenti.length === 0 ? (
                  <p className="text-[#AD8B73] mb-4">Još uvek niko nije kupio ovaj kurs.</p>
                ) : (
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E3CAA5]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#AD8B73] text-white">
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Klijent</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Kontakt</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Metod</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Status</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider text-center">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3CAA5]">
                          {k.klijenti.map((kl: any, i: number) => (
                            <tr key={i} className="hover:bg-[#FFFBE9]/50 transition-colors">
                              <td className="p-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#E3CAA5] rounded-full flex items-center justify-center text-[#AD8B73] font-bold">
                                    {kl.klijentIme?.[0]}{kl.klijentPrezime?.[0]}
                                  </div>
                                  <span className="font-bold text-[#4a3f35]">
                                    {kl.klijentIme} {kl.klijentPrezime}
                                  </span>
                                </div>
                              </td>
                              <td className="p-5">
                                <div className="flex items-center gap-2 text-[#AD8B73]">
                                  <Mail size={16} />
                                  <span className="text-sm">{kl.klijentEmail}</span>
                                </div>
                              </td>
                              <td className="p-5">
                                <span className="font-medium text-[#4a3f35] text-sm">{kl.metodPlacanja}</span>
                              </td>
                              <td className="p-5">
                                <span className="font-medium text-[#4a3f35] text-sm">{kl.statusPlacanja}</span>
                              </td>
                              <td className="p-5 text-center">
                                <span className="text-sm font-bold text-[#AD8B73]">
                                  {kl.datumKupovine ? new Date(kl.datumKupovine).toLocaleDateString("sr-RS") : "/"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}