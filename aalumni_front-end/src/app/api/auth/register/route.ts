import { getBackendUrl } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      { message: "Registration data is required." },
      { status: 422 },
    );
  }

  let response: Response;

  try {
    response = await fetch(getBackendUrl("/api/register"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Backend API is unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const body = await response.json().catch(() => ({}));

  return NextResponse.json(body, { status: response.status });
}
