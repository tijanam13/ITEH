"use client";

import { useState, useEffect, Suspense } from "react";
import { Mail, BookOpen } from "lucide-react";
import RoleGuard from "../../components/RoleGuard";
import { fetchEdukatorKlijenti } from "@/lib/edukatorClient";

interface Klijent {
  korisnikId: string;
  ime: string;
  prezime: string;
  email: string;
  brojKurseva: number;
}

export default function PregledKlijenataPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFBE9] flex justify-center items-center text-[#AD8B73] font-bold">
        Učitavanje...
      </div>
    }>
      <PregledKlijenataContent />
    </Suspense>
  );
}

function PregledKlijenataContent() {
  const [klijenti, setKlijenti] = useState<Klijent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchEdukatorKlijenti();
        if (res.success) {
          setKlijenti(res.data || []);
        } else {
          setError(res.error || "Greška pri učitavanju klijenata.");
        }
      } catch (err: any) {
        setError(err?.message || "Došlo je do greške.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtrirani = klijenti.filter(
    (k) =>
      k.ime.toLowerCase().includes(query.toLowerCase()) ||
      k.prezime.toLowerCase().includes(query.toLowerCase()) ||
      k.email.toLowerCase().includes(query.toLowerCase())
  );

  const ukupnoKlijenata = klijenti.length;

  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      <div className="min-h-screen bg-[#FFFBE9] p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-[#4a3f35] mb-2">
              Pregled klijenata
            </h1>
            <p className="text-[#AD8B73] font-medium">
              Spisak klijenata koji prate Vaše kurseve.
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center p-10 text-[#AD8B73] font-bold">
              Učitavanje podataka...
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          ) : klijenti.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E3CAA5]">
              <p className="text-[#AD8B73] text-xl font-semibold">
                Još uvek niko nije kupio Vaše kurseve.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pretraži po imenu, prezimenu ili emailu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-4 rounded-3xl border-2 border-[#E3CAA5] focus:outline-none focus:ring-2 focus:ring-[#AD8B73] bg-white placeholder:text-[#AD8B73] text-[#4a3f35] font-medium"
              />

              <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-[#E3CAA5]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#AD8B73] text-white">
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Klijent</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Kontakt</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider text-center">Broj kurseva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3CAA5]">
                    {filtrirani.map((k) => (
                      <tr key={k.korisnikId} className="hover:bg-[#FFFBE9]/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E3CAA5] rounded-full flex items-center justify-center text-[#AD8B73] font-bold">
                              {k.ime[0]}{k.prezime[0]}
                            </div>
                            <span className="font-bold text-[#4a3f35]">{k.ime} {k.prezime}</span>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2 text-[#AD8B73]">
                            <Mail size={16} />
                            <span className="text-sm">{k.email}</span>
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <BookOpen size={16} className="text-[#AD8B73]" />
                            <span className="font-medium text-[#4a3f35]">{k.brojKurseva}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtrirani.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-[#AD8B73]">
                          Nema rezultata za pretragu "{query}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#AD8B73] text-white p-6 rounded-3xl shadow-lg">
              <p className="text-sm opacity-80 font-bold uppercase">Ukupan broj klijenata</p>
              <p className="text-4xl font-black">{ukupnoKlijenata}</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}