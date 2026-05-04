"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import {
  accountToPublicUser,
  clearStoredAuthState,
  isAlumniAccount,
  setStoredAuthState,
  syncAuthStateFromApi,
  type AccountSettings,
} from "@/lib/public-auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Checkbox } from "../FormElements/checkbox";

export default function SigninWithPassword({
  onSuccess,
  redirectPath,
}: {
  onSuccess?: () => void;
  redirectPath?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = loading || Boolean(success);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        redirectPath?: string;
        user?: AccountSettings | null;
      };

      if (!response.ok) {
        setError(body.message || "Unable to sign in.");
        return;
      }

      if (body.user && isAlumniAccount(body.user)) {
        setStoredAuthState(accountToPublicUser(body.user));
      } else if (body.user) {
        clearStoredAuthState();
      } else {
        await syncAuthStateFromApi();
      }

      const isAlumni = Boolean(body.user && isAlumniAccount(body.user));
      const from = searchParams.get("from");
      const nextPath =
        getSafeRedirectPath(from, isAlumni) ??
        getSafeRedirectPath(redirectPath) ??
        getSafeRedirectPath(body.redirectPath) ??
        (isAlumni ? "/profile" : "/");

      setSuccess("Login successful. Redirecting...");

      window.setTimeout(() => {
        onSuccess?.();
        router.push(nextPath);
        router.refresh();
      }, 700);
    } catch {
      setError("Unable to reach the API. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative" aria-busy={isBusy}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-white/80 backdrop-blur-[2px] dark:bg-slate-950/70">
          <div className="flex min-w-[220px] flex-col items-center gap-3 rounded-[24px] border border-stroke bg-white px-6 py-5 text-center shadow-1 dark:border-dark-3 dark:bg-dark">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-blue-dark border-t-transparent" />
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white">
                Signing you in...
              </p>
              <p className="mt-1 text-xs font-medium text-dark-5 dark:text-dark-6">
                Preparing your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      <fieldset
        disabled={isBusy}
        className={`m-0 min-w-0 border-0 p-0 transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}
      >
        <div className="space-y-4">
          <FieldCard
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={handleChange}
            autoComplete="email"
            icon={<EmailIcon className="h-5 w-5 text-dark-5 dark:text-dark-6" />}
          />

          <FieldCard
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={data.password}
            onChange={handleChange}
            autoComplete="current-password"
            icon={<PasswordIcon className="h-5 w-5 text-dark-5 dark:text-dark-6" />}
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
        </div>

        <div className="mt-5 rounded-[22px] border border-stroke bg-white px-4 py-3 dark:border-dark-3 dark:bg-dark">
          <Checkbox
            label="Keep me signed in"
            name="remember"
            withIcon="check"
            minimal
            radius="md"
            onChange={(e) =>
              setData({
                ...data,
                remember: e.target.checked,
              })
            }
          />
        </div>

        {error && (
          <p className="mt-5 rounded-2xl border border-red/20 bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-5 rounded-2xl border border-green/20 bg-green/[0.08] px-4 py-3 text-sm font-medium text-green">
            {success}
          </p>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isBusy}
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-dark px-6 text-base font-semibold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
          >
            {success ? "Redirecting..." : "Sign In"}
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-blue-dark dark:border-t-transparent" />
            )}
          </button>
        </div>
      </fieldset>
    </form>
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

function FieldCard({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  hint,
  autoComplete,
  endAdornment,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  hint?: string;
  autoComplete?: string;
  endAdornment?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-semibold text-dark dark:text-white">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-[22px] border border-stroke bg-gray-1 px-4 py-3 transition focus-within:border-blue-dark focus-within:bg-white focus-within:ring-4 focus-within:ring-blue/10 dark:border-dark-3 dark:bg-dark-2 dark:focus-within:bg-dark">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-dark shadow-sm dark:bg-dark dark:text-white">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-dark outline-none placeholder:text-dark-6 dark:text-white"
          />
          {hint ? (
            <p className="mt-1 text-xs font-medium text-dark-5 dark:text-dark-6">
              {hint}
            </p>
          ) : null}
        </div>

        {endAdornment ? <div className="shrink-0">{endAdornment}</div> : null}
      </div>
    </label>
  );
}
