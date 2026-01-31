"use server";

import { db } from "@/db/index";
import { kurs, videoLekcija } from "@/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export async function kreirajKompletanKurs(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return { success: false, error: "Niste ulogovani." };

    let edukatorId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      edukatorId = decoded.sub;
    } catch (err) {
      return { success: false, error: "Sesija je istekla. Ulogujte se ponovo." };
    }

    if (!data.naziv || !data.opis || !data.cena || !data.kategorija || !data.slika) {
      return { success: false, error: "Sva polja za kurs moraju biti popunjena." };
    }

    const cenaBroj = Number(data.cena);
    if (isNaN(cenaBroj) || cenaBroj < 0) {
      return { success: false, error: "Cena mora biti pozitivan broj." };
    }

    if (!data.lekcije || data.lekcije.length === 0) {
      return { success: false, error: "Morate dodati barem jednu lekciju." };
    }

    return await db.transaction(async (tx) => {
      const [noviKurs] = await tx.insert(kurs).values({
        naziv: data.naziv,
        opis: data.opis,
        cena: cenaBroj.toString(),
        kategorija: data.kategorija,
        slika: data.slika,
        edukator: edukatorId,
      }).returning();

      const lekcijeZaBazu = data.lekcije.map((l: any) => ({
        naziv: l.naziv,
        opis: l.opis,
        trajanje: l.trajanje.toString(),
        video: l.video,
        kursId: noviKurs.id,
      }));

      await tx.insert(videoLekcija).values(lekcijeZaBazu);

      return { success: true };
    });

  } catch (error: any) {
    console.error("Baza Error:", error);
    let poruka = "Greška pri čuvanju podataka.";
    if (error.code === '23505') poruka = "Kurs sa tim nazivom već postoji.";
    return { success: false, error: poruka };
  }
}