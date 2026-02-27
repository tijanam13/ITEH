"use client";

import { useState, useEffect } from "react";
import { sacuvajNapredak } from "../actions/napredak";
import { CheckCircle, PlayCircle, Circle } from "lucide-react";
import { escapeHtml } from "../utils/sanitize";

export default function VideoPlayer({
  lekcije,
  korisnikId,
  inicijalniNapredak
}: {
  lekcije: any[],
  korisnikId: string,
  inicijalniNapredak: string[]
}) {
  const [aktivnaLekcija, setAktivnaLekcija] = useState(lekcije[0]);
  const [zavrseneLekcije, setZavrseneLekcije] = useState<string[]>([]);

  // Sinhronizacija sa inicijalnim podacima iz baze
  useEffect(() => {
    if (inicijalniNapredak) {
      const stringifiedNapredak = inicijalniNapredak.map(id => String(id));
      setZavrseneLekcije(stringifiedNapredak);
    }
  }, [inicijalniNapredak]);

  // Kalkulacija procenta
  const procenat = lekcije.length
    ? Math.round((zavrseneLekcije.length / lekcije.length) * 100)
    : 0;

 // ... unutar VideoPlayer komponente
const [isSaving, setIsSaving] = useState(false);

async function handleVideoEnded(lekcijaId: any) {
  const idStr = String(lekcijaId);
  
  // LOG ZA DEBUG
  console.log("Video završen. KorisnikId:", korisnikId, "isSaving:", isSaving);

  if (isSaving) return; 
  if (zavrseneLekcije.includes(idStr)) return;

  // Ako korisnikId i dalje ne stiže, privremeno skloni !korisnikId provere 
  // jer server action ionako sam vadi ID iz tokena.
  
  setIsSaving(true);
  setZavrseneLekcije(prev => [...prev, idStr]);

  try {
    console.log("Šaljem napredak na server za lekciju:", idStr);
    const res = await sacuvajNapredak(idStr);
    console.log("Rezultat sa servera:", res);
    
    if (!res.success) {
      setZavrseneLekcije(prev => prev.filter(id => id !== idStr));
      console.error("Greška:", res.error);
    }
  } catch (e) {
    console.error("Napredak save error", e);
  } finally {
    setIsSaving(false);
  }
}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* VIDEO SEKCIJA */}
      <div className="lg:col-span-3">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-[#AD8B73]">
          <video
            key={aktivnaLekcija.id}
            controls
            controlsList="nodownload"
            className="w-full h-full"
            src={aktivnaLekcija.video}
            onEnded={() => handleVideoEnded(aktivnaLekcija.id)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              // Ako ostane manje od 0.5 sekundi do kraja, pokreni završetak (sigurnosna mera)
              if (v.currentTime > 0 && v.duration - v.currentTime < 0.5) {
                handleVideoEnded(aktivnaLekcija.id);
              }
            }}
          />
        </div>

        <div className="mt-6 p-6 bg-white rounded-3xl shadow-sm border border-[#E3CAA5]">
          <h2 className="text-2xl font-bold text-[#4a3f35]">
            {escapeHtml(aktivnaLekcija.naziv)}
          </h2>
          <div className="h-1 w-20 bg-[#AD8B73] my-4 rounded-full" />
          <p className="text-[#4a3f35] leading-relaxed opacity-90">
            {escapeHtml(aktivnaLekcija.opis)}
          </p>
        </div>
      </div>

      {/* SIDEBAR SA LEKCIJAMA */}
      <div className="flex flex-col gap-6">
        {/* PROGRES BAR */}
        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#E3CAA5]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-[#4a3f35]">Napredak</span>
            <span className="text-lg font-black text-[#AD8B73]">{procenat}%</span>
          </div>
          <div className="w-full h-3 bg-[#E3CAA5]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#AD8B73] transition-all duration-700"
              style={{ width: `${procenat}%` }}
            />
          </div>
        </div>

        {/* LISTA LEKCIJA */}
        <div className="bg-white p-2 rounded-3xl shadow-md border border-[#E3CAA5]">
          <h3 className="font-bold text-[#4a3f35] border-b border-[#E3CAA5] py-3 mb-2 text-center text-lg">
            Sadržaj kursa
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto p-2">
            {lekcije.map((lekcija, index) => {
              const isAktivna = String(aktivnaLekcija.id) === String(lekcija.id);
              const isZavrsena = zavrseneLekcije.includes(String(lekcija.id));

              return (
                <button
                  key={lekcija.id}
                  onClick={() => setAktivnaLekcija(lekcija)}
                  className={`w-full text-left p-4 rounded-2xl flex gap-3 border-2 transition-all
                  ${isAktivna
                      ? "bg-[#AD8B73] border-[#AD8B73] shadow-lg scale-[1.02]"
                      : "bg-white border-transparent hover:border-[#E3CAA5]"
                    }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {isZavrsena ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : isAktivna ? (
                      <PlayCircle size={20} className="text-[#FFFBE9]" />
                    ) : (
                      <Circle size={20} className="text-[#E3CAA5]" />
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#AD8B73] mb-1">
                      Lekcija {index + 1}
                    </div>
                    <div className={`font-bold text-sm break-words
                    ${isAktivna ? "text-white" : "text-[#4a3f35]"}`}>
                      {lekcija.naziv}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}