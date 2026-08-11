import { notFound } from "next/navigation";
import { TavoApp } from "../../tavo-app";
import { getDishData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug:string }> }) { const { slug } = await params; const dish = await getDishData(slug); if (!dish) notFound(); return <TavoApp screen="dish" data={{...(await getHomeData()),dish}}/>; }
