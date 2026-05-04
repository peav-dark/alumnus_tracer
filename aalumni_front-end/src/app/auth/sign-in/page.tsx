import { AuthShell } from "@/components/alumni-system/auth-shell";
import Signin from "@/components/Auth/Signin";
import { getBackendUrl } from "@/lib/api";
import type { Metadata } from "next";
import { SignInFlash } from "./_components/sign-in-flash";

export const metadata: Metadata = {
  title: "Sign in",
};

type PropsType = {
  searchParams: Promise<{
    registered?: string;
    message?: string;
  }>;
};

export default async function SignIn({ searchParams }: PropsType) {
  const params = await searchParams;
  const options = await getRegisterOptions();
  const authActions = [
    { href: "/", label: "Landing page", tone: "light" as const },
    ...(options?.publicSignupEnabled !== false
      ? [{ href: "/auth/sign-up", label: "Create account", tone: "solid" as const }]
      : []),
  ];
  const flashMessage = params.registered
    ? params.message ||
      "Registration completed. Wait for admin approval before signing in."
    : params.message || "";

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Sign in"
      description="Use your approved account to continue."
      actions={authActions}
    >
      <SignInFlash
        message={flashMessage}
        tone={params.registered ? "success" : "error"}
      />
      <Signin publicSignupEnabled={options?.publicSignupEnabled !== false} />
    </AuthShell>
  );
}

async function getRegisterOptions(): Promise<{ publicSignupEnabled?: boolean } | null> {
  try {
    const response = await fetch(getBackendUrl("/api/register/options"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { publicSignupEnabled?: boolean };
  } catch {
    return null;
  }
}
