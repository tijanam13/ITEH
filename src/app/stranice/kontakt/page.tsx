"use client";

import React, { useState, Suspense } from "react";
import { FaPhone, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { Loader2 } from "lucide-react";

type FormStatus = "IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR";

export default function Kontakt() {
  return (

    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E3CAA5] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#AD8B73]" size={50} />
        </div>
      }
    >
      <KontaktSadrzaj />
    </Suspense>

  );
}

function KontaktSadrzaj() {
  const [status, setStatus] = useState<FormStatus>("IDLE");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("SUBMITTING");
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://formspree.io/f/xpqrqbel", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus("SUCCESS");
      } else {
        setStatus("ERROR");
      }
    } catch (error) {
      setStatus("ERROR");
    }
  }

  return (
    <main className="min-h-screen bg-[#E3CAA5] py-20 px-6 flex items-center">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        <div className="text-left">
          <h1 className="text-5xl font-black italic mb-8 text-[#AD8B73]">Kontaktirajte me</h1>
          <p className="text-lg mb-10 text-[#4a3f35] leading-relaxed font-medium">
            Imate pitanje u vezi sa kursevima šminkanja ili želite da zakažete termin?
            Javite mi se putem forme ili direktno putem mejla ili broja telefona.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-[#FFFBE9] rounded-full text-[#AD8B73] shadow-md"><FaPhone /></div>
              <span className="font-bold text-[#4a3f35]">+381 6X XXX XXX</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-[#FFFBE9] rounded-full text-[#AD8B73] shadow-md"><FaEnvelope /></div>
              <span className="font-bold text-[#4a3f35]">insensitivo.makeup@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="auth-card !max-w-none md:!max-w-[500px] mx-auto">
          {status === "SUCCESS" ? (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black italic text-[#AD8B73]">Hvala vam!</h2>
              <p className="text-[#CEAB93] mt-2 font-medium">Poruka je uspešno poslata.</p>
              <button onClick={() => setStatus("IDLE")} className="auth-btn mt-8">Pošalji novu poruku</button>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-black italic mb-8 text-center text-[#AD8B73]">Pošalji upit</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="auth-label">Ime i Prezime</label>
                  <input type="text" name="KLIJENT" className="auth-input" placeholder="Vaše ime i prezime..." required />
                </div>
                <div>
                  <label className="auth-label">E-mail adresa</label>
                  <input type="email" name="EMAIL" className="auth-input" placeholder="ana@gmail.com" required />
                </div>
                <div>
                  <label className="auth-label">Vaša Poruka</label>
                  <textarea name="PORUKA" rows={4} className="auth-input resize-none" placeholder="Kako mogu da vam pomognem?" required></textarea>
                </div>
                <button type="submit" disabled={status === "SUBMITTING"} className="auth-btn">
                  {status === "SUBMITTING" ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Slanje...
                    </div>
                  ) : "Pošalji Poruku"}
                </button>
                {status === "ERROR" && (
                  <p className="text-red-500 text-sm font-bold text-center">Došlo je do greške. Pokušajte opet.</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}