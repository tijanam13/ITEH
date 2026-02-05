import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("Stripe tajni ključ nedostaje u .env fajlu!");
      return NextResponse.json({ error: "Greška u konfiguraciji servera" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const { items } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });

    let korisnikId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      korisnikId = decoded.sub;
    } catch {
      return NextResponse.json({ error: "Nevažeća sesija" }, { status: 401 });
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.naziv,
          images: item.slika ? [item.slika] : []
        },
        unit_amount: Math.round(Number(item.cena) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stranice/korpa?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stranice/korpa?canceled=true`,
      metadata: {
        korisnikId: korisnikId,
        kursIds: JSON.stringify(items.map((i: any) => i.id.toString())),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}