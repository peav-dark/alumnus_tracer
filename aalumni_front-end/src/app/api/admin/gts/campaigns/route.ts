import { adminProxy } from "@/app/api/admin/_proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const frontendUrl = new URL(request.url).origin;

  return adminProxy("/api/admin/gts/campaigns", {
    method: "POST",
    body,
    headers: {
      "X-Frontend-Url": frontendUrl,
    },
  });
}
