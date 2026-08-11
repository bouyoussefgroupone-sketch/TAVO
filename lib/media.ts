import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

export type StoredMedia = { key:string; publicUrl:string; size:number; mimeType:string };

export interface MediaStorage {
  put(file: File): Promise<StoredMedia>;
}

export class LocalMediaStorage implements MediaStorage {
  constructor(private root = process.env.MEDIA_ROOT || "public/uploads") {}
  async put(file: File): Promise<StoredMedia> {
    const extension = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" } as Record<string,string>)[file.type];
    if (!extension) throw new Error("Format accepté : JPG, PNG ou WebP.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Le fichier dépasse 5 Mo.");
    await fs.mkdir(this.root, { recursive: true });
    const key = `${new Date().toISOString().slice(0,10)}/${randomUUID()}.${extension}`;
    const target = path.join(this.root, key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
    return { key, publicUrl: `/${path.relative("public", target).replaceAll("\\", "/")}`, size:file.size, mimeType:file.type };
  }
}

export class VercelBlobMediaStorage implements MediaStorage {
  async put(file: File): Promise<StoredMedia> {
    const extension = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" } as Record<string,string>)[file.type];
    if (!extension) throw new Error("Format accepté : JPG, PNG ou WebP.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Le fichier dépasse 5 Mo.");
    const key = `public-food/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${extension}`;
    const blob = await put(key, file, { access:"public", addRandomSuffix:false, contentType:file.type });
    return { key:blob.pathname, publicUrl:blob.url, size:file.size, mimeType:file.type };
  }
}

export function getMediaStorage(): MediaStorage {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new VercelBlobMediaStorage();
  if (process.env.NODE_ENV === "production") throw new Error("Le stockage média de production n’est pas configuré.");
  return new LocalMediaStorage();
}
