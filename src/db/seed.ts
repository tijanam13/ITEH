import "dotenv/config";
import { korisnik } from "./schema";
import { db } from "./index";
import bcrypt from "bcrypt";

const hash1 = await bcrypt.hash("1233", 10);
const hash2 = await bcrypt.hash("1234", 10);
const hash3 = await bcrypt.hash("1235", 10);

await db.insert(korisnik).values([
    {
    ime: "Tijana",
    prezime: "Milosavljevic",
    email: "tesla@gmail.com",
    lozinka: hash1,
    uloga: "ADMIN",
    },
    {
    ime: "Andrijana",
    prezime: "Opacic",
    email: "andrijana@gmail.com",
    lozinka: hash2,
    uloga:"EDUKATOR"
    },
    {
        ime: "Andjela",
        prezime: "Nikolic",
        email: "andjela@gmail.com",
        lozinka: hash3,
        uloga: "KLIJENT"
    },

]);

process.exit(0);