import { notFound } from "next/navigation";
import { TavoApp } from "../../tavo-app";
import { getHomeData, getRestaurantData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug:string }> }) { const { slug } = await params; const restaurant = await getRestaurantData(slug); if (!restaurant) notFound(); return <TavoApp screen="restaurant" data={{...(await getHomeData()),restaurant}}/>; }
