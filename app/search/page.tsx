import { TavoApp } from "../tavo-app";
import { getSearchData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ category?:string; q?:string }> }){
  const params = await searchParams;
  return <TavoApp screen="search" data={await getSearchData(params.category ?? "", params.q ?? "")}/>;
}
