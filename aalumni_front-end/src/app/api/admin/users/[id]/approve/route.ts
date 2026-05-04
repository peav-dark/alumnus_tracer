import { adminProxy } from "@/app/api/admin/_proxy";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return adminProxy(`/api/admin/users/${id}/approve`, { method: "POST" });
}
