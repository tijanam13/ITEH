import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || 'super_tajni_string_123';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika (Login)
 *     description: Autentifikuje korisnika i postavlja JWT u HTTP-only kolačić (cookie). JAVNA RUTA.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - lozinka
 *             properties:
 *               email:
 *                 type: string
 *                 example: korisnik@example.com
 *               lozinka:
 *                 type: string
 *                 format: password
 *                 example: Sifra123!
 *     responses:
 *       200:
 *         description: Uspešna prijava.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Pogrešan email ili lozinka.
 *       500:
 *         description: Greška na serveru.
 */
export const POST = async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body.email || body.korisnickoIme)?.toLowerCase().trim();
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
      user: userWithoutPassword
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
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
};