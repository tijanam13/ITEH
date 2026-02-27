import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs, videoLekcija, kupljeniKursevi, napredak } from '@/db/schema';
import { eq, inArray, asc, and } from 'drizzle-orm';
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
    return jwt.verify(token, JWT_SECRET) as { sub: string, uloga: string };
  } catch (e) {
    return null;
  }
}

/**
 * @swagger
 * /api/kursevi/{id}:
 *   get:
 *     summary: Detalji određenog kursa
 *     description: |
 *       - JAVNO: Vraća podatke o kursu i nazive lekcija.
 *       - VLASNIK/KUPAC: Vraća i video linkove.
 *       - ADMIN: Pristup zabranjen (403).
 *     tags: [Kursevi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podaci uspešno dobavljeni.
 *       403:
 *         description: Adminima je zabranjen pristup.
 *       404:
 *         description: Kurs nije pronađen.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const auth = await getAuth();

    if (auth?.uloga === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Administratori nemaju pristup detaljima kurseva na ovoj ruti.' },
        { status: 403 }
      );
    }

    const [kursPodaci] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!kursPodaci) {
      return NextResponse.json({ success: false, error: 'Kurs nije pronađen.' }, { status: 404 });
    }

    let imaPristupSadrzaju = false;
    if (auth) {
      const jeVlasnik = String(kursPodaci.edukator) === String(auth.sub);
      const [kupovina] = await db
        .select()
        .from(kupljeniKursevi)
        .where(and(eq(kupljeniKursevi.kursId, kursId), eq(kupljeniKursevi.korisnikId, auth.sub)))
        .limit(1);

      if (jeVlasnik || kupovina) imaPristupSadrzaju = true;
    }

    const prodaje = await db.select().from(kupljeniKursevi).where(eq(kupljeniKursevi.kursId, kursId)).limit(1);
    const imaProdaja = prodaje.length > 0;

    const sveLekcije = await db
      .select()
      .from(videoLekcija)
      .where(eq(videoLekcija.kursId, kursId))
      .orderBy(asc(videoLekcija.poredak));

    const filtriraneLekcije = sveLekcije.map((l) => {
      if (imaPristupSadrzaju) return l;
      const { video, ...javniPodaci } = l;
      return javniPodaci;
    });

    return NextResponse.json({
      success: true,
      kurs: {
        ...kursPodaci,
        lekcije: filtriraneLekcije,
        jeKupljen: imaPristupSadrzaju,
        imaProdaja: imaProdaja
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/kursevi/{id}:
 *   patch:
 *     summary: Izmena kursa i lekcija
 *     description: Dozvoljava edukatoru (vlasniku) da izmeni osnovne podatke i lekcije.
 *     tags: [Kursevi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naziv:
 *                 type: string
 *               opis:
 *                 type: string
 *               cena:
 *                 type: number
 *               kategorija:
 *                 type: string
 *               slika:
 *                 type: string
 *               lekcije:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID postojeće lekcije (opciono)
 *                     naziv:
 *                       type: string
 *                     opis:
 *                       type: string
 *                     trajanje:
 *                       type: string
 *                     video:
 *                       type: string
 *     responses:
 *       200:
 *         description: Uspešno ažurirano.
 *       403:
 *         description: Niste vlasnik kursa.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const body = await request.json();
    const { naziv, opis, cena, kategorija, slika, lekcije } = body;

    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: 'Niste ulogovani' }, { status: 401 });

    const [postojeciKurs] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!postojeciKurs) return NextResponse.json({ error: 'Kurs ne postoji' }, { status: 404 });

    if (String(postojeciKurs.edukator) !== String(auth.sub)) {
      return NextResponse.json({ error: 'Zabranjen pristup - niste vlasnik ovog kursa' }, { status: 403 });
    }

    const prodaje = await db.select().from(kupljeniKursevi).where(eq(kupljeniKursevi.kursId, kursId)).limit(1);
    const imaProdaja = prodaje.length > 0;

    let postojeciIds: string[] = [];
    if (lekcije && Array.isArray(lekcije)) {
      const trenutneUBazi = await db
        .select({ id: videoLekcija.id })
        .from(videoLekcija)
        .where(eq(videoLekcija.kursId, kursId));
      postojeciIds = trenutneUBazi.map(l => l.id);
    }

    await db.transaction(async (tx) => {
      const updateObj: any = {};
      if (naziv !== undefined) updateObj.naziv = naziv;
      if (opis !== undefined) updateObj.opis = opis;
      if (cena !== undefined) updateObj.cena = cena.toString();
      if (kategorija !== undefined) updateObj.kategorija = kategorija;
      if (slika !== undefined) updateObj.slika = slika;

      if (Object.keys(updateObj).length > 0) {
        await tx.update(kurs).set(updateObj).where(eq(kurs.id, kursId));
      }

      if (lekcije && Array.isArray(lekcije)) {
        const dolazniIds = lekcije.map((l: any) => l.id).filter(Boolean);
        const zaBrisanje = postojeciIds.filter(id => !dolazniIds.includes(id));

        if (zaBrisanje.length > 0 && !imaProdaja) {
          await tx.delete(napredak).where(inArray(napredak.videoLekcijaId, zaBrisanje));
          await tx.delete(videoLekcija).where(inArray(videoLekcija.id, zaBrisanje));
        }

        for (let i = 0; i < lekcije.length; i++) {
          const l = lekcije[i];
          const lekcijaData = {
            naziv: l.naziv,
            opis: l.opis,
            trajanje: l.trajanje?.toString() || "0",
            video: l.video,
            poredak: i
          };

          if (l.id) {
            await tx.update(videoLekcija).set(lekcijaData).where(eq(videoLekcija.id, l.id));
          } else {
            await tx.insert(videoLekcija).values({ ...lekcijaData, kursId: kursId });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
/**
 * @swagger
 * /api/kursevi/{id}:
 *   delete:
 *     summary: Brisanje kursa
 *     description: Briše kurs ako nema prodaja i ako je korisnik vlasnik.
 *     tags: [Kursevi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Obrisano.
 *       400:
 *         description: Ne može se brisati prodat kurs.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const auth = await getAuth();

    if (!auth) return NextResponse.json({ error: 'Niste ulogovani' }, { status: 401 });

    const [postojeciKurs] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!postojeciKurs) return NextResponse.json({ error: 'Kurs ne postoji' }, { status: 404 });

    if (String(postojeciKurs.edukator) !== String(auth.sub)) {
      return NextResponse.json({ error: 'Zabranjen pristup' }, { status: 403 });
    }

    const prodaje = await db.select().from(kupljeniKursevi).where(eq(kupljeniKursevi.kursId, kursId)).limit(1);
    if (prodaje.length > 0) {
      return NextResponse.json({ success: false, error: 'Nije moguće obrisati kurs koji klijenti već koriste!' }, { status: 400 });
    }

    const lekcije = await db.select({ id: videoLekcija.id }).from(videoLekcija).where(eq(videoLekcija.kursId, kursId));
    const lekcijaIds = lekcije.map(l => l.id);

    await db.transaction(async (tx) => {
      if (lekcijaIds.length > 0) {
        await tx.delete(napredak).where(inArray(napredak.videoLekcijaId, lekcijaIds));
        await tx.delete(videoLekcija).where(eq(videoLekcija.kursId, kursId));
      }
      await tx.delete(kurs).where(eq(kurs.id, kursId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}