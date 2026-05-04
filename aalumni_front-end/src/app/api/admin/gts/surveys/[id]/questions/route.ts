import { adminProxy } from "@/app/api/admin/_proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return adminProxy(`/api/admin/gts/surveys/${id}/questions`, {
    method: "GET",
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  return adminProxy(`/api/admin/gts/surveys/${id}/questions`, {
    method: "POST",
    body,
  });
}
