import { TavoApp } from "../tavo-app";
import { requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page(){ await requireRole(["PARTNER"]); return <TavoApp screen="partner"/>; }
