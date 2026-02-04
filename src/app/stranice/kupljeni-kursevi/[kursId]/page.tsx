"use client";
import RoleGuard from "../../../components/RoleGuard";
import VideoPlayer from "../../../components/VideoPlayer";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchKupljeniKursSaLekcijama } from "@/lib/kupljeniKursClient";

export default function KursGledanjePage() {
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
        } else {
          setError(res.error || "Greška.");
        }
      } catch (err: any) {
        setError(err?.message || "Greška.");
      }
      setLoading(false);
    }
    fetchData();
  }, [kursId]);

  if (loading) return <div className="p-10 text-center bg-[#FFFBE9] min-h-screen">Učitavanje...</div>;
  if (error) return <div className="p-10 text-center bg-[#FFFBE9] min-h-screen text-red-500">{error}</div>;
  if (!lekcije.length) return <div className="p-10 text-center bg-[#FFFBE9] min-h-screen">Nema lekcija.</div>;

  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <div className="min-h-screen bg-[#FFFBE9]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8 border-b-2 border-[--color-accent] pb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[--color-text]">
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
    </RoleGuard>
  );
}