"use client";

import RoleGuard from "../../../components/RoleGuard";
import VideoPlayer from "../../../components/VideoPlayer";
import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { fetchKupljeniKursSaLekcijama } from "@/lib/kupljeniKursClient";
import { Loader2 } from "lucide-react";

function KursGledanjeSadrzaj() {
  const { kursId } = useParams();
  const [kursPodaci, setKursPodaci] = useState<any>(null);
  const [lekcije, setLekcije] = useState<any[]>([]);
  const [inicijalniNapredak, setInicijalniNapredak] = useState<string[]>([]);
  const [korisnikId, setKorisnikId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchKupljeniKursSaLekcijama(String(kursId));
        if (res.success) {
          setKursPodaci(res.kurs);
          setLekcije(res.lekcije || []);
          setInicijalniNapredak(res.inicijalniNapredak || []);
          setKorisnikId(res.korisnikId); 

        } else {
          setError(res.error || "Greška pri učitavanju kursa.");
        }
      } catch (err: any) {
        setError(err?.message || "Došlo je do greške na serveru.");
      }
      setLoading(false);
    }
    fetchData();
  }, [kursId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBE9] text-[--color-primary]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold italic">Učitavanje lekcija...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-[#FFFBE9] min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold text-xl mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="auth-btn !w-auto !px-8"
        >
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  if (!lekcije.length) {
    return (
      <div className="p-10 text-center bg-[#FFFBE9] min-h-screen flex items-center justify-center">
        <p className="text-[--color-text] font-bold">Ovaj kurs trenutno nema dostupnih lekcija.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBE9] animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 border-b-2 border-[--color-accent] pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[--color-text] tracking-tighter uppercase">
            {kursPodaci?.naziv}
          </h1>
        </div>
        <VideoPlayer
          lekcije={lekcije}
          korisnikId={korisnikId}
          inicijalniNapredak={inicijalniNapredak}
        />
      </div>
    </div>
  );
}

export default function KursGledanjePage() {
  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBE9]">
          <Loader2 className="animate-spin text-[--color-primary]" size={50} />
        </div>
      }>
        <KursGledanjeSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}