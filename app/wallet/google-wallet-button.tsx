"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type LinkState = { status: "loading" | "ready" | "unavailable"; saveUrl?: string };

export function GoogleWalletButton() {
  const [link, setLink] = useState<LinkState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/wallet/google", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Wallet unavailable");
        return response.json() as Promise<{ saveUrl?: string }>;
      })
      .then(({ saveUrl }) => {
        if (!saveUrl?.startsWith("https://pay.google.com/gp/v/save/")) throw new Error("Invalid Wallet URL");
        setLink({ status: "ready", saveUrl });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLink({ status: "unavailable" });
      });
    return () => controller.abort();
  }, []);

  if (link.status === "loading") return <span className="google-wallet-loading" aria-live="polite">Préparation du pass…</span>;
  if (link.status === "unavailable") return <span className="google-wallet-fallback" role="status">Ajout Google Wallet bientôt disponible · <Link href="/">ouvrir TAVO</Link></span>;

  return (
    <a className="google-wallet-action" href={link.saveUrl} aria-label="Ajouter le pass TAVO à Google Wallet">
      <Image src="/images/add-to-google-wallet-fr.svg" alt="Ajouter à Google Wallet" width={199} height={55} priority />
    </a>
  );
}
