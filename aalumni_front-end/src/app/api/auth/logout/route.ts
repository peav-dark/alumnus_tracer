import { AUTH_COOKIE } from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);

  return NextResponse.json({ ok: true });
}
