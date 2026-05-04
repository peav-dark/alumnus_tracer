import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET() {
  return adminProxy("/api/admin/notifications/unread-count", {
    method: "GET",
  });
}
