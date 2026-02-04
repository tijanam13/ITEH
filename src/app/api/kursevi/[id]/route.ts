import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs, videoLekcija } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const p = await params;
    console.debug('Incoming GET /api/kursevi/[id] request', { url: request.url, params: p });
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });

    let edukatorId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      edukatorId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: 'Nevažeća sesija.' }, { status: 401 });
    }

    // derive kursId either from resolved params (normal) or fallback from request URL
    const kursId = p?.id ?? (() => {
      try {
        const segs = new URL(request.url).pathname.split('/').filter(Boolean);
        return segs[segs.length - 1];
      } catch {
        return undefined;
      }
    })();

    console.debug('Derived kursId:', { kursId });

    if (!kursId) {
      return NextResponse.json({ success: false, error: 'Nedostaje ID kursa u zahtevu.' }, { status: 400 });
    }

    const [kursPodaci] = await db.select().from(kurs).where(eq(kurs.id, kursId));

    console.debug('API /kursevi/[id] GET:', { kursId, tokenSub: edukatorId, kursEdukator: kursPodaci?.edukator });

    if (!kursPodaci) {
      return NextResponse.json({ success: false, error: 'Kurs nije pronađen.' }, { status: 404 });
    }

    if (String(kursPodaci.edukator) !== String(edukatorId)) {
      return NextResponse.json({ success: false, error: 'Nemate pravo pristupa ovom kursu.' }, { status: 403 });
    }

    const lekcije = await db.select().from(videoLekcija).where(eq(videoLekcija.kursId, kursId)).orderBy(asc(videoLekcija.poredak));

    return NextResponse.json({ success: true, kurs: { ...kursPodaci, lekcije } });
  } catch (error: any) {
    console.error('API /kursevi/[id] GET error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju kursa.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const p = await params;
    console.debug('Incoming DELETE /api/kursevi/[id] request', { url: request.url, params: p });
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });

    let edukatorId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      edukatorId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: 'Sesija nevažeća.' }, { status: 401 });
    }

    const kursId = params?.id ?? (() => {
      try {
        const p = new URL(request.url).pathname.split('/').filter(Boolean);
        return p[p.length - 1];
      } catch {
        return undefined;
      }
    })();

    if (!kursId) {
      return NextResponse.json({ success: false, error: 'Nedostaje ID kursa u zahtevu.' }, { status: 400 });
    }

    const [provera] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    console.debug('API /kursevi/[id] DELETE check:', { kursId, tokenSub: edukatorId, kursEdukator: provera?.edukator });
    if (!provera) {
      return NextResponse.json({ success: false, error: 'Kurs nije pronađen.' }, { status: 404 });
    }

    if (String(provera.edukator) !== String(edukatorId)) {
      return NextResponse.json({ success: false, error: 'Nemate pravo da obrišete ovaj kurs.' }, { status: 403 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(videoLekcija).where(eq(videoLekcija.kursId, kursId));
      await tx.delete(kurs).where(eq(kurs.id, kursId));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /kursevi/[id] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri brisanju kursa.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const p = await params;
    console.debug('Incoming PUT /api/kursevi/[id] request', { url: request.url, params: p });
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
      return NextResponse.json({ success: false, error: 'Sesija nevažeća.' }, { status: 401 });
    }

    const kursId = params?.id ?? (() => {
      try {
        const p = new URL(request.url).pathname.split('/').filter(Boolean);
        return p[p.length - 1];
      } catch {
        return undefined;
      }
    })();

    if (!kursId) {
      return NextResponse.json({ success: false, error: 'Nedostaje ID kursa u zahtevu.' }, { status: 400 });
    }

    const [postojeciKurs] = await db.select().from(kurs).where(eq(kurs.id, kursId));
    console.debug('API /kursevi/[id] PUT check:', { kursId, tokenSub: edukatorId, kursEdukator: postojeciKurs?.edukator });
    if (!postojeciKurs) {
      return NextResponse.json({ success: false, error: 'Kurs nije pronađen.' }, { status: 404 });
    }

    if (String(postojeciKurs.edukator) !== String(edukatorId)) {
      return NextResponse.json({ success: false, error: 'Nemate pravo da menjate ovaj kurs.' }, { status: 403 });
    }

    await db.transaction(async (tx) => {
      await tx.update(kurs).set({
        naziv,
        opis,
        cena: Number(cena).toString(),
        kategorija,
        slika,
      }).where(eq(kurs.id, kursId));

      for (let i = 0; i < (lekcije || []).length; i++) {
        const l = lekcije[i];

        if (l.id) {
          await tx.update(videoLekcija).set({
            naziv: l.naziv,
            opis: l.opis,
            trajanje: l.trajanje.toString(),
            video: l.video,
            poredak: i,
          }).where(eq(videoLekcija.id, l.id));
        } else {
          await tx.insert(videoLekcija).values({
            naziv: l.naziv,
            opis: l.opis,
            trajanje: l.trajanje.toString(),
            video: l.video,
            kursId,
            poredak: i,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /kursevi/[id] PUT error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri izmeni kursa.' }, { status: 500 });
  }
}
