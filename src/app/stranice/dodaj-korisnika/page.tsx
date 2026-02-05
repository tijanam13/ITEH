"use client";

import RoleGuard from "../../components/RoleGuard";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createKorisnik } from "@/lib/korisniciClient";

export default function DodajKorisnikaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBE9] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#AD8B73]" size={50} />
        </div>
      }
    >
      <DodajKorisnikaSadrzaj />
    </Suspense>
  );
}

function DodajKorisnikaSadrzaj() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    lozinka: "",
    uloga: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ime || !form.prezime || !form.email || !form.lozinka || !form.uloga) {
      return setNotification({ message: "Popunite sva polja.", type: "error" });
    }

    setLoading(true);
    try {
      const res = await createKorisnik({ ...form, uloga: form.uloga });
      if (res.success) {
        setNotification({ message: "Korisnik je uspešno dodat!", type: "success" });
        setTimeout(() => router.push("/stranice/pregled-korisnika"), 2000);
      } else {
        setNotification({ message: res.error || "Greška pri dodavanju korisnika.", type: "error" });
      }
    } catch {
      setNotification({ message: "Greška na serveru.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>

      <div className="min-h-screen bg-[#FFFBE9] flex items-center justify-center p-6">

        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-200">
              <div className={`mb-4 p-3 rounded-full ${notification.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
                }`}>
                {notification.type === "success" ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
              </div>
              <p className="font-bold text-center mb-4 text-[#4a3f35]">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="bg-[#AD8B73] text-white px-10 py-2 rounded-xl font-bold hover:bg-[#8e6f5a] transition-colors"
              >
                Zatvori
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-lg border border-[#E3CAA5]">
          <h1 className="text-3xl font-extrabold text-center mb-6 text-[#4a3f35]">
            Dodavanje korisnika
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="auth-input"
              placeholder="Ime"
              value={form.ime}
              onChange={e => setForm(p => ({ ...p, ime: e.target.value }))}
            />
            <input
              className="auth-input"
              placeholder="Prezime"
              value={form.prezime}
              onChange={e => setForm(p => ({ ...p, prezime: e.target.value }))}
            />
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Lozinka"
              value={form.lozinka}
              onChange={e => setForm(p => ({ ...p, lozinka: e.target.value }))}
            />

            <select
              className="auth-input"
              value={form.uloga}
              onChange={e => setForm(p => ({ ...p, uloga: e.target.value }))}
            >
              <option value="">Izaberi ulogu</option>
              <option value="KLIJENT">Klijent</option>
              <option value="EDUKATOR">Edukator</option>
              <option value="ADMIN">Administrator</option>
            </select>

            <button
              disabled={loading}
              className="auth-btn w-full !py-4 text-lg font-black disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "DODAJ KORISNIKA"}
            </button>
          </form>
        </div>
      </div>
    </RoleGuard>

  );
}