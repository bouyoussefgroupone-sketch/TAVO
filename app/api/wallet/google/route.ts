import { NextRequest, NextResponse } from "next/server";
import { createGoogleWalletSaveLink, GoogleWalletConfigurationError, readGoogleWalletConfig } from "@/lib/google-wallet";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const config = readGoogleWalletConfig();
    const requestOrigin = request.nextUrl.origin.startsWith("https://") ? request.nextUrl.origin : config.publicUrl;
    const saveUrl = await createGoogleWalletSaveLink(config, Math.floor(Date.now() / 1000), [config.publicUrl, requestOrigin]);
    return NextResponse.json({ provider: "google", demo: true, saveUrl }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    if (!(error instanceof GoogleWalletConfigurationError)) console.error("Google Wallet link generation failed");
    return NextResponse.json(
      { code: error instanceof GoogleWalletConfigurationError ? "WALLET_NOT_CONFIGURED" : "WALLET_UNAVAILABLE", error: "Google Wallet est momentanément indisponible." },
      { status: error instanceof GoogleWalletConfigurationError ? 503 : 500 },
    );
  }
}
