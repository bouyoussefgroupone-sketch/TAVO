import { notFound } from "next/navigation";
import { TavoApp } from "../../tavo-app";
import { getCollectionData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug:string }> }) { const { slug } = await params; const collection = await getCollectionData(slug); if (!collection) notFound(); return <TavoApp screen="collection" data={{...(await getHomeData()),collection}}/>; }
