import { TavoApp } from "../../tavo-app";
import { getCollectionData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page(){ return <TavoApp screen="collection" data={{...(await getHomeData()),collection:await getCollectionData("frais-et-vif")}}/>; }
