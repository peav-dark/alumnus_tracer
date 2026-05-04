import { AuthShell } from "@/components/alumni-system/auth-shell";
import { getBackendUrl } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Register",
};

type RegisterOptions = {
  publicSignupEnabled?: boolean;
};

export default async function SignUpPage() {
  const options = await getRegisterOptions();
  const authActions = [
    { href: "/", label: "Landing page", tone: "light" as const },
    { href: "/auth/sign-in", label: "Sign in", tone: "solid" as const },
  ];

  if (options?.publicSignupEnabled === false) {
    return (
      <AuthShell
        eyebrow="Register"
        title="Sign-up is currently QR-only"
        description="Use an official QR invitation to register."
        actions={authActions}
      >
        <div className="text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-blue-light-5 text-blue-dark">
            <svg className="size-8" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4.167 4.167h4.166v4.166H4.167V4.167ZM11.667 4.167h4.166v4.166h-4.166V4.167ZM4.167 11.667h4.166v4.166H4.167v-4.166ZM11.667 11.667h1.666M15.833 11.667v1.666M11.667 15.833h4.166"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-medium leading-7 text-dark-5 dark:text-dark-6">
            Scan the QR code from the alumni office.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/sign-in"
              className="inline-flex rounded-lg bg-blue-dark px-5 py-3 font-semibold text-white transition hover:bg-blue"
            >
              Back to Sign In
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-lg border border-stroke px-5 py-3 font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Landing Page
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Register"
      title="Create account"
      description="Register, verify your email, then wait for approval."
      actions={authActions}
    >
      <RegisterForm />
    </AuthShell>
  );
}

async function getRegisterOptions(): Promise<RegisterOptions | null> {
  try {
    const response = await fetch(getBackendUrl("/api/register/options"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RegisterOptions;
  } catch {
    return null;
  }
}
