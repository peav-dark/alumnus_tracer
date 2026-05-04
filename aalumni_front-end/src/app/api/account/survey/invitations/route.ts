import { accountProxy } from "@/app/api/account/_proxy";

export async function GET() {
  return accountProxy("/api/account/survey/invitations", {
    method: "GET",
  });
}
