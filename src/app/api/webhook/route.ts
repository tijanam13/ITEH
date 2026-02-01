import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/index";
import { kupljeniKursevi } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Signature Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const korisnikId = session.metadata?.korisnikId;
    const kursIds = JSON.parse(session.metadata?.kursIds || "[]");

    const metoda = session.payment_method_types?.[0] || "card";

    if (!korisnikId || kursIds.length === 0) {
      console.error("Metadata nedostaje u Stripe sesiji");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    console.log(`Pokušaj upisa u bazu za korisnika: ${korisnikId}, kursevi: ${kursIds}`);

    try {
      for (const kursId of kursIds) {
        await db.insert(kupljeniKursevi).values({
          korisnikId: korisnikId,
          kursId: kursId.toString(),
          metodPlacanja: metoda,
          statusPlacanja: "PLAĆENO",
          datum: new Date(),
        });
      }
      console.log("Upis u bazu uspešan!");
    } catch (dbError) {
      console.error("Baza podataka ERROR:", dbError);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse("Success", { status: 200 });
}