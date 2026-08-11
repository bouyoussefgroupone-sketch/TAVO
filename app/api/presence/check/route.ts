import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { one, rows } from "@/lib/db";
import { distanceMeters, presenceDecision } from "@/lib/geo";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/tokens";

const bodySchema = z.object({
  restaurantId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().positive().max(10000).optional(),
  devInside: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ allowed: false, reason: "INVALID" }, { status: 400 });
  const restaurant = await one<{ id:number; latitude:number; longitude:number; ordering_radius_m:number }>("SELECT id,latitude,longitude,ordering_radius_m::double precision FROM restaurants WHERE id=$1 AND status='PUBLISHED'", [parsed.data.restaurantId]);
  if (!restaurant) return NextResponse.json({ allowed: false, reason: "NOT_FOUND" }, { status: 404 });

  const simulatorEnabled = process.env.NEXT_PUBLIC_ENABLE_GEO_SIMULATOR === "true" && process.env.NODE_ENV !== "production";
  let decision: ReturnType<typeof presenceDecision>;
  let accuracy = parsed.data.accuracy ?? 5;
  if (parsed.data.devInside !== undefined && simulatorEnabled) {
    decision = parsed.data.devInside ? { allowed: true, reason: "INSIDE" } : { allowed: false, reason: "OUTSIDE" };
    accuracy = 5;
  } else {
    if (parsed.data.latitude === undefined || parsed.data.longitude === undefined || parsed.data.accuracy === undefined) {
      return NextResponse.json({ allowed: false, reason: "LOCATION_REQUIRED" }, { status: 400 });
    }
    decision = presenceDecision({
      distance: distanceMeters(parsed.data.latitude, parsed.data.longitude, restaurant.latitude, restaurant.longitude),
      accuracy: parsed.data.accuracy,
      radius: restaurant.ordering_radius_m,
    });
  }
  if (!decision.allowed) return NextResponse.json(decision);

  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await rows("DELETE FROM presence_authorizations WHERE expires_at<now()");
  await rows("INSERT INTO presence_authorizations(id,restaurant_id,token_hash,expires_at,accuracy_m) VALUES($1,$2,$3,$4,$5)", [randomUUID(), restaurant.id, hashOpaqueToken(token), expiresAt, accuracy]);
  return NextResponse.json({ allowed: true, reason: "INSIDE", presenceToken: token, expiresAt });
}
