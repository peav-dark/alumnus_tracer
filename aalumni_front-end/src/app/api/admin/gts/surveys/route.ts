import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET() {
  return adminProxy("/api/admin/gts/surveys", {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return adminProxy("/api/admin/gts/surveys", {
    method: "POST",
    body,
  });
}
