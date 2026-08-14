import { TavoApp } from "../tavo-app";
import { getCrownData, getHomeData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ category?:string }> }){
  const { category = "" } = await searchParams;
  return <TavoApp screen="crown" data={{...(await getHomeData()),crownDetail:await getCrownData(undefined, category)}}/>;
}
