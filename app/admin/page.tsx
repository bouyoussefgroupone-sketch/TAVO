import { TavoApp } from "../tavo-app";
import { requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page(){ await requireRole(["ADMIN"]); return <TavoApp screen="admin"/>; }
