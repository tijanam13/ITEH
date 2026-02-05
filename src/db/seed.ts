import "dotenv/config";
import { korisnik, kurs } from "./schema";
import { db } from "./index";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function main() {
    console.log("Seme (seed) se pokreće...");

    const hash1 = await bcrypt.hash("1233", 10);
    const hash2 = await bcrypt.hash("1234", 10);
    const hash3 = await bcrypt.hash("1235", 10);

    await db.insert(korisnik).values([
        {
            ime: "Tijana",
            prezime: "Milosavljević",
            email: "tijana@gmail.com",
            lozinka: hash1,
            uloga: "ADMIN",
        },
        {
            ime: "Andrijana",
            prezime: "Opačić",
            email: "andrijana@gmail.com",
            lozinka: hash2,
            uloga: "EDUKATOR"
        },
        {
            ime: "Anđela",
            prezime: "Nikolić",
            email: "andjela@gmail.com",
            lozinka: hash3,
            uloga: "KLIJENT"
        },
    ]).onConflictDoNothing({ target: korisnik.email });

    const edukatorData = await db
        .select()
        .from(korisnik)
        .where(eq(korisnik.email, "andrijana@gmail.com"))
        .limit(1);

    if (edukatorData.length > 0) {
        const andrijanaId = edukatorData[0].id;

        await db.insert(kurs).values({
            naziv: "Kurs za početnike",
            opis: "Ovaj kurs je namenjen početnicima.",
            cena: "50",
            kategorija: "šminka",
            slika: "",
            edukator: andrijanaId
        });

        console.log("✅ Uspešno ubačeni korisnici i kurs!");
    } else {
        console.log("❌ Greška: Edukator nije pronađen.");
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:");
    console.error(err);
    process.exit(1);
});