import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { kupljeniKursevi, kurs, korisnik } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  if (!token) return NextResponse.json({ success: false, error: "Niste ulogovani." }, { status: 401 });

  let edukatorId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
    if (decoded.uloga !== "EDUKATOR" && decoded.uloga !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Nemate pravo pristupa." }, { status: 403 });
    }
    edukatorId = decoded.sub;
  } catch (err) {
    return NextResponse.json({ success: false, error: "Sesija nevažeća." }, { status: 401 });
  }

  const klijenti = await db
    .select({
      korisnikId: kupljeniKursevi.korisnikId,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      email: korisnik.email,
      brojKurseva: sql<number>`COUNT(${kupljeniKursevi.kursId})`,
    })
    .from(kupljeniKursevi)
    .innerJoin(korisnik, eq(kupljeniKursevi.korisnikId, korisnik.id))
    .innerJoin(kurs, eq(kupljeniKursevi.kursId, kurs.id))
    .where(eq(kurs.edukator, edukatorId))
    .groupBy(kupljeniKursevi.korisnikId, korisnik.ime, korisnik.prezime, korisnik.email);

  return NextResponse.json({ success: true, data: klijenti });
}
