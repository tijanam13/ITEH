import RoleGuard from "../../../components/RoleGuard";
import { db } from "@/db";
import { videoLekcija, kurs, napredak } from "@/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import VideoPlayer from "../../../components/VideoPlayer";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function KursGledanjePage({
  params
}: {
  params: Promise<{ kursId: string }>
}) {
  const resolvedParams = await params;
  const kursId = resolvedParams.kursId;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

  let korisnikId = "";
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      korisnikId = decoded.sub;
    } catch (e) { console.error(e); }
  }

  const kursPodaci = await db.query.kurs.findFirst({
    where: eq(kurs.id, kursId),
  });

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

  if (!lekcije.length) return <div className="p-10 text-center bg-[#FFFBE9] min-h-screen">Nema lekcija.</div>;

  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>{

      <div className="min-h-screen bg-[#FFFBE9]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8 border-b-2 border-[--color-accent] pb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[--color-text]">
              {kursPodaci?.naziv}
            </h1>
          </div>

          <VideoPlayer
            lekcije={lekcije}
            korisnikId={korisnikId}
            inicijalniNapredak={inicijalniNapredak}
          />
        </div>
      </div>
    }</RoleGuard>

  );
}