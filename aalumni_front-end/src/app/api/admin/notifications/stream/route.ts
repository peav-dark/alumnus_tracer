import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { search } = new URL(request.url);
  const response = await fetch(getBackendUrl(`/api/admin/notifications/stream${search}`), {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({ message: "Notification stream unavailable." }));
    return NextResponse.json(body, { status: response.status });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
