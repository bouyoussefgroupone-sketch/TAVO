import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, roleHome, setSessionCookie } from "@/lib/auth";

const schema = z.object({ email: z.email(), password: z.string().min(8) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result) return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  await setSessionCookie(result.token, result.expiresAt);
  return NextResponse.json({ ok: true, redirectTo: roleHome(result.user.role) });
}
