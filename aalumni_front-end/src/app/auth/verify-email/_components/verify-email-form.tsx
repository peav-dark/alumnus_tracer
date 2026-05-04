"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type ApiResponse = {
  message?: string;
};

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId") || "";
  const email = searchParams.get("email") || "";
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: Number(draftId), otpCode }),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || "Unable to verify your email.");
        return;
      }

      router.push(
        `/auth/sign-in?registered=1&message=${encodeURIComponent(
          body.message || "Registration completed.",
        )}`,
      );
    } catch {
      setError("Unable to reach the verification service.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: Number(draftId) }),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || "Unable to resend the code.");
        return;
      }

      setMessage(body.message || "A new code has been sent.");
    } catch {
      setError("Unable to reach the verification service.");
    } finally {
      setResending(false);
    }
  };

  if (!draftId) {
    return (
      <div className="rounded-lg border border-stroke p-5 font-medium dark:border-dark-3">
        Registration draft was not found.{" "}
        <Link href="/auth/sign-up" className="text-blue-dark">
          Start registration again.
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-blue-light-5 px-4 py-3 font-medium text-blue-dark">
        Enter the 6-digit code sent to {email || "your email address"}.
      </div>

      <label className="block">
        <span className="mb-2.5 block font-medium text-dark dark:text-white">
          Verification Code
        </span>
        <input
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder="000000"
          className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-center text-2xl font-bold tracking-[0.35em] outline-none transition focus:border-blue-dark dark:border-dark-3 dark:bg-dark-2 dark:focus:border-blue-dark"
        />
      </label>

      {message && (
        <p className="rounded-lg bg-green/[0.08] px-4 py-3 text-sm font-medium text-green">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || otpCode.length < 6}
        className="flex w-full items-center justify-center rounded-lg bg-blue-dark p-4 font-medium text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>

      <button
        type="button"
        onClick={resendOtp}
        disabled={resending}
        className="w-full rounded-lg border border-blue-dark p-4 font-medium text-blue-dark transition hover:bg-blue-light-5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {resending ? "Sending..." : "Resend Code"}
      </button>
    </form>
  );
}
