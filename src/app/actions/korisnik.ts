"use server";

import { db } from "@/db";
import { korisnik } from "@/db/schema";
import bcrypt from "bcrypt";

export async function dodajKorisnikaAction(data: {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  uloga: "ADMIN" | "KLIJENT" | "EDUKATOR";
}) {
  try {
    const hash = await bcrypt.hash(data.lozinka, 10);

    await db.insert(korisnik).values({
      ime: data.ime,
      prezime: data.prezime,
      email: data.email,
      lozinka: hash,
      uloga: data.uloga,
    });

    return { success: true };
  } catch (err: any) {
    const msg = String(err?.message || err);
    const code = err?.code || err?.errno || err?.cause?.code;
    const constraint = err?.constraint || err?.detail || "";

    if (
      code === "23505" ||
      /unique|duplicate|already exists/i.test(msg) ||
      /email/i.test(constraint)
    ) {
      return { success: false, error: "Email već postoji." };
    }

    return { success: false, error: "Greška pri dodavanju korisnika." };
  }
}
