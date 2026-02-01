"use client";

import RoleGuard from "../../components/RoleGuard";
import { useEffect, useState } from "react";
import { getKurseviEdukatora, getKursSaLekcijama, obrisiKurs } from "@/app/actions/kurs";
import Image from "next/image";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
  Clock,
  Euro,
  Tag
} from "lucide-react";

export default function BrisanjeKursevaPage() {
  const [kursevi, setKursevi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [selectedKurs, setSelectedKurs] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    osveziListu();
  }, []);

  const osveziListu = async () => {
    setLoading(true);
    const res = await getKurseviEdukatora();
    setKursevi(res);
    setLoading(false);
  };

  const handleReviewDelete = async (id: string) => {
    setLoadingDetails(true);
    try {
      const detalji = await getKursSaLekcijama(id);
      setSelectedKurs(detalji);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setNotification({ message: "Greška pri učitavanju detalja.", type: "error" });
    } finally {
      setLoadingDetails(false);
    }
  };

  const izvrsiBrisanje = async () => {
    if (!selectedKurs) return;
    setIsDeleting(true);
    const res = await obrisiKurs(selectedKurs.id);

    if (res.success) {
      setNotification({ message: "Kurs je uspešno obrisan!", type: "success" });
      setKursevi(prev => prev.filter(k => k.id !== selectedKurs.id));
      setSelectedKurs(null);
    } else {
      setNotification({ message: res.error || "Greška pri brisanju.", type: "error" });
    }
    setIsDeleting(false);
  };

  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      <div className="auth-wrap !block overflow-y-auto">

        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40 backdrop-blur-sm">
            <div className="auth-card flex flex-col items-center max-w-sm text-center animate-in zoom-in duration-200">
              <div className={`mb-4 p-3 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                {notification.type === "success" ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
              </div>
              <p className="text-lg font-bold mb-6 uppercase tracking-tight text-[--color-text]">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="auth-btn !mt-0 !py-2 !px-10">Zatvori</button>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 py-10">

          {!selectedKurs ? (
            <div className="auth-card !max-w-none mb-10 text-center">
              <h1 className="text-2xl font-bold text-[--color-primary] border-b-2 border-[--color-accent] pb-2 uppercase tracking-widest inline-block">
                Brisanje Mojih Kurseva
              </h1>
              <p className="text-[--color-text] mt-4 text-sm font-semibold opacity-80 italic">
                Kliknite na kurs koji želite da obrišete i proverite podatke.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setSelectedKurs(null)}
              className="mb-8 flex items-center gap-2 bg-[#4a3f35] text-white font-bold py-3 px-8 rounded-2xl shadow-2xl hover:bg-[--color-primary] transition-all uppercase text-xs tracking-widest border-2 border-white/20"
            >
              <ArrowLeft size={18} /> Nazad na listu svih kurseva
            </button>
          )}

          {!selectedKurs && (
            loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={50} /></div>
            ) : kursevi.length === 0 ? (
              <div className="auth-card !max-w-none text-center py-20 border-4 border-dashed border-[--color-primary]/30">
                <BookOpen size={50} className="mx-auto text-[--color-primary] opacity-20 mb-4" />
                <p className="text-[--color-primary] font-bold uppercase tracking-widest">Trenutno nemate objavljenih kurseva</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
                {kursevi.map((k) => (
                  <div key={k.id} className="auth-card !p-0 overflow-hidden group cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-[--color-primary]" onClick={() => handleReviewDelete(k.id)}>
                    <div className="relative h-48 w-full">
                      <Image src={k.slika} alt={k.naziv} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-red-500 text-white p-4 rounded-full shadow-2xl">
                          <Trash2 size={30} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={12} className="text-[--color-primary]" />
                        <span className="text-[10px] font-black text-[--color-secondary] uppercase tracking-widest">{k.kategorija}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[--color-text] uppercase tracking-tighter truncate">{k.naziv}</h3>
                      <div className="mt-4 flex justify-between items-center border-t border-[--color-accent] pt-4">
                        <span className="text-base font-black text-[--color-primary] flex items-center gap-1"><Euro size={14} />{k.cena}</span>
                        <span className="text-[10px] font-bold text-[--color-primary] uppercase tracking-widest">Detalji &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {selectedKurs && (
            <div className="auth-card !max-w-[850px] mx-auto animate-in slide-in-from-bottom-10 duration-500 border-t-8 border-red-500">
              <h1 className="text-2xl font-bold mb-8 text-[--color-primary] border-b border-[--color-accent] pb-2 text-center uppercase tracking-widest">
                Konačna provera podataka
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
                    <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-[--color-accent] shadow-inner">
                      <Image src={selectedKurs.slika} alt="P" fill className="object-cover" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="auth-label">Opis kursa</label>
                  <div className="auth-input !bg-white/70 min-h-[100px] leading-relaxed">
                    {selectedKurs.opis}
                  </div>
                </div>

                <div className="p-6 rounded-3xl border-2 border-dashed border-[--color-secondary] bg-white/40">
                  <h2 className="text-lg font-bold text-[--color-primary] text-center italic underline mb-6 uppercase tracking-tight">Sadržaj kursa</h2>

                  <div className="space-y-3">
                    {selectedKurs.lekcije?.map((l: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-[--color-bg] p-4 rounded-2xl border border-[--color-accent] shadow-sm">
                        <div className="flex flex-col">
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
                  <button
                    type="button"
                    onClick={() => setSelectedKurs(null)}
                    className="auth-btn !mt-0 !bg-[#4a3f35] text-white shadow-xl hover:bg-[--color-primary]"
                  >
                    ODUSTANI OD BRISANJA
                  </button>
                  <button
                    onClick={izvrsiBrisanje}
                    disabled={isDeleting}
                    className="auth-btn !mt-0 !bg-red-600 hover:!bg-red-700 shadow-xl"
                  >
                    {isDeleting ? <Loader2 className="animate-spin" size={24} /> : (
                      <span className="flex items-center gap-2">
                        <Trash2 size={22} /> POTVRDI BRISANJE IZ BAZE
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}