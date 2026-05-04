import { getBackendUrl } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload?.draftId) {
    return NextResponse.json(
      { message: "Draft ID is required." },
      { status: 422 },
    );
  }

  const response = await fetch(getBackendUrl("/api/register/resend-otp"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));

  return NextResponse.json(body, { status: response.status });
}
