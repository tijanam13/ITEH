import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not available in production' }, { status: 404 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'No auth token found' }, { status: 401 });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return NextResponse.json({ success: true, tokenSub: decoded.sub, role: decoded.uloga || null, decoded });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: 'Invalid token', details: String(err) }, { status: 401 });
    }
  } catch (error: any) {
    console.error('DEBUG /me error', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
