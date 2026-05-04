import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "norsu_admin_token";

const PUBLIC_PREFIXES = [
  "/auth",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/images",
];
const PUBLIC_PAGES = [
  "/",
  "/about",
  "/announcements",
  "/career-opportunities",
  "/faq",
  "/profile",
  "/survey",
];
const PUBLIC_DETAIL_PREFIXES = [
  "/announcements/",
  "/register/qr/",
  "/survey/invitations/",
];

const ACCOUNT_ALLOWED_PREFIXES = ["/announcements/", "/career-opportunities/"];
const ALUMNI_ALLOWED_API_PREFIXES = ["/api/account"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPage = PUBLIC_PAGES.includes(pathname);
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPublicDetailPage = PUBLIC_DETAIL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAccountAllowedPath = ACCOUNT_ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAlumniAllowedApi = ALUMNI_ALLOWED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isPublicPage || isPublic || isPublicDetailPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    }

    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/";
    signInUrl.searchParams.set("auth", "sign-in");
    signInUrl.searchParams.set("from", `${pathname}${search}`);

    return NextResponse.redirect(signInUrl);
  }

  const tokenStatus = readTokenStatus(token);

  if (tokenStatus === "expired") {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        {
          message: "Session expired. Please sign in again.",
        },
        { status: 401 },
      );

      response.cookies.delete(AUTH_COOKIE);

      return response;
    }

    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/";
    signInUrl.searchParams.set("auth", "sign-in");
    signInUrl.searchParams.set("from", `${pathname}${search}`);

    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete(AUTH_COOKIE);

    return response;
  }

  if (tokenStatus === "not-admin" && !isAccountAllowedPath && !isAlumniAllowedApi) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "This account does not have admin access." },
        { status: 403 },
      );
    }

    const profileUrl = request.nextUrl.clone();
    profileUrl.pathname = "/profile";
    profileUrl.search = "";

    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};

function readTokenStatus(token: string): "valid" | "expired" | "not-admin" {
  const payload = safeParseJwtPayload(token);

  if (!payload) {
    return "expired";
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return "expired";
  }

  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter((role): role is string => typeof role === "string")
    : [];

  if (roles.length > 0 && !roles.includes("ROLE_ADMIN")) {
    return "not-admin";
  }

  return "valid";
}

function safeParseJwtPayload(token: string): { exp?: number; roles?: unknown } | null {
  const normalizedToken = normalizeToken(token);
  const payloadSegment = normalizedToken.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  const decoded = base64UrlDecode(payloadSegment);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as { exp?: number; roles?: unknown };
  } catch {
    return null;
  }
}

function normalizeToken(token: string) {
  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  try {
    return decodeURIComponent(unquoted);
  } catch {
    return unquoted;
  }
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    return atob(padded);
  } catch {
    return "";
  }
}