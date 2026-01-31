"use client";
import RoleGuard from "../../components/RoleGuard";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoUpload } from "../../components/VideoUpload"; 
import { kreirajKompletanKurs } from "@/app/actions/kurs"; 
import Image from "next/image";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function DodajKursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [kursData, setKursData] = useState({ naziv: "", opis: "", cena: "", kategorija: "", slika: "" });
  const [lekcije, setLekcije] = useState<any[]>([]);
  const [trenutnaLekcija, setTrenutnaLekcija] = useState({ naziv: "", opis: "", video: "", trajanje: "" });

  const handleDodajLekcijuUListu = () => {
    if (!trenutnaLekcija.naziv.trim()) return setNotification({ message: "Unesite naziv lekcije!", type: "error" });
    if (!trenutnaLekcija.trajanje || Number(trenutnaLekcija.trajanje) <= 0) return setNotification({ message: "Unesite ispravno trajanje lekcije!", type: "error" });
    if (!trenutnaLekcija.opis.trim()) return setNotification({ message: "Unesite opis lekcije!", type: "error" });
    if (!trenutnaLekcija.video) return setNotification({ message: "Morate prvo otpremiti video!", type: "error" });

    setLekcije(prev => [...prev, trenutnaLekcija]);
    setTrenutnaLekcija({ naziv: "", opis: "", video: "", trajanje: "" });
    setNotification(null); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kursData.naziv || !kursData.opis || !kursData.cena || !kursData.kategorija) {
      return setNotification({ message: "Popunite sva polja za kurs!", type: "error" });
    }
    if (!kursData.slika) return setNotification({ message: "Otpremite naslovnu sliku!", type: "error" });
    if (lekcije.length === 0) return setNotification({ message: "Dodajte bar jednu lekciju u listu!", type: "error" });

    setLoading(true);
    try {
      const rezultat = await kreirajKompletanKurs({ ...kursData, lekcije });
      if (rezultat.success) {
        setNotification({ message: "Kurs je uspešno objavljen!", type: "success" });
        setTimeout(() => router.push("/stranice/svi-kursevi"), 2000);
      } else {
        setNotification({ message: rezultat.error || "Došlo je do greške.", type: "error" });
      }
    } catch (err) {
      setNotification({ message: "Problem sa serverom. Pokušajte opet.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
        <RoleGuard allowedRoles={["EDUKATOR"]}>{
    
    <div className="auth-wrap" style={{ display: 'block', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-[--color-accent] flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-200">
            <div className={`mb-4 p-3 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {notification.type === "success" ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
            </div>
            <p className="text-lg font-bold text-center text-[--color-text] mb-6">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="auth-btn !mt-0 !py-2 !px-10">Zatvori</button>
          </div>
        </div>
      )}

      <div className="auth-card" style={{ maxWidth: '850px', margin: '40px auto', display: 'block' }}>
        <h1 className="text-2xl font-bold mb-6 text-[--color-primary] border-b border-[--color-accent] pb-2 text-center uppercase tracking-widest">
          Novi Makeup Kurs
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div>
                <label className="contact-label">Naziv Kursa</label>
                <input required className="auth-input" value={kursData.naziv} onChange={(e) => setKursData(p => ({ ...p, naziv: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="contact-label">Cena (€)</label>
                  <input required type="number" min="0" step="0.01" className="auth-input" value={kursData.cena} onChange={(e) => setKursData(p => ({ ...p, cena: e.target.value }))} />
                </div>
                <div>
                  <label className="contact-label">Kategorija</label>
                  <input required className="auth-input" value={kursData.kategorija} onChange={(e) => setKursData(p => ({ ...p, kategorija: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="contact-label">Naslovna slika</label>
              {!kursData.slika ? (
                <VideoUpload label="Postavi sliku" onUploadSuccess={(url) => setKursData(p => ({ ...p, slika: url }))} />
              ) : (
                <div className="relative h-32 w-full rounded-2xl overflow-hidden border-2 border-[--color-accent]">
                  <Image src={kursData.slika} alt="P" fill className="object-cover" />
                  <button type="button" onClick={() => setKursData(p => ({ ...p, slika: "" }))} className="absolute top-1 right-1 bg-white text-red-500 w-6 h-6 rounded-full font-bold shadow-md">X</button>
                </div>
              )}
            </div>
          </div>
          <div className="text-left">
            <label className="contact-label">Glavni opis kursa</label>
            <textarea required className="auth-input min-h-[80px]" value={kursData.opis} onChange={(e) => setKursData(p => ({ ...p, opis: e.target.value }))} />
          </div>

          <hr className="border-[--color-accent] opacity-30" />

          <div className="p-5 rounded-3xl border-2 border-dashed border-[--color-secondary] space-y-4 text-left bg-white/30">
            <h2 className="text-lg font-bold text-[--color-primary] text-center italic underline">Dodaj Video Lekciju</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="auth-input" placeholder="Naziv lekcije *" value={trenutnaLekcija.naziv} onChange={(e) => setTrenutnaLekcija(p => ({ ...p, naziv: e.target.value }))} />
              <input className="auth-input" type="number" min="1" placeholder="Trajanje (min) *" value={trenutnaLekcija.trajanje} onChange={(e) => setTrenutnaLekcija(p => ({ ...p, trajanje: e.target.value }))} />
            </div>
            <textarea className="auth-input min-h-[60px]" placeholder="Opis ove lekcije *" value={trenutnaLekcija.opis} onChange={(e) => setTrenutnaLekcija(p => ({ ...p, opis: e.target.value }))} />
            {!trenutnaLekcija.video ? (
              <VideoUpload label="Postavi Video *" onUploadSuccess={(url) => setTrenutnaLekcija(p => ({ ...p, video: url }))} />
            ) : (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center font-bold text-sm border border-green-200">✅ Video otpremljen</div>
            )}
            <button type="button" onClick={handleDodajLekcijuUListu} className="auth-btn !py-2 !mt-0 bg-[--color-secondary] hover:bg-[--color-primary]">+ Dodaj u listu lekcija</button>
          </div>

          {lekcije.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-[--color-primary] ml-2">Lekcije spremne za slanje ({lekcije.length}):</p>
              {lekcije.map((l, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[--color-accent] shadow-sm">
                  <div>
                    <span className="text-sm font-bold block">{idx + 1}. {l.naziv} ({l.trajanje} min)</span>
                    <span className="text-xs text-gray-400 italic">{l.opis.substring(0, 50)}...</span>
                  </div>
                  <button type="button" onClick={() => setLekcije(p => p.filter((_, i) => i !== idx))}><X size={18} className="text-red-400" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="auth-btn !py-4 text-lg shadow-xl uppercase font-black tracking-widest disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "OBJAVI KOMPLETAN KURS"}
            </button>
          </div>
        </form>
      </div>
    </div>
}</RoleGuard>
  );
}