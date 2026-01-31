"use server";
import { db } from "@/db/index";
import { napredak } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function sacuvajNapredak(korisnikId: string, videoLekcijaId: string) {
  try {
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