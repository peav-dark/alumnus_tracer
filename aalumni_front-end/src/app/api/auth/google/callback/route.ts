import { AUTH_COOKIE, getBackendUrl, normalizeAuthToken } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    token?: string;
  } | null;
  const token = normalizeAuthToken(payload?.token);

  if (!token) {
    return NextResponse.json(
      { message: "Missing Google sign-in token." },
      { status: 422 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
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
