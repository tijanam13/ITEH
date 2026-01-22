import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  email: string;
  lozinka: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pogresan zahtev" }, { status: 400 });
  }

  const { email, lozinka} = body;

  if (!email || !lozinka) {
    return NextResponse.json({ error: "Pogresan email ili lozinka" }, { status: 401 });
  }

  const [u] = await db.select().from(korisnik).where(eq(korisnik.email, email));
  if (!u) {
    return NextResponse.json({ error: "Pogresan email ili lozinka" }, { status: 401 });
  }

  const ok = await bcrypt.compare(lozinka, u.lozinka);
  if (!ok) {
    return NextResponse.json({ error: "Pogresan email ili lozinka" }, { status: 401 });
  }

  const punoIme = `${u.ime} ${u.prezime}`;
  const token = signAuthToken({ sub: u.id, email: u.email, punoIme: punoIme });
  const res = NextResponse.json({ id: u.id, punoIme: punoIme, email: u.email });
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}


