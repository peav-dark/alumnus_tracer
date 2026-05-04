import { cn } from "@/lib/utils";
import { alumni } from "@/assets/logos";
import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type AuthShellAction = {
  href: string;
  label: string;
  tone?: "light" | "solid";
};

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: AuthShellAction[];
}>;

export function AuthShell({
  eyebrow,
  title,
  description,
  actions = [],
  children,
}: AuthShellProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-4 ring-1 ring-black/5 dark:bg-gray-dark">
      <div className="grid min-h-[720px] lg:grid-cols-[0.82fr_1fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_48%,#5475E5_100%)] px-8 py-8 text-white lg:block xl:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_30%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="size-16 overflow-hidden rounded-full">
                <Image
                  src={alumni}
                  alt="NORSU Alumni Tracker logo"
                  width={64}
                  height={64}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <span>
                <span className="block text-xl font-black leading-none">
                  NORSU Alumni
                </span>
                <span className="mt-1 block text-sm font-semibold text-white/70">
                  Tracker System
                </span>
              </span>
            </Link>

            <div className="max-w-md">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                Alumni access
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight">
                One account for registration, surveys, and alumni services.
              </h2>
              <p className="mt-5 text-base font-medium leading-8 text-white/75">
                Complete the form, verify your email code, and wait for alumni
                office approval before signing in.
              </p>
            </div>

            <div className="grid gap-3 text-sm font-semibold text-white/75">
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                Batch-based QR registration keeps alumni grouped under the
                correct graduation year.
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                Email verification protects account ownership before approval.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-5 py-6 dark:bg-gray-dark sm:px-8 sm:py-8 lg:px-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 lg:justify-end">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <div className="size-11 overflow-hidden rounded-full">
                <Image
                  src={alumni}
                  alt="NORSU Alumni Tracker logo"
                  width={44}
                  height={44}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-black text-dark dark:text-white">
                NORSU Alumni
              </span>
            </Link>
            {actions.length ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {actions.map((action) => (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    className={cn(
                      "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition",
                      action.tone === "solid"
                        ? "bg-blue-dark text-white hover:bg-blue"
                        : "border border-stroke text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2",
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mx-auto flex h-[calc(100%-68px)] max-w-2xl flex-col justify-center">
            <div className="mb-6 flex items-center gap-4">
              <div className="size-14 overflow-hidden rounded-full ring-2 ring-blue-dark/20">
                <Image
                  src={alumni}
                  alt="NORSU Alumni Tracker logo"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-base font-black leading-none text-dark dark:text-white">
                  NORSU Alumni Tracker
                </p>
                <p className="mt-1 text-xs font-semibold text-dark-5 dark:text-dark-6">
                  Negros Oriental State University
                </p>
              </div>
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-dark">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-dark dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm font-medium leading-7 text-dark-5 dark:text-dark-6 sm:text-base sm:leading-8">
              {description}
            </p>

            <div className="mt-8 rounded-xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-dark-2 sm:p-7">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
