import { TavoApp } from "../../tavo-app";
import { getDishData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page(){ return <TavoApp screen="dish" data={{...(await getHomeData()),dish:await getDishData("cesar-signature")}}/>; }
