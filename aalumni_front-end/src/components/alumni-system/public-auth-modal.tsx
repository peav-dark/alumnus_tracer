"use client";

import { RegisterForm } from "@/app/auth/sign-up/_components/register-form";
import { CloseIcon } from "@/assets/icons";
import Signin from "@/components/Auth/Signin";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type PublicAuthView = "sign-in" | "sign-up";

type PublicAuthModalProps = {
  open: boolean;
  view: PublicAuthView;
  publicSignupEnabled: boolean;
  redirectPath?: string | null;
  onViewChange: (view: PublicAuthView) => void;
  onClose: () => void;
};

export function PublicAuthModal({
  open,
  view,
  publicSignupEnabled,
  redirectPath,
  onViewChange,
  onClose,
}: PublicAuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={view === "sign-in" ? "Sign in" : "Register"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="my-auto w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2 ring-1 ring-black/5 dark:bg-gray-dark">
        <div className="grid lg:grid-cols-[minmax(280px,0.76fr)_minmax(0,1fr)]">
          <div className="hidden bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="rounded-[28px] bg-white/10 p-8 ring-1 ring-white/15">
              <Image
                src="/images/logo/logo.svg"
                alt="NORSU Alumni Tracker logo"
                width={174}
                height={30}
                priority
                className="h-auto w-full"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Quick access
              </p>
              <p className="mt-3 max-w-xs text-sm font-medium leading-7 text-white/80">
                Sign in or register without leaving the landing page.
              </p>
            </div>
          </div>

          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-dark">
                  NORSU Alumni
                </p>
                <h2 className="mt-2 text-2xl font-black text-dark dark:text-white">
                  {view === "sign-in"
                    ? "Sign in"
                    : publicSignupEnabled
                      ? "Create account"
                      : "Register"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-stroke text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                <span className="sr-only">Close</span>
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="mt-6 inline-flex rounded-full bg-gray-1 p-1 dark:bg-dark-2">
              <button
                type="button"
                onClick={() => onViewChange("sign-in")}
                className={cn(
                  "min-w-[112px] rounded-full px-4 py-2 text-sm font-semibold transition",
                  view === "sign-in"
                    ? "bg-white text-dark shadow-sm dark:bg-gray-dark dark:text-white"
                    : "text-dark-5 hover:text-dark dark:text-dark-6 dark:hover:text-white",
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => onViewChange("sign-up")}
                className={cn(
                  "min-w-[112px] rounded-full px-4 py-2 text-sm font-semibold transition",
                  view === "sign-up"
                    ? "bg-white text-dark shadow-sm dark:bg-gray-dark dark:text-white"
                    : "text-dark-5 hover:text-dark dark:text-dark-6 dark:hover:text-white",
                )}
              >
                Register
              </button>
            </div>

            <div className="mt-6">
              {view === "sign-in" ? (
                <Signin
                  publicSignupEnabled={publicSignupEnabled}
                  redirectPath={redirectPath}
                  onRequestRegister={() => onViewChange("sign-up")}
                  onSuccess={onClose}
                />
              ) : publicSignupEnabled ? (
                <RegisterForm onRequestSignIn={() => onViewChange("sign-in")} />
              ) : (
                <div className="rounded-[24px] border border-stroke bg-gray-1 p-6 text-center dark:border-dark-3 dark:bg-dark-2">
                  <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-blue-light-5 text-blue-dark">
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
                  <h3 className="text-xl font-bold text-dark dark:text-white">
                    QR-only registration
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                    Use an official QR invitation from the alumni office.
                  </p>
                  <button
                    type="button"
                    onClick={() => onViewChange("sign-in")}
                    className="mt-6 inline-flex rounded-xl bg-blue-dark px-5 py-3 font-semibold text-white transition hover:bg-blue"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
