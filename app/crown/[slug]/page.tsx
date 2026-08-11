import { notFound } from "next/navigation";
import { TavoApp } from "../../tavo-app";
import { getCrownData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug:string }> }) { const { slug } = await params; const crownDetail = await getCrownData(slug); if (!crownDetail) notFound(); return <TavoApp screen="crown-detail" data={{...(await getHomeData()),crownDetail}}/>; }
