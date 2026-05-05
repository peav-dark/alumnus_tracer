import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(AUTH_COOKIE)?.value;
  const token = normalizeAuthToken(rawCookie);

  if (!token) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
        debug: {
          cookieName: AUTH_COOKIE,
          hasCookie: !!rawCookie,
          cookieLength: rawCookie?.length ?? 0,
        },
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const backendUrl = getBackendUrl(
    `/api/account/search-student-records?q=${encodeURIComponent(q)}`,
  );

  const response = await fetch(backendUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    redirect: "manual", // Don't follow redirects — catch 302s
  });

  // If backend redirected (302 → login page), the token is invalid
  if (response.status >= 300 && response.status < 400) {
    return NextResponse.json(
      {
        message: "Backend rejected the authentication token.",
        debug: {
          backendStatus: response.status,
          redirectLocation: response.headers.get("location"),
          tokenLength: token.length,
          tokenStart: token.substring(0, 20) + "...",
        },
      },
      { status: 401 },
    );
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
