import { accountProxy } from "@/app/api/account/_proxy";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;

  return accountProxy(`/api/account/survey/invitations/${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.text();

  return accountProxy(`/api/account/survey/invitations/${encodeURIComponent(token)}`, {
    method: "POST",
    body,
    contentType: "application/json",
  });
}
