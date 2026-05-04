import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type AccountProxyOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: BodyInit;
  contentType?: string;
};

export async function accountProxy(path: string, options: AccountProxyOptions) {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });

  if (options.contentType) {
    headers.set("Content-Type", options.contentType);
  }

  let response: Response;

  try {
    response = await fetch(getBackendUrl(path), {
      method: options.method,
      headers,
      body: options.body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Backend API is unavailable. Please make sure the Symfony server is running." },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, { status: response.status });
}
