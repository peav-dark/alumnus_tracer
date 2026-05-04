import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const credentials = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    remember?: boolean;
  } | null;

  if (!credentials?.email || !credentials?.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 422 },
    );
  }

  const response = await fetch(getBackendUrl("/api/login_check"), {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as {
    token?: string;
    message?: string;
  };

  if (!response.ok || !body.token) {
    return NextResponse.json(
      { message: body.message || "Unable to sign in with those credentials." },
      { status: response.status || 401 },
    );
  }

  const token = normalizeAuthToken(body.token);

  if (!token) {
    return NextResponse.json(
      { message: "Unable to establish a valid sign-in session." },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();

  // Sync cookie lifetime to the JWT's own exp so the proxy never
  // sees a "valid cookie but expired token" mismatch.
  const jwtMaxAge = getTokenRemainingSeconds(token);
  const fallbackMaxAge = credentials.remember ? 60 * 60 * 24 * 14 : 60 * 60 * 8;

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: jwtMaxAge ?? fallbackMaxAge,
  });

  const account = await fetchAccountSettings(token);

  return NextResponse.json({
    ok: true,
    redirectPath: getPostLoginRedirectPath(token),
    user: account,
  });
}

async function fetchAccountSettings(token: string) {
  try {
    const response = await fetch(getBackendUrl("/api/account/settings"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json().catch(() => ({}))) as {
      item?: unknown;
    };

    return body.item ?? null;
  } catch {
    return null;
  }
}

function getPostLoginRedirectPath(token: string) {
  const roles = readJwtRoles(token);

  if (roles.includes("ROLE_ADMIN")) {
    return "/dashboard";
  }

  return "/";
}

function readJwtRoles(token: string) {
  const payload = safeParseJwtPayload(token);
  const roles = payload?.roles;

  return Array.isArray(roles)
    ? roles.filter((role): role is string => typeof role === "string")
    : [];
}

function safeParseJwtPayload(token: string): { roles?: unknown } | null {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  const decoded = base64UrlDecode(payloadSegment);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as { roles?: unknown };
  } catch {
    return null;
  }
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    return Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function getTokenRemainingSeconds(token: string): number | null {
  const payload = safeParseJwtPayload(token);
  if (typeof payload?.exp !== "number") return null;
  const remaining = Math.floor(payload.exp - Date.now() / 1000);
  return remaining > 0 ? remaining : null;
}
