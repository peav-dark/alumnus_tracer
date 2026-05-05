"use client";

import {
  accountToPublicUser,
  clearStoredAuthState,
  isAlumniAccount,
  setStoredAuthState,
  type AccountSettings,
} from "@/lib/public-auth";
import { StudentLinkModal } from "@/components/alumni-system/student-link-modal";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type GoogleOnboardingContext = {
  needsOnboarding?: boolean;
  initialData?: Partial<GoogleOnboardingForm>;
  batchYears?: number[];
  colleges?: string[];
  departments?: Array<{
    name: string;
    college: string;
    code: string;
  }>;
};

type GoogleOnboardingForm = {
  schoolId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  yearGraduated: string;
  college: string;
  department: string;
};

const emptyOnboardingForm: GoogleOnboardingForm = {
  schoolId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  yearGraduated: "",
  college: "",
  department: "",
};

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell message="Completing Google sign-in..." />}>
      <GoogleCallback />
    </Suspense>
  );
}

function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing Google sign-in...");
  const [status, setStatus] = useState<"loading" | "error" | "onboarding" | "needsStudentLink">("loading");
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [needsStudentLink, setNeedsStudentLink] = useState(false);
  const [onboardingContext, setOnboardingContext] = useState<GoogleOnboardingContext | null>(null);
  const [form, setForm] = useState<GoogleOnboardingForm>(emptyOnboardingForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const onboarding = searchParams.get("onboarding") === "1";
  const needsStudentLinkParam = searchParams.get("needsStudentLink") === "1";
  const from = searchParams.get("from");

  useEffect(() => {
    if (error) {
      clearFrontendGoogleAuth();
      setMessage(error);
      setStatus("error");
      return;
    }

    if (!token) {
      setMessage("Google sign-in did not return an authentication token.");
      setStatus("error");
      return;
    }

    let active = true;

    fetch("/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          message?: string;
          redirectPath?: string;
          user?: AccountSettings | null;
        };

        if (!response.ok) {
          throw new Error(body.message || "Unable to complete Google sign-in.");
        }

        const isAlumni = Boolean(body.user && isAlumniAccount(body.user));

        if (body.user && isAlumni) {
          setStoredAuthState(accountToPublicUser(body.user));
        } else if (body.user) {
          clearStoredAuthState();
        }

        if (!active) {
          return;
        }

        if (onboarding) {
          setRequiresOnboarding(true);
          setStatus("onboarding");
          setMessage("Complete your Google profile details to continue.");
          await loadOnboardingContext(active);
          return;
        }

        if (needsStudentLinkParam) {
          // Redirect to profile — the layout will detect needsStudentLink
          // and show the Student Link Modal with proper auth context.
          // This param is only set by the backend for alumni users.
          window.location.href = "/profile?needsStudentLink=1";
          return;
        }

        router.replace(
          getSafeRedirectPath(from, isAlumni) ??
            getSafeRedirectPath(body.redirectPath) ??
            (isAlumni ? "/profile" : "/"),
        );
        router.refresh();
      })
      .catch((caughtError: unknown) => {
        if (!active) {
          return;
        }

        clearFrontendGoogleAuth();
        setMessage(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to complete Google sign-in.",
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [error, from, needsStudentLinkParam, onboarding, router, token]);

  async function loadOnboardingContext(active = true) {
    const response = await fetch("/api/account/google-onboarding", {
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as GoogleOnboardingContext & {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(body.message || "Unable to load Google onboarding details.");
    }

    if (!active) {
      return;
    }

    const initialData = body.initialData ?? {};
    const batchYears = Array.isArray(body.batchYears) ? body.batchYears : [];
    const departments = Array.isArray(body.departments) ? body.departments : [];

    setOnboardingContext({
      ...body,
      batchYears,
      departments,
    });
    setForm({
      schoolId: String(initialData.schoolId ?? ""),
      firstName: String(initialData.firstName ?? ""),
      middleName: String(initialData.middleName ?? ""),
      lastName: String(initialData.lastName ?? ""),
      yearGraduated: String(initialData.yearGraduated ?? ""),
      college: String(initialData.college ?? ""),
      department: String(initialData.department ?? ""),
    });
  }

  async function submitOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch("/api/account/google-onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearGraduated: form.yearGraduated ? Number(form.yearGraduated) : null,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        item?: AccountSettings;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { form: body.message || "Unable to complete Google onboarding." });
        return;
      }

      if (isAlumniAccount(body.item)) {
        setStoredAuthState(accountToPublicUser(body.item));
      }

        router.replace(getSafeRedirectPath(from, true) ?? "/profile");
        router.refresh();
    } catch {
      setErrors({ form: "Unable to reach the Google onboarding endpoint." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 text-dark dark:bg-[#020d1a] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
      <CallbackShell
        message={message}
        spinning={status === "loading"}
        error={status === "error"}
      />

      {requiresOnboarding && onboardingContext && (
        <GoogleOnboardingModal
          form={form}
          errors={errors}
          saving={saving}
          context={onboardingContext}
          onChange={setForm}
          onSubmit={submitOnboarding}
        />
      )}

      {needsStudentLink && (
        <StudentLinkModal
          onLinked={() => {
            router.replace(getSafeRedirectPath(from, true) ?? "/profile");
            router.refresh();
          }}
        />
      )}
    </main>
  );
}

function getSafeRedirectPath(value?: string | null, alumniOnly = false) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  if (alumniOnly && !isAlumniRedirectPath(value)) {
    return null;
  }

  return value;
}

function isAlumniRedirectPath(value: string) {
  return (
    value === "/" ||
    value === "/about" ||
    value === "/announcements" ||
    value.startsWith("/announcements/") ||
    value === "/career-opportunities" ||
    value.startsWith("/career-opportunities/") ||
    value === "/faq" ||
    value === "/profile" ||
    value === "/survey" ||
    value.startsWith("/survey/invitations/")
  );
}

function clearFrontendGoogleAuth() {
  clearStoredAuthState();

  void fetch("/api/auth/logout", {
    method: "POST",
  }).catch(() => undefined);
}

function GoogleOnboardingModal({
  form,
  errors,
  saving,
  context,
  onChange,
  onSubmit,
}: {
  form: GoogleOnboardingForm;
  errors: Record<string, string>;
  saving: boolean;
  context: GoogleOnboardingContext;
  onChange: React.Dispatch<React.SetStateAction<GoogleOnboardingForm>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const departments = context.departments ?? [];
  const groupedDepartments = useMemo(() => {
    const groups = new Map<string, typeof departments>();

    departments.forEach((department) => {
      const groupName = department.college || "Other Departments";
      groups.set(groupName, [...(groups.get(groupName) ?? []), department]);
    });

    return Array.from(groups.entries());
  }, [departments]);
  const selectedDepartment = useMemo(
    () => departments.find((department) => department.name === form.department),
    [departments, form.department],
  );
  const batchYears = context.batchYears ?? [];
  const hasBatchChoices = batchYears.length > 0;
  const hasDepartmentChoices = departments.length > 0;

  useEffect(() => {
    if (selectedDepartment && selectedDepartment.college !== form.college) {
      onChange((current) => ({ ...current, college: selectedDepartment.college }));
    }
  }, [form.college, onChange, selectedDepartment]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="my-auto w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2 dark:bg-gray-dark sm:p-8"
      >
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-dark">
          Google profile setup
        </p>
        <h1 className="mt-2 text-2xl font-black text-dark dark:text-white">
          Complete your alumni details
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
          Your Google account is verified. Complete these alumni details before
          continuing to the portal.
        </p>

        {errors.form && (
          <p className="mt-5 rounded-md border border-red/20 bg-red/[0.08] px-4 py-3 text-sm font-semibold text-red">
            {errors.form}
          </p>
        )}

        {(!hasBatchChoices || !hasDepartmentChoices) && (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {!hasBatchChoices && (
              <p>No batch years are available. Add a QR registration batch first.</p>
            )}
            {!hasDepartmentChoices && (
              <p>No departments are available. Add a department linked to a college first.</p>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="School ID"
            name="schoolId"
            value={form.schoolId}
            placeholder="e.g. 202200123"
            error={errors.schoolId}
            onChange={onChange}
          />
          <SelectField
            label="Batch Year"
            name="yearGraduated"
            value={form.yearGraduated}
            error={errors.yearGraduated}
            disabled={!hasBatchChoices}
            onChange={onChange}
          >
            <option value="">Select batch year</option>
            {batchYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectField>
          <Field
            label="First Name"
            name="firstName"
            value={form.firstName}
            error={errors.firstName}
            onChange={onChange}
          />
          <Field
            label="Middle Name"
            name="middleName"
            value={form.middleName}
            error={errors.middleName}
            onChange={onChange}
          />
          <Field
            label="Last Name"
            name="lastName"
            value={form.lastName}
            error={errors.lastName}
            onChange={onChange}
          />
          <SelectField
            label="Department"
            name="department"
            value={form.department}
            error={errors.department}
            disabled={!hasDepartmentChoices}
            onChange={onChange}
          >
            <option value="">Select department</option>
            {groupedDepartments.map(([college, departmentOptions]) => (
              <optgroup key={college} label={college}>
                {departmentOptions.map((department) => (
                  <option key={`${department.college}-${department.name}`} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
          <Field
            label="College"
            name="college"
            value={form.college}
            error={errors.college}
            onChange={onChange}
            readOnly
          />
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="submit"
            disabled={saving || !hasBatchChoices || !hasDepartmentChoices}
            className="inline-flex h-12 items-center justify-center rounded-md bg-blue-dark px-6 text-sm font-bold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Complete and Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  error,
  readOnly,
  onChange,
}: {
  label: string;
  name: keyof GoogleOnboardingForm;
  value: string;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  onChange: React.Dispatch<React.SetStateAction<GoogleOnboardingForm>>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-dark dark:text-white">
        {label}
      </span>
      <input
        name={name}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="h-11 w-full rounded-md border border-stroke bg-gray-1 px-4 text-sm font-medium text-dark outline-none transition focus:border-blue-dark read-only:cursor-not-allowed read-only:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  error,
  children,
  disabled,
  onChange,
}: {
  label: string;
  name: keyof GoogleOnboardingForm;
  value: string;
  error?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<GoogleOnboardingForm>>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-dark dark:text-white">
        {label}
      </span>
      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="h-11 w-full rounded-md border border-stroke bg-gray-1 px-4 text-sm font-medium text-dark outline-none transition focus:border-blue-dark disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-dark-5 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function CallbackShell({
  message,
  spinning = true,
  error = false,
}: {
  message: string;
  spinning?: boolean;
  error?: boolean;
}) {
  return (
    <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-2 ring-1 ring-white/20 dark:bg-gray-dark">
      {spinning ? (
        <span className="mx-auto block size-10 animate-spin rounded-full border-2 border-blue-dark border-t-transparent" />
      ) : error ? (
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-red/[0.08] text-xl font-black text-red">
          !
        </span>
      ) : (
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-blue-light-5 text-lg font-black text-blue-dark">
          G
        </span>
      )}
      <h1 className="mt-6 text-2xl font-black">Google Sign-in</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
        {message}
      </p>
      {error && (
        <a
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
        >
          Back to Home
        </a>
      )}
    </div>
  );
}
