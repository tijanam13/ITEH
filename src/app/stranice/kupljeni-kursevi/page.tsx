import RoleGuard from "../../components/RoleGuard";
import { db } from "@/db/index";
import { kupljeniKursevi, kurs, korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import KupljeniKurseviContent from "../../components/KupljeniKurseviContent";

export default async function MojiKurseviPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  if (!token) redirect("/prijava");

  let korisnikId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    korisnikId = decoded.sub;
  } catch (err) {
    redirect("/prijava");
    return null;
  }

  const mojiKursevi = await db
    .select({
      id: kurs.id,
      naziv: kurs.naziv,
      opis: kurs.opis,
      slika: kurs.slika,
      kategorija: kurs.kategorija,
      edukatorIme: korisnik.ime,
      edukatorPrezime: korisnik.prezime
    })
    .from(kupljeniKursevi)
    .innerJoin(kurs, eq(kupljeniKursevi.kursId, kurs.id))
    .innerJoin(korisnik, eq(kurs.edukator, korisnik.id))
    .where(eq(kupljeniKursevi.korisnikId, korisnikId));

  return (<RoleGuard allowedRoles={["KLIJENT"]}>{
    <KupljeniKurseviContent pocetniKursevi={mojiKursevi} />}</RoleGuard>
  );
}