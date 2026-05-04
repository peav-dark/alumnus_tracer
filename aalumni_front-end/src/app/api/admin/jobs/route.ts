import { adminProxy } from "@/app/api/admin/_proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return adminProxy("/api/admin/jobs", {
    method: "POST",
    body,
  });
}
