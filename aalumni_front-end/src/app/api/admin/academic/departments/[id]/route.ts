import { adminProxy } from "@/app/api/admin/_proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return adminProxy(`/api/admin/academic/departments/${id}`, { method: "PATCH", body });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return adminProxy(`/api/admin/academic/departments/${id}`, { method: "DELETE" });
}
