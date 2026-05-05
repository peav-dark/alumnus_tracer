import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const response = await fetch(getBackendUrl("/api/account/academic-options"), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
