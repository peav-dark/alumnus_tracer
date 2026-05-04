import { getBackendUrl } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  let response: Response;

  try {
    response = await fetch(getBackendUrl("/api/register/options"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Backend API is unavailable.", batchYears: [], publicSignupEnabled: true },
      { status: 503 },
    );
  }

  const body = await response.json().catch(() => ({}));

  return NextResponse.json(body, { status: response.status });
}
