import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { kurs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not available in production' }, { status: 404 });
  }

  try {
    const resolvedParams = await params;
    const kursId = resolvedParams.id;

    const [k] = await db
      .select({ id: kurs.id, edukator: kurs.edukator })
      .from(kurs)
      .where(eq(kurs.id, kursId));

    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    let tokenSub: string | null = null;

    try {
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        tokenSub = decoded.sub;
      }
    } catch (err) {
    }

    return NextResponse.json({
      success: true,
      kursId,
      kursEdukator: k?.edukator ?? null,
      tokenSub
    });
  } catch (error: any) {
    console.error('DEBUG /kurs/[id] error', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}