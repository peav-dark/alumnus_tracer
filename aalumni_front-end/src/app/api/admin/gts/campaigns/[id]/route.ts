import { adminProxy } from "@/app/api/admin/_proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  return adminProxy(`/api/admin/gts/campaigns/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  return adminProxy(`/api/admin/gts/campaigns/${id}`, {
    method: "DELETE",
  });
}
