import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  return systemSettingsProxy("GET");
}

export async function PATCH(request: Request) {
  const body = await request.text();

  return systemSettingsProxy("PATCH", body);
}

async function systemSettingsProxy(method: "GET" | "PATCH", body?: string) {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let response: Response;

  try {
    response = await fetch(getBackendUrl("/api/admin/system-settings"), {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Backend API is unavailable." },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, { status: response.status });
}
