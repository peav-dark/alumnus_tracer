import { getBackendUrl } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const from = getSafeRedirectPath(url.searchParams.get("from"));
  const callbackUrl = new URL("/auth/google/callback", origin);
  const backendUrl = new URL(getBackendUrl("/connect/google"));

  if (from) {
    callbackUrl.searchParams.set("from", from);
  }

  backendUrl.searchParams.set("frontend_redirect", callbackUrl.toString());

  return NextResponse.redirect(backendUrl);
}

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}
