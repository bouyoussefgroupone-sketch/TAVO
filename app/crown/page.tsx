import { TavoApp } from "../tavo-app";
import { getCrownData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page(){ return <TavoApp screen="crown" data={{...(await getHomeData()),crownDetail:await getCrownData()}}/>; }
