import { accountProxy } from "@/app/api/account/_proxy";

export async function GET() {
  return accountProxy("/api/account/google-onboarding", { method: "GET" });
}

export async function PATCH(request: Request) {
  const body = await request.text();

  return accountProxy("/api/account/google-onboarding", {
    method: "PATCH",
    body,
    contentType: "application/json",
  });
}
