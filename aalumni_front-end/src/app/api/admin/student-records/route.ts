import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const limit = searchParams.get("limit") || "50";
  const offset = searchParams.get("offset") || "0";

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  params.set("limit", limit);
  params.set("offset", offset);

  return adminProxy(`/api/admin/student-records?${params.toString()}`, {
    method: "GET",
  });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = (body as { id?: number }).id;

  if (!id) {
    return Response.json({ message: "Missing record ID." }, { status: 422 });
  }

  return adminProxy(`/api/admin/student-records/${id}`, { method: "DELETE" });
}
