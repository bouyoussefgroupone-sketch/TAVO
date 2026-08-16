import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const destination = new URL("/", request.url);
  request.nextUrl.searchParams.forEach((value, key) => destination.searchParams.append(key, value));
  return NextResponse.redirect(destination, 307);
}
