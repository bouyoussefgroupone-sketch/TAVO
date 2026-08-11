import { TavoApp } from "../../tavo-app";
import { getHomeData, getRestaurantData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page(){ return <TavoApp screen="restaurant" data={{...(await getHomeData()),restaurant:await getRestaurantData("atelier-noya")}}/>; }
