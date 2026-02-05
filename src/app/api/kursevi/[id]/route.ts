import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs, videoLekcija, kupljeniKursevi, napredak } from '@/db/schema';
import { eq, inArray, asc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || '***REMOVED***';
async function getEdukatorId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return decoded.sub;
  } catch (e) { return null; }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const [kursPodaci] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!kursPodaci) return NextResponse.json({ success: false, error: 'Kurs nije pronađen.' }, { status: 404 });

    const lekcije = await db
      .select()
      .from(videoLekcija)
      .where(eq(videoLekcija.kursId, kursId))
      .orderBy(asc(videoLekcija.poredak));

    const prodaje = await db
      .select()
      .from(kupljeniKursevi)
      .where(eq(kupljeniKursevi.kursId, kursId))
      .limit(1);

    return NextResponse.json({
      success: true,
      kurs: {
        ...kursPodaci,
        lekcije,
        jeKupljen: prodaje.length > 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const body = await request.json();
    const { naziv, opis, cena, kategorija, slika, lekcije } = body;
    const edukatorId = await getEdukatorId();

    if (!edukatorId) return NextResponse.json({ error: 'Niste ulogovani' }, { status: 401 });

    const [postojeciKurs] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!postojeciKurs) return NextResponse.json({ error: 'Kurs ne postoji' }, { status: 404 });
    if (String(postojeciKurs.edukator) !== String(edukatorId)) return NextResponse.json({ error: 'Zabranjen pristup' }, { status: 403 });

    await db.transaction(async (tx) => {
      await tx.update(kurs).set({
        naziv, opis, cena: cena.toString(), kategorija, slika
      }).where(eq(kurs.id, kursId));

      for (let i = 0; i < lekcije.length; i++) {
        const l = lekcije[i];

        if (l.id) {
          await tx.update(videoLekcija)
            .set({
              naziv: l.naziv,
              opis: l.opis,
              trajanje: l.trajanje.toString(),
              video: l.video,
              poredak: i
            })
            .where(eq(videoLekcija.id, l.id));
        } else {
          await tx.insert(videoLekcija).values({
            naziv: l.naziv,
            opis: l.opis,
            trajanje: l.trajanje.toString(),
            video: l.video,
            kursId: kursId,
            poredak: i
          });
        }
      }

    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kursId } = await params;
    const edukatorId = await getEdukatorId();

    if (!edukatorId) return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });

    const [provera] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    if (!provera) return NextResponse.json({ success: false, error: 'Kurs ne postoji.' }, { status: 404 });
    if (String(provera.edukator) !== String(edukatorId)) return NextResponse.json({ success: false, error: 'Nemate dozvolu.' }, { status: 403 });

    const prodaje = await db.select().from(kupljeniKursevi).where(eq(kupljeniKursevi.kursId, kursId)).limit(1);
    if (prodaje.length > 0) {
      return NextResponse.json({ success: false, error: 'Nije moguće obrisati kurs koji klijenti već koriste (plaćen je)!' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const lekcije = await tx.select({ id: videoLekcija.id }).from(videoLekcija).where(eq(videoLekcija.kursId, kursId));
      const lekcijaIds = lekcije.map(l => l.id);

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