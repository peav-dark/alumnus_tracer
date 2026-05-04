import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ProxyOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
};

export async function adminProxy(path: string, options: ProxyOptions) {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  let body: string | undefined;

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(getBackendUrl(path), {
    method: options.method,
    headers,
    body,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  const proxyResponse = NextResponse.json(data, { status: response.status });

  if ([401, 403].includes(response.status)) {
    proxyResponse.cookies.delete(AUTH_COOKIE);
  }

  return proxyResponse;
}
