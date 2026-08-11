import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { getMediaStorage } from "@/lib/media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
  try {
    const stored = await getMediaStorage().put(file);
    await rows("INSERT INTO media_assets(storage_key,public_url,mime_type,size_bytes,uploaded_by) VALUES($1,$2,$3,$4,$5)", [stored.key,stored.publicUrl,stored.mimeType,stored.size,user.id]);
    return NextResponse.json(stored);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload impossible." }, { status: 400 });
  }
}
