import { NextRequest, NextResponse } from "next/server";
import { buildPwaManifest } from "@/lib/pwa-manifest";
import { getSamsungBrowserVersion } from "@/lib/pwa";

const MANIFEST_HEADERS = {
  "Cache-Control": "private, no-store",
  Vary: "User-Agent",
};

export function GET(request: NextRequest) {
  if (getSamsungBrowserVersion(request.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, {
      status: 404,
      headers: { ...MANIFEST_HEADERS, "X-TAVO-Install": "open-in-chrome" },
    });
  }

  return NextResponse.json(buildPwaManifest(), { headers: MANIFEST_HEADERS });
}
