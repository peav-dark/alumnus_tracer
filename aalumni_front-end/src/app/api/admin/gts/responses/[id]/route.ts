import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return adminProxy(`/api/admin/gts/responses/${id}`, {
    method: "GET",
  });
}
