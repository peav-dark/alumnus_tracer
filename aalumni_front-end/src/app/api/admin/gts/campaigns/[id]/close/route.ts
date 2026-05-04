import { adminProxy } from "@/app/api/admin/_proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  return adminProxy(`/api/admin/gts/campaigns/${id}/close`, {
    method: "PATCH",
  });
}
