import { TavoApp } from "./tavo-app";
import { PwaInstallExperience } from "./pwa-install-experience";
import { getHomeData } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function Home() {
  return (
    <>
      <TavoApp screen="home" data={await getHomeData()} />
      <PwaInstallExperience />
    </>
  );
}
