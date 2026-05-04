import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  return adminProxy(`/api/admin/notifications${search}`, {
    method: "GET",
  });
}
