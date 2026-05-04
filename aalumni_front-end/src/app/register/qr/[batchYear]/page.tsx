import { RegisterForm } from "@/app/auth/sign-up/_components/register-form";
import { AuthShell } from "@/components/alumni-system/auth-shell";
import { getBackendUrl } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QR Registration",
};

type QrRegisterPageProps = {
  params: Promise<{ batchYear: string }>;
};

type RegisterOptionsResponse = {
  batchYears?: number[];
  publicSignupEnabled?: boolean;
};

async function getBatchStatus(batchYear: number): Promise<"open" | "closed" | "unknown"> {
  try {
    const response = await fetch(getBackendUrl("/api/register/options"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return "unknown";

    const body = (await response.json().catch(() => null)) as RegisterOptionsResponse | null;
    const openYears = body?.batchYears ?? [];

    if (openYears.length === 0) return "unknown";

    return openYears.includes(batchYear) ? "open" : "closed";
  } catch {
    return "unknown";
  }
}

export default async function QrRegisterPage({ params }: QrRegisterPageProps) {
  const { batchYear } = await params;
  const parsedBatchYear = Number(batchYear);
  const currentYear = new Date().getFullYear();
  const validBatchYear =
    Number.isInteger(parsedBatchYear) &&
    parsedBatchYear >= 1950 &&
    parsedBatchYear <= currentYear + 10
      ? parsedBatchYear
      : undefined;

  const authActions = [
    { href: "/", label: "Landing page", tone: "light" as const },
    { href: "/auth/sign-in", label: "Sign in", tone: "solid" as const },
  ];

  // Check if this batch is closed
  const batchStatus = validBatchYear ? await getBatchStatus(validBatchYear) : "unknown";
  const isClosed = batchStatus === "closed";

  if (isClosed) {
    return (
      <AuthShell
        eyebrow="QR Registration"
        title={`Batch ${validBatchYear} Registration`}
        description="This QR registration link has been checked against the current open batches."
        actions={authActions}
      >
        <div className="flex flex-col items-center py-6 text-center">
          {/* Lock icon */}
          <div className="mb-5 grid size-16 place-items-center rounded-full bg-red/10 text-red">
            <svg
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M17 11H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M8 11V7a4 4 0 1 1 8 0v4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.2" fill="currentColor" />
            </svg>
          </div>

          <h2 className="text-xl font-black text-dark dark:text-white">
            QR Registration is Closed
          </h2>

          <p className="mt-3 max-w-sm text-sm font-medium leading-7 text-dark-5 dark:text-dark-6">
            The QR registration link for{" "}
            <strong className="text-dark dark:text-white">
              Batch {validBatchYear}
            </strong>{" "}
            is no longer accepting new registrations. Please contact the alumni
            office for assistance.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-dark px-6 text-sm font-bold text-white transition hover:bg-blue"
            >
              Sign In Instead
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-stroke px-6 text-sm font-bold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Go to Landing Page
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="QR Registration"
      title={
        validBatchYear
          ? `Create account for batch ${validBatchYear}`
          : "Create alumni account"
      }
      description="Complete your alumni account registration from the official QR link, then verify your email."
      actions={authActions}
    >
      <RegisterForm
        initialBatchYear={validBatchYear}
        lockBatchYear
        registrationEndpoint={
          validBatchYear
            ? `/api/auth/register/qr/${validBatchYear}`
            : "/api/auth/register"
        }
      />
    </AuthShell>
  );
}
