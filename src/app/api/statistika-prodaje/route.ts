import { NextResponse } from "next/server";
import { getStatistikaProdajeKurseva } from "@/app/actions/admin";

export async function GET() {
  const res = await getStatistikaProdajeKurseva();
  if (res.success) {
    return NextResponse.json({ success: true, ...res });
  } else {
    return NextResponse.json({ success: false, error: res.error }, { status: 500 });
  }
}
