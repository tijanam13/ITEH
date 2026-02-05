"use client";

import RoleGuard from "../../components/RoleGuard";
import { useEffect, useState, Suspense } from "react";
import { fetchKursevi, getKursSaLekcijama, obrisiKurs } from "@/lib/kurseviClient";
import Image from "next/image";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock,
  Search,
  User
} from "lucide-react";

export default function BrisanjeKursevaPage() {
  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      <Suspense
        fallback={
          <div className="auth-wrap flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-[--color-primary]" size={50} />
          </div>
        }
      >
        <BrisanjeKursevaSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}

function BrisanjeKursevaSadrzaj() {
  const [kursevi, setKursevi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedKurs, setSelectedKurs] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    osveziListu();
  }, []);

  const osveziListu = async () => {
    setLoading(true);
    try {
      const res: any = await fetchKursevi();
      setKursevi(res.kursevi || []);
    } catch (err) {
      setNotification({
        message: "Greška pri učitavanju liste.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDelete = async (id: string) => {
    setLoadingDetails(id);
    try {
      const detalji = await getKursSaLekcijama(id);
      setSelectedKurs(detalji);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setNotification({ message: "Greška pri učitavanju detalja.", type: "error" });
    } finally {
      setLoadingDetails(null);
    }
  };

  const izvrsiBrisanje = async () => {
    if (!selectedKurs) return;
    setIsDeleting(true);
    try {
      const res = await obrisiKurs(selectedKurs.id);
      if (res.success) {
        setNotification({ message: "Kurs je uspešno obrisan!", type: "success" });
        setSelectedKurs(null);
        osveziListu();
      } else {
        setNotification({
          message: res.error || "Greška pri brisanju.",
          type: "error",
        });
      }
    } catch {
      setNotification({ message: "Problem sa serverom.", type: "error" });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filtriraniKursevi = kursevi.filter((k) =>
    k.naziv.toLowerCase().includes(search.toLowerCase()) ||
    k.kategorija.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="auth-wrap !block min-h-screen !p-0 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-10">

        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-[5000] p-4 bg-black/40 backdrop-blur-[2px]">
            <div className="auth-card flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-300">
              <div className={`mb-4 p-4 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {notification.type === "success" ? <CheckCircle size={48} className="text-green-500" /> : <AlertTriangle size={48} className="text-red-500" />}
              </div>
              <p className="text-xl font-bold text-center text-[--color-text] mb-6 uppercase tracking-tight">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="auth-btn !mt-0 !py-2 !px-8">Zatvori</button>
            </div>
          </div>
        )}

        {selectedKurs ? (
          <div className="animate-in slide-in-from-bottom-10 duration-500 max-w-4xl mx-auto py-10">
            <button
              onClick={() => setSelectedKurs(null)}
              className="mb-8 flex items-center gap-2 bg-[#4a3f35] text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:bg-[#AD8B73] transition-all uppercase text-xs tracking-widest border-2 border-white/20"
            >
              <ArrowLeft size={18} /> Odustani i vrati se na listu
            </button>

            <div className="auth-card !max-w-none border-t-8 border-red-500">
              <h1 className="text-2xl font-bold mb-8 text-[--color-primary] border-b border-[--color-accent] pb-2 text-center uppercase tracking-widest">
                Konačna provera pre brisanja
              </h1>

              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="auth-label">Naziv Kursa</label>
                      <div className="auth-input !bg-white/70">{selectedKurs.naziv}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="auth-label">Cena (€)</label>
                        <div className="auth-input !bg-white/70">{selectedKurs.cena}</div>
                      </div>
                      <div>
                        <label className="auth-label">Kategorija</label>
                        <div className="auth-input !bg-white/70">{selectedKurs.kategorija}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="auth-label">Naslovna slika</label>
                    <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-[--color-accent]">
                      <Image src={selectedKurs.slika} alt="Preview" fill className="object-cover" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="auth-label">Opis kursa</label>
                  <div className="auth-input !bg-white/70 min-h-[100px] leading-relaxed text-sm italic">
                    {selectedKurs.opis}
                  </div>
                </div>

                <div className="p-6 rounded-3xl border-2 border-dashed border-[--color-secondary] bg-white/40">
                  <h2 className="text-lg font-bold text-[--color-primary] text-center italic underline mb-6 uppercase tracking-tight">
                    Lekcije koje će biti obrisane
                  </h2>
                  <div className="space-y-3">
                    {selectedKurs.lekcije?.map((l: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-[#FFFBE9] p-4 rounded-2xl border border-[--color-accent] shadow-sm">
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-[--color-text]">{l.naziv}</span>
                          <span className="text-[10px] text-gray-400 italic">Lekcija {idx + 1}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[--color-secondary] flex items-center gap-1 uppercase tracking-widest">
                          <Clock size={14} /> {l.trajanje} sekunde
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                  <button onClick={() => setSelectedKurs(null)} className="auth-btn !mt-0 !bg-[#4a3f35] text-white shadow-xl hover:bg-[#AD8B73]">
                    ODUSTANI OD BRISANJA
                  </button>
                  <button onClick={izvrsiBrisanje} disabled={isDeleting} className="auth-btn !mt-0 !bg-red-600 hover:!bg-red-700 shadow-xl">
                    {isDeleting ? <Loader2 className="animate-spin" size={24} /> : (
                      <span className="flex items-center gap-2 font-black uppercase tracking-widest"><Trash2 size={22} /> Potvrdi brisanje</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 auth-card !max-w-none">
              <h1 className="text-3xl font-bold text-[--color-primary] uppercase tracking-widest">
                Brisanje Mojih Kurseva
              </h1>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-primary]" size={20} />
                <input
                  type="text"
                  placeholder="Pretraži kurseve..."
                  className="auth-input pl-10"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="auth-card text-center py-20">Učitavanje kurseva...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtriraniKursevi.map((k) => (
                  <div key={k.id} className="auth-card !p-0 overflow-hidden flex flex-col hover:shadow-2xl transition-all group">
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image src={k.slika || "/placeholder.jpg"} alt={k.naziv} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-[--color-secondary] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {k.kategorija}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow text-left">
                      <h2 className="text-xl font-bold text-[--color-text] mb-2 uppercase tracking-tighter line-clamp-1">{k.naziv}</h2>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2 italic">
                        {k.opis}
                      </p>

                      <div className="flex items-center gap-2 mb-6">
                        <User size={14} className="text-[--color-primary]" />
                        <span className="text-xs font-bold text-[--color-primary]">{k.edukatorIme} {k.edukatorPrezime}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[--color-accent] pt-4 mt-auto">
                        <span className="text-xl font-black text-[--color-primary]">{k.cena} €</span>
                        <button
                          onClick={() => handleReviewDelete(k.id)}
                          className="bg-red-50 text-red-500 border-2 border-red-100 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 px-4 font-bold text-xs uppercase"
                        >
                          {loadingDetails === k.id ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> Obriši</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtriraniKursevi.length === 0 && !loading && (
              <div className="auth-card !max-w-none text-center py-20 italic font-bold text-[--color-primary]">
                Nije pronađen nijedan kurs.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}