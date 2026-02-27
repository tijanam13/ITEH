import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs, korisnik, videoLekcija } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_tajni_string_123';

async function getAuth() {
  try {
    let token: string | undefined;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('auth')?.value;
    }

    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
  } catch (e) {
    return null;
  }
}

/**
 * @swagger
 * /api/kursevi:
 *   get:
 *     summary: Vraća listu kurseva (Filtrirano po ulozi)
 *     description: |
 *       Pravila pristupa:
 *       - GOST ili KLIJENT: Vraća sve dostupne kurseve.
 *       - EDUKATOR: Vraća samo sopstvene kurseve.
 *       - ADMIN: Pristup zabranjen (403).
 *     tags: [Kursevi]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista kurseva uspešno dobavljena.
 *       403:
 *         description: Adminima je zabranjen pristup ovoj ruti.
 *       500:
 *         description: Greška na serveru.
 */
// ... (ostali importi)

export async function GET() {
  try {
    const auth = await getAuth();

    if (auth?.uloga === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Administratori nemaju pravo pristupa listi kurseva na ovoj ruti.' },
        { status: 403 }
      );
    }

    let query = db
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

    let rezultati;

    if (auth?.uloga === 'EDUKATOR') {
      rezultati = await query.where(eq(kurs.edukator, auth.sub));
    } else {
      rezultati = await query;
    }

    return NextResponse.json({
      success: true,
      kursevi: rezultati,
      userRole: auth?.uloga || null,
      userId: auth?.sub || null
    });

  } catch (error: any) {
    console.error('API /kursevi GET error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju kurseva.' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/kursevi:
 *   post:
 *     summary: Kreiranje novog kursa i lekcija
 *     description: Dozvoljeno ISKLJUČIVO edukatorima. Kreira kurs i sve poslate lekcije u jednoj transakciji.
 *     tags: [Kursevi]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [naziv, opis, cena, kategorija, slika, lekcije]
 *             properties:
 *               naziv: { type: string }
 *               opis: { type: string }
 *               cena: { type: number }
 *               kategorija: { type: string }
 *               slika: { type: string }
 *               lekcije:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     naziv: { type: string }
 *                     opis: { type: string }
 *                     trajanje: { type: string }
 *                     video: { type: string }
 *     responses:
 *       201:
 *         description: Kurs uspešno kreiran.
 *       401:
 *         description: Niste ulogovani.
 *       403:
 *         description: Nemate ulogu edukatora.
 *       400:
 *         description: Nedostaju podaci.
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuth();

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });
    }

    if (auth.uloga !== 'EDUKATOR') {
      return NextResponse.json({ success: false, error: 'Pristup zabranjen. Samo edukatori mogu kreirati kurseve.' }, { status: 403 });
    }

    const body = await request.json();
    const { naziv, opis, cena, kategorija, slika, lekcije } = body;


    if (!naziv || !opis || (cena === undefined || cena === null) || !kategorija || !slika || !lekcije || !Array.isArray(lekcije)) {
      return NextResponse.json({ success: false, error: 'Sva polja su obavezna, uključujući i listu lekcija.' }, { status: 400 });
    }

    const res = await db.transaction(async (tx) => {
      const [noviKurs] = await tx.insert(kurs).values({
        naziv,
        opis,
        cena: cena.toString(),
        kategorija,
        slika,
        edukator: auth.sub,
      }).returning();

      if (lekcije.length > 0) {
        const lekcijeZaBazu = lekcije.map((l: any, index: number) => ({
          naziv: l.naziv,
          opis: l.opis,
          trajanje: l.trajanje.toString(),
          video: l.video,
          kursId: noviKurs.id,
          poredak: index,
        }));
        await tx.insert(videoLekcija).values(lekcijeZaBazu);
      }

      return noviKurs;
    });

    return NextResponse.json({ success: true, message: "Kurs je uspešno kreiran.", kursId: res.id }, { status: 201 });

  } catch (error: any) {
    console.error('API /kursevi POST error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri čuvanju podataka na serveru.' }, { status: 500 });
  }
}