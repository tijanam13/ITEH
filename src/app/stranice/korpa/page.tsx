"use client";
import RoleGuard from "../../components/RoleGuard";

import { useCart } from "../../context/KorpaContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function KorpaPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const ukupno = cart.reduce((sum, item) => sum + Number(item.cena), 0);

  useEffect(() => {
    if (searchParams.get("success")) {
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Greška prilikom pokretanja plaćanja.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Stripe error:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
      setLoading(false);
    }
  };

  if (searchParams.get("success")) {
    return (

      <div className="min-h-screen bg-[#FFFBE9] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-green-200">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-[--color-primary]">Uplata Uspešna!</h1>
          <p className="text-gray-600 mb-8">Hvala vam na kupovini. Vaši kursevi su sada dostupni.</p>
          <Link href="/stranice/kupljeni-kursevi" className="auth-btn !w-auto !px-8">
            Idi na moje kurseve
          </Link>
        </div>
      </div>

    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFBE9] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-[--color-primary]">Tvoja korpa je prazna</h1>
        <Link href="/stranice/svi-kursevi" className="auth-btn !w-auto !px-6">
          <ChevronLeft size={20} /> Nazad na kurseve
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>{

      <div className="min-h-screen bg-[#FFFBE9] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-10 text-[--color-primary]">Tvoja Korpa</h1>

          <div className="auth-card !max-w-none">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-[--color-accent] pb-6 gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[--color-accent]">
                      <Image src={item.slika} alt={item.naziv} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-[--color-text]">{item.naziv}</h3>
                      <p className="text-[--color-primary] font-black">{item.cena} €</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-2 transition-colors"
                  >
                    <Trash2 size={28} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-[--color-accent]/20 rounded-2xl border-2 border-dashed border-[--color-primary]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-[--color-text]">Ukupno za uplatu:</span>
                <span className="text-4xl font-black text-[--color-primary]">{ukupno} €</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="auth-btn text-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Povezivanje sa Stripe-om...
                  </>
                ) : (
                  <>
                    <CheckCircle /> Potvrdi i Plati
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    }</RoleGuard>

  );
}