import { AuthShell } from "@/components/alumni-system/auth-shell";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "./_components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow="Verify email"
      title="Confirm your registration"
      description="Enter the one-time password sent to your email so your alumni registration can move to approval review."
      actions={[
        { href: "/", label: "Landing page", tone: "light" },
        { href: "/auth/sign-up", label: "Back to registration", tone: "solid" },
      ]}
    >
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
