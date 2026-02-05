"use server";
import { db } from "@/db/index";
import { napredak } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function sacuvajNapredak(videoLekcijaId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return { success: false, error: "Niste ulogovani" };

    const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const korisnikId = decoded.sub;

    const postojeci = await db.query.napredak.findFirst({
      where: and(
        eq(napredak.korisnikId, korisnikId),
        eq(napredak.videoLekcijaId, videoLekcijaId)
      ),
    });

    if (!postojeci) {
      await db.insert(napredak).values({
        korisnikId,
        videoLekcijaId,
        odgledano: true,
      });
    }
    return { success: true };
  } catch (err) {
    console.error("Greška pri čuvanju napretka:", err);
    return { success: false };
  }
}