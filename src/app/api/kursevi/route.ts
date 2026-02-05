import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs, korisnik, videoLekcija } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

export async function GET() {
  try {
    let userRole: string | null = null;
    let userId: string | null = null;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth')?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga?: string };
        if (decoded) {
          userRole = decoded.uloga || null;
          userId = decoded.sub;
        }
      }
    } catch {
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

    const sviKursevi = userRole === 'EDUKATOR' && userId
      ? await baseQuery.where(eq(kurs.edukator, userId))
      : await baseQuery;

    return NextResponse.json({ success: true, kursevi: sviKursevi, userRole, userId });
  } catch (error: any) {
    console.error('API /kursevi GET error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju kurseva.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { naziv, opis, cena, kategorija, slika, lekcije } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });

    let edukatorId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      edukatorId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: 'Sesija je istekla.' }, { status: 401 });
    }

    if (!naziv || !opis || !cena || !kategorija || !slika) {
      return NextResponse.json({ success: false, error: 'Sva polja za kurs moraju biti popunjena.' }, { status: 400 });
    }

    const cenaBroj = Number(cena);
    if (isNaN(cenaBroj) || cenaBroj < 0) {
      return NextResponse.json({ success: false, error: 'Cena mora biti pozitivan broj.' }, { status: 400 });
    }

    if (!lekcije || lekcije.length === 0) {
      return NextResponse.json({ success: false, error: 'Morate dodati barem jednu lekciju.' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const [noviKurs] = await tx.insert(kurs).values({
        naziv,
        opis,
        cena: cenaBroj.toString(),
        kategorija,
        slika,
        edukator: edukatorId,
      }).returning();

      const lekcijeZaBazu = lekcije.map((l: any, index: number) => ({
        naziv: l.naziv,
        opis: l.opis,
        trajanje: l.trajanje.toString(),
        video: l.video,
        kursId: noviKurs.id,
        poredak: index,
      }));

      await tx.insert(videoLekcija).values(lekcijeZaBazu);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /kursevi POST error:', error);
    let poruka = 'Greška pri čuvanju podataka.';
    if (error.code === '23505') poruka = 'Kurs sa tim nazivom već postoji.';
    return NextResponse.json({ success: false, error: poruka }, { status: 500 });
  }
}

