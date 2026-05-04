import { adminProxy } from "@/app/api/admin/_proxy";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return adminProxy(`/api/admin/qr-registration/${id}`, {
    method: "DELETE",
  });
}
