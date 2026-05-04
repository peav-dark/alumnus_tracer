import { accountProxy } from "@/app/api/account/_proxy";

export async function POST(request: Request) {
  const body = await request.text();

  return accountProxy("/api/account/password", {
    method: "POST",
    body,
    contentType: "application/json",
  });
}
