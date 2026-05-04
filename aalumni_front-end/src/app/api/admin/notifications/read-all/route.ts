import { adminProxy } from "@/app/api/admin/_proxy";

export async function PATCH() {
  return adminProxy("/api/admin/notifications/read-all", {
    method: "PATCH",
  });
}
