import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET() {
  return adminProxy("/api/admin/qr-registration", {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return adminProxy("/api/admin/qr-registration", {
    method: "POST",
    body,
  });
}
