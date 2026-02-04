import { NextResponse } from "next/server";
import { db } from "@/db";
import { videoLekcija, kurs, napredak } from "@/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: Request, { params }: { params: { kursId?: string; id?: string } }) {
  const p = params && typeof (params as any).then === 'function' ? await params : params;
  const kursId = p?.kursId || p?.id;
  if (!kursId) {
    return NextResponse.json({ success: false, error: "Nedostaje ID kursa u zahtevu." }, { status: 400 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  let korisnikId = "";
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      korisnikId = decoded.sub;
    } catch (e) { return NextResponse.json({ success: false, error: "Nevažeći token." }, { status: 401 }); }
  } else {
    return NextResponse.json({ success: false, error: "Niste ulogovani." }, { status: 401 });
  }

  const kursPodaci = await db.query.kurs.findFirst({ where: eq(kurs.id, kursId) });
  const lekcije = await db
    .select()
    .from(videoLekcija)
    .where(eq(videoLekcija.kursId, kursId))
    .orderBy(asc(videoLekcija.poredak));

  let inicijalniNapredak: string[] = [];
  if (korisnikId && lekcije.length > 0) {
    const lekcijeIds = lekcije.map(l => l.id);
    const odgledano = await db
      .select()
      .from(napredak)
      .where(
        and(
          eq(napredak.korisnikId, korisnikId),
          inArray(napredak.videoLekcijaId, lekcijeIds),
          eq(napredak.odgledano, true)
        )
      );
    inicijalniNapredak = odgledano.map(n => n.videoLekcijaId);
  }

  return NextResponse.json({
    success: true,
    kurs: kursPodaci,
    lekcije,
    inicijalniNapredak
  });
}
