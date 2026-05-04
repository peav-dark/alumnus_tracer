"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RegisterResponse = {
  draftId?: number;
  email?: string;
  message?: string;
  errors?: Record<string, string>;
};

export function RegisterForm({
  onRequestSignIn,
  initialBatchYear,
  lockBatchYear = false,
  registrationEndpoint = "/api/auth/register",
}: {
  onRequestSignIn?: () => void;
  initialBatchYear?: number;
  lockBatchYear?: boolean;
  registrationEndpoint?: string;
} = {}) {
  const router = useRouter();
  const [batchYears, setBatchYears] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    yearGraduated: initialBatchYear ? String(initialBatchYear) : "",
    email: "",
    password: "",
    confirmPassword: "",
    dataPrivacyConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/register-options")
      .then((response) => response.json().catch(() => ({})))
      .then((body: { batchYears?: number[] }) => {
        const years = body.batchYears ?? [];
        setBatchYears(
          initialBatchYear && !years.includes(initialBatchYear)
            ? [initialBatchYear, ...years]
            : years,
        );
      })
      .catch(() => {
        setBatchYears(initialBatchYear ? [initialBatchYear] : []);
      });
  }, [initialBatchYear]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(registrationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearGraduated: form.yearGraduated ? Number(form.yearGraduated) : null,
        }),
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
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-dark">
          Personal details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldCard
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={updateField}
            error={fieldErrors.firstName}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          <FieldCard
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={updateField}
            error={fieldErrors.lastName}
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldCard
            label="School ID"
            name="studentId"
            value={form.studentId}
            onChange={updateField}
            placeholder="e.g. 202200123"
            error={fieldErrors.studentId}
          />
          <SelectCard
            label="Batch year"
            name="yearGraduated"
            value={form.yearGraduated}
            onChange={updateField}
            error={fieldErrors.yearGraduated}
            disabled={lockBatchYear && Boolean(initialBatchYear)}
            hint={
              lockBatchYear && initialBatchYear
                ? "This batch year is fixed by the QR code you scanned."
                : undefined
            }
          >
            <option value="">Select open batch</option>
            {batchYears.map((year) => (
              <option key={year} value={year}>
                Batch {year}
              </option>
            ))}
          </SelectCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-dark">
          Account access
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

function SelectCard({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-semibold text-dark dark:text-white">
        {label}
      </span>
      <div
        className={cn(
          "relative flex h-12 items-center rounded-md border bg-gray-1 px-4 transition focus-within:border-blue-dark focus-within:bg-white focus-within:ring-4 focus-within:ring-blue/10 dark:bg-dark-2 dark:focus-within:bg-dark",
          error
            ? "border-red/40"
            : "border-stroke dark:border-dark-3",
        )}
      >
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none bg-transparent pr-8 text-sm font-medium text-dark outline-none disabled:cursor-not-allowed dark:text-white"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dark-5 dark:text-dark-6">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
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
