import { TavoApp } from "../tavo-app";
import { getSearchData } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page(){ return <TavoApp screen="search" data={await getSearchData()}/>; }
