"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterResponse = {
  draftId?: number;
  email?: string;
  message?: string;
  errors?: Record<string, string>;
};

export function RegisterForm({
  onRequestSignIn,
  registrationEndpoint = "/api/auth/register",
}: {
  onRequestSignIn?: () => void;
  registrationEndpoint?: string;
} = {}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    dataPrivacyConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(registrationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as RegisterResponse;

      if (!response.ok || !body.draftId) {
        setError(body.message || "Unable to create your registration.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      const params = new URLSearchParams({
        draftId: String(body.draftId),
        email: body.email || form.email,
      });

      router.push(`/auth/verify-email?${params.toString()}`);
    } catch {
      setError("Unable to reach the registration service.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Google Sign-Up */}
      <a
        href="/api/auth/google/start"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-stroke bg-gray-1 text-sm font-bold text-dark transition hover:border-blue-dark hover:bg-white dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-blue dark:hover:bg-dark"
      >
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </a>

      <div className="flex items-center gap-3.5">
        <span className="block h-px flex-1 bg-stroke dark:bg-dark-3" />
        <span className="text-xs font-bold uppercase tracking-widest text-dark-5">
          or register with email
        </span>
        <span className="block h-px flex-1 bg-stroke dark:bg-dark-3" />
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-dark">
          Account details
        </h2>

        <FieldCard
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          error={fieldErrors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldCard
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={updateField}
            error={fieldErrors.password}
            placeholder="Create your password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase, number, and symbol."
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-sm font-semibold text-blue-dark transition hover:text-blue"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <FieldCard
            label="Confirm password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={updateField}
            error={fieldErrors.confirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="text-sm font-semibold text-blue-dark transition hover:text-blue"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            }
          />
        </div>
      </section>

      <div className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="dataPrivacyConsent"
            checked={form.dataPrivacyConsent}
            onChange={updateField}
            className="mt-1 size-5 shrink-0 rounded-md border-stroke accent-blue-dark"
          />
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Data privacy consent
            </p>
            <p className="mt-1 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
              I agree to the data privacy statement.
            </p>
            {fieldErrors.dataPrivacyConsent && (
              <span className="mt-2 block text-sm font-medium text-red">
                {fieldErrors.dataPrivacyConsent}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-blue/10 bg-blue/[0.04] px-4 py-3">
        <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
          <strong className="text-blue-dark dark:text-blue">After registering,</strong>{" "}
          you&apos;ll verify your email and then link your account to your student
          record using your Student ID.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-red/20 bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-md bg-blue-dark px-6 text-sm font-bold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p className="rounded-md border border-stroke bg-gray-1 px-4 py-4 text-center text-sm font-medium text-dark-5 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
        Already registered?{" "}
        {onRequestSignIn ? (
          <button
            type="button"
            onClick={onRequestSignIn}
            className="text-blue-dark"
          >
            Sign in
          </button>
        ) : (
          <Link href="/auth/sign-in" className="text-blue-dark">
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
}

function FieldCard({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  hint,
  autoComplete,
  endAdornment,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  endAdornment?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-semibold text-dark dark:text-white">
        {label}
      </span>
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-md border bg-gray-1 px-4 transition focus-within:border-blue-dark focus-within:bg-white focus-within:ring-4 focus-within:ring-blue/10 dark:bg-dark-2 dark:focus-within:bg-dark",
          error
            ? "border-red/40"
            : "border-stroke dark:border-dark-3",
        )}
      >
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder || label}
          className="w-full bg-transparent text-sm font-medium text-dark outline-none placeholder:text-dark-6 dark:text-white"
        />
        {endAdornment ? <div className="shrink-0">{endAdornment}</div> : null}
      </div>
      {hint && !error && (
        <span className="mt-2 block text-xs font-medium leading-5 text-dark-5 dark:text-dark-6">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-2 block text-sm font-medium text-red">{error}</span>
      )}
    </label>
  );
}
