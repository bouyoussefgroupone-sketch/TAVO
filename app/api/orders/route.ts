import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { one, rows, transaction } from "@/lib/db";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/tokens";
import { calculateCommission } from "@/lib/billing";
import { orderReference, visitReference } from "@/lib/order-refs";

const schema = z.object({
  restaurantId: z.number().int().positive(),
  presenceToken: z.string().min(20),
  items: z.array(z.object({ offerId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
  const { restaurantId, presenceToken, items } = parsed.data;
  const presence = await one<{ id:string }>("SELECT id FROM presence_authorizations WHERE restaurant_id=$1 AND token_hash=$2 AND expires_at>now()", [restaurantId, hashOpaqueToken(presenceToken)]);
  if (!presence) return NextResponse.json({ error: "Présence expirée. Vérifiez à nouveau votre position.", code: "PRESENCE_EXPIRED" }, { status: 403 });
  if (new Set(items.map((item) => item.offerId)).size !== items.length) return NextResponse.json({ error: "Articles dupliqués." }, { status: 400 });

  const offerRows = await rows<{ id:number; name:string; price_cents:number }>(`SELECT o.id,COALESCE(o.name_override,d.name) AS name,o.price_cents FROM restaurant_offers o JOIN dishes d ON d.id=o.dish_id
    WHERE o.restaurant_id=$1 AND o.status='PUBLISHED' AND o.available AND o.id=ANY($2::int[])`, [restaurantId, items.map((item) => item.offerId)]);
  if (offerRows.length !== items.length) return NextResponse.json({ error: "Un article n’est plus disponible." }, { status: 409 });

  const jar = await cookies();
  const visitCookieName = `tavo_visit_${restaurantId}`;
  const existingSecret = jar.get(visitCookieName)?.value;
  let visit = existingSecret ? await one<{ id:string; reference:string; order_sequence:number }>("SELECT id,reference,order_sequence FROM visit_sessions WHERE restaurant_id=$1 AND secret_hash=$2 AND expires_at>now()", [restaurantId, hashOpaqueToken(existingSecret)]) : null;
  let newVisitSecret: string | null = null;
  if (!visit) {
    newVisitSecret = createOpaqueToken();
    const nextVisit = await one<{ next_no:number }>("SELECT COALESCE(max(substring(reference from 2)::integer),0)+1 AS next_no FROM visit_sessions");
    visit = { id: randomUUID(), reference: visitReference(nextVisit?.next_no ?? 1), order_sequence: 0 };
    await rows("INSERT INTO visit_sessions(id,reference,restaurant_id,secret_hash,expires_at) VALUES($1,$2,$3,$4,$5)", [visit.id, visit.reference, restaurantId, hashOpaqueToken(newVisitSecret), new Date(Date.now() + 3 * 60 * 60 * 1000)]);
  }

  const restaurant = await one<{ commission_bps:number|null }>("SELECT commission_bps FROM restaurants WHERE id=$1", [restaurantId]);
  const defaultCommission = await one<{ value:number }>("SELECT (value::text)::integer AS value FROM settings WHERE key='default_commission_bps'");
  const commissionBps = restaurant?.commission_bps ?? defaultCommission?.value ?? 1200;
  const priceById = new Map(offerRows.map((offer) => [offer.id, offer]));
  const grossCents = items.reduce((sum, item) => sum + priceById.get(item.offerId)!.price_cents * item.quantity, 0);
  const commissionCents = calculateCommission(grossCents, commissionBps);
  const orderId = randomUUID();
  const sequence = visit.order_sequence + 1;
  const reference = orderReference(visit.reference, sequence);

  await transaction(async (db) => {
    await db.query("UPDATE visit_sessions SET order_sequence=$1 WHERE id=$2", [sequence, visit!.id]);
    await db.query(`INSERT INTO orders(id,reference,visit_session_id,restaurant_id,status,gross_cents,commission_bps,commission_cents,billable)
      VALUES($1,$2,$3,$4,'PENDING',$5,$6,$7,false)`, [orderId, reference, visit!.id, restaurantId, grossCents, commissionBps, commissionCents]);
    for (const item of items) {
      const offer = priceById.get(item.offerId)!;
      await db.query("INSERT INTO order_items(order_id,offer_id,item_name,unit_price_cents,quantity,line_total_cents) VALUES($1,$2,$3,$4,$5,$6)", [orderId, offer.id, offer.name, offer.price_cents, item.quantity, offer.price_cents * item.quantity]);
    }
  });

  if (newVisitSecret) jar.set(visitCookieName, newVisitSecret, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: new Date(Date.now() + 3 * 60 * 60 * 1000), path: "/" });
  return NextResponse.json({ reference, visitReference: visit.reference, status: "PENDING", grossCents });
}

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Référence requise." }, { status: 400 });
  const order = await one<{ reference:string; status:string; gross_cents:number; restaurant_id:number; secret_hash:string }>(`SELECT o.reference,o.status,o.gross_cents,o.restaurant_id,v.secret_hash
    FROM orders o JOIN visit_sessions v ON v.id=o.visit_session_id WHERE o.reference=$1 AND v.expires_at>now()`, [reference]);
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  const visitSecret = (await cookies()).get(`tavo_visit_${order.restaurant_id}`)?.value;
  if (!visitSecret || hashOpaqueToken(visitSecret) !== order.secret_hash) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  return NextResponse.json({ order: { reference:order.reference,status:order.status,gross_cents:order.gross_cents } });
}
