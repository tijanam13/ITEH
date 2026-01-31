import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { ime, prezime, email, lozinka } = await req.json();

    if (!ime || !prezime || !email || !lozinka) {
      return NextResponse.json({ message: "Sva polja su obavezna." }, { status: 400 });
    }

    const postojeciKorisnik = await db
      .select()
      .from(korisnik)
      .where(eq(korisnik.email, email))
      .limit(1);

    if (postojeciKorisnik.length > 0) {
      return NextResponse.json(
        { message: "Korisnik sa ovim emailom već postoji." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10);

    await db.insert(korisnik).values({
      ime,
      prezime,
      email,
      lozinka: hashedPassword,
      uloga: "KLIJENT",
    });

    return NextResponse.json({ message: "Uspešna registracija!" }, { status: 201 });
  } catch (error: any) {
    console.error("Greška pri registraciji:", error);
    return NextResponse.json(
      { message: "Došlo je do greške na serveru." },
      { status: 500 }
    );
  }
}