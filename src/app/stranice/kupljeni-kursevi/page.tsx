"use client";
import RoleGuard from "../../components/RoleGuard";
import KupljeniKurseviContent from "../../components/KupljeniKurseviContent";
import { useEffect, useState } from "react";
import { fetchKupljeniKursevi } from "@/lib/kupljeniKurseviClient";

export default function MojiKurseviPage() {
  const [kursevi, setKursevi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchKupljeniKursevi();
        if (res.success) {
          setKursevi(res.data || []);
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
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <KupljeniKurseviContent pocetniKursevi={kursevi} loading={loading} error={error} />
    </RoleGuard>
  );
}