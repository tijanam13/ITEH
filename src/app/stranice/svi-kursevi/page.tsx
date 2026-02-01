import { db } from "@/db/index";
import { kurs, korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import KurseviContent from "../../components/KurseviContent";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export default async function KurseviPage() {
  let userRole: "KLIJENT" | "EDUKATOR" | null = null;
  let userId: string | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga?: string };
      if (decoded) {
        userRole = decoded.uloga as "KLIJENT" | "EDUKATOR";
        userId = decoded.sub;
      }
    }
  } catch {
    userRole = null;
  }

  const baseQuery = db
    .select({
      id: kurs.id,
      naziv: kurs.naziv,
      opis: kurs.opis,
      cena: kurs.cena,
      slika: kurs.slika,
      kategorija: kurs.kategorija,
      edukatorIme: korisnik.ime,
      edukatorPrezime: korisnik.prezime,
      edukatorId: kurs.edukator,
    })
    .from(kurs)
    .leftJoin(korisnik, eq(kurs.edukator, korisnik.id));


  const sviKursevi = userRole === "EDUKATOR" && userId
    ? await baseQuery.where(eq(kurs.edukator, userId))
    : await baseQuery;

  return (
    <KurseviContent
      pocetniKursevi={sviKursevi}
      userRole={userRole}
      userId={userId}
    />
  );
}
