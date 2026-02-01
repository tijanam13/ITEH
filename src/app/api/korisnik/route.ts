import { NextResponse } from "next/server";
import { dodajKorisnikaAction } from "@/app/actions/korisnik";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await dodajKorisnikaAction(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
