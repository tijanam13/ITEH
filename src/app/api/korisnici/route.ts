import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnik } from "@/db/schema";

export async function GET() {
  try {
    const users = await db.select().from(korisnik);
    const sanitized = users.map(({ lozinka, ...rest }) => rest);
    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
}
