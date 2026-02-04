import { NextResponse } from "next/server";
import { getMesecnaStatistikaKlijenata } from "@/app/actions/admin";

export async function GET() {
  const res = await getMesecnaStatistikaKlijenata();
  if (res.success) {
    return NextResponse.json({ success: true, data: res.data });
  } else {
    return NextResponse.json({ success: false, error: res.error }, { status: 500 });
  }
}
