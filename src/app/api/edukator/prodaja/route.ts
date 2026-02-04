import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { kupljeniKursevi, kurs, korisnik } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  if (!token) return NextResponse.json({ success: false, error: "Niste ulogovani." }, { status: 401 });

  let edukatorId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, uloga: string };
    if (decoded.uloga !== "EDUKATOR" && decoded.uloga !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Nemate pravo pristupa." }, { status: 403 });
    }
    edukatorId = decoded.sub;
  } catch (err) {
    return NextResponse.json({ success: false, error: "Sesija nevažeća." }, { status: 401 });
  }

  const kursevi = await db
    .select({
      kursId: kurs.id,
      naziv: kurs.naziv,
    })
    .from(kurs)
    .where(eq(kurs.edukator, edukatorId));

  const kurseviSaKlijentima = await Promise.all(
    kursevi.map(async (k) => {
      const klijenti = await db
        .select({
          klijentIme: korisnik.ime,
          klijentPrezime: korisnik.prezime,
          klijentEmail: korisnik.email,
          datumKupovine: kupljeniKursevi.datum,
          metodPlacanja: kupljeniKursevi.metodPlacanja,
          statusPlacanja: kupljeniKursevi.statusPlacanja,
        })
        .from(kupljeniKursevi)
        .innerJoin(korisnik, eq(kupljeniKursevi.korisnikId, korisnik.id))
        .where(eq(kupljeniKursevi.kursId, k.kursId))
        .orderBy(desc(kupljeniKursevi.datum));

      return { ...k, klijenti };
    })
  );

  return NextResponse.json({ success: true, data: kurseviSaKlijentima });
}
