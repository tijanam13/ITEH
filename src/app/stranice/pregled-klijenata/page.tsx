"use client";
import RoleGuard from "../../components/RoleGuard";
import { useEffect, useState } from "react";
import PretragaKlijenata from "./pretragaklijenata";
import { fetchEdukatorKlijenti } from "@/lib/edukatorClient";

export default function PregledKlijenataPage() {
  const [klijenti, setKlijenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchEdukatorKlijenti();
        if (res.success) {
          setKlijenti(res.data || []);
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
            <div>Učitavanje...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : klijenti.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E3CAA5]">
              <p className="text-[#AD8B73] text-xl font-semibold">
                Još uvek niko nije kupio Vaše kurseve.
              </p>
            </div>
          ) : (
            <PretragaKlijenata klijenti={klijenti} />
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
