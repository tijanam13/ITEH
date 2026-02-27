"use server";
import { db } from "@/db/index";
import { napredak } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

// PAŽNJA: Ovaj ključ MORA biti identičan u svim fajlovima (API i Actions)
// Najbolje je da u .env fajlu imaš JWT_SECRET=neka_sifra
const JWT_SECRET = process.env.JWT_SECRET || 'super_tajni_string_123'; 

export async function sacuvajNapredak(videoLekcijaId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    
    if (!token) {
      console.log("Nema tokena u kolačićima");
      return { success: false, error: "Niste ulogovani" };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const korisnikId = decoded.sub;

    // Provera da li već postoji
    const postojeci = await db
      .select()
      .from(napredak)
      .where(
        and(
          eq(napredak.korisnikId, korisnikId),
          eq(napredak.videoLekcijaId, videoLekcijaId)
        )
      )
      .limit(1);

    if (postojeci.length === 0) {
      await db.insert(napredak).values({
        korisnikId,
        videoLekcijaId,
        odgledano: true,
      });
      
      // OSVEŽAVANJE KEŠA: Ovo tera Next.js da ponovo povuče podatke iz baze
revalidatePath("/", "layout");
      
      return { success: true, message: "Umetnuto" };
    }
    
    return { success: true, message: "Već postoji" };
  } catch (err: any) {
    console.error("Greška pri čuvanju napretka:", err.message);
    return { success: false, error: err.message };
  }
}