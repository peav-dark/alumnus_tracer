import { accountProxy } from "@/app/api/account/_proxy";

export async function POST(request: Request) {
  const formData = await request.formData();

  return accountProxy("/api/account/photo", {
    method: "POST",
    body: formData,
  });
}

export async function DELETE() {
  return accountProxy("/api/account/photo", { method: "DELETE" });
}
