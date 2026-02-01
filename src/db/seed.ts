import "dotenv/config";
import { korisnik } from "./schema";
import { kurs } from "./schema";
import { napredak } from "./schema";
import { kupljeniKursevi } from "./schema";
import { videoLekcija } from "./schema";
import { db } from "./index";
import bcrypt from "bcrypt";

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


await db.insert(kurs).values({

    naziv: "Kurs za početnike",
    opis: "Ovaj kurs je namenjen početnicima.",
    cena: "50",
    kategorija: "šminka",
    slika: "",
    edukator: "98ba1e58-845a-4056-beb5-2ec29c159168"

});



process.exit(0);