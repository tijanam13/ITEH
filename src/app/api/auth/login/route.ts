import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email || body.korisnickoIme;
    const lozinka = body.lozinka;

    if (!email || !lozinka) {
      return NextResponse.json({ message: "Nisu poslati svi podaci" }, { status: 400 });
    }

    const result = await db.select().from(korisnik).where(eq(korisnik.email, email)).limit(1);
    const user = result[0];

    if (!user) {
      return NextResponse.json({ message: "Pogrešni podaci" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(lozinka, user.lozinka);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Pogrešni podaci" }, { status: 401 });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, uloga: user.uloga },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { lozinka: _, ...userWithoutPassword } = user;
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    response.cookies.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
}