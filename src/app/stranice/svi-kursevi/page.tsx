import { db } from "@/db/index";
import { kurs, korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import KurseviContent from "../../components/KurseviContent";

export default async function KurseviPage() {
  const sviKursevi = await db
    .select({
      id: kurs.id,
      naziv: kurs.naziv,
      opis: kurs.opis,
      cena: kurs.cena,
      slika: kurs.slika,
      kategorija: kurs.kategorija,
      edukatorIme: korisnik.ime,
      edukatorPrezime: korisnik.prezime,
    })
    .from(kurs)
    .leftJoin(korisnik, eq(kurs.edukator, korisnik.id));

  return <KurseviContent pocetniKursevi={sviKursevi} />;
}