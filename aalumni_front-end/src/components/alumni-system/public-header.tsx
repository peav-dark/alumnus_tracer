"use client";

import {
  clearStoredAuthState,
  getInitials,
  usePublicAuthState,
} from "@/lib/public-auth";
import { alumni } from "@/assets/logos";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type PublicHeaderProps = {
  active?: "home" | "about" | "announcements" | "careers" | "faq";
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  accent?: "primary" | "blue";
};

const navItems = [
  { label: "Home", href: "/", key: "home" },
  { label: "About", href: "/about", key: "about" },
  { label: "Events & Announcements", href: "/announcements", key: "announcements" },
  { label: "Careers", href: "/career-opportunities", key: "careers" },
  { label: "FAQ", href: "/faq", key: "faq" },
] as const;

type RegisterOptionsResponse = {
  publicSignupEnabled?: boolean;
};

export function PublicHeader({
  active,
  onLoginClick,
  onRegisterClick,
}: PublicHeaderProps) {
  const authState = usePublicAuthState({ sync: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [publicSignupEnabled, setPublicSignupEnabled] = useState(true);
  const { isLoggedIn, isLoading, user } = authState;
  const pathname = usePathname();
  const isSurveyActive = pathname === "/survey";

  useEffect(() => {
    let active = true;

    fetch("/api/auth/register-options")
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json().catch(() => null)) as RegisterOptionsResponse | null;
      })
      .then((body) => {
        if (active && body?.publicSignupEnabled === false) {
          setPublicSignupEnabled(false);
        }
      })
      .catch(() => {
        setPublicSignupEnabled(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    clearStoredAuthState();
    setMenuOpen(false);
    setAccountOpen(false);
  };

  return (
    <header className="absolute left-0 top-0 z-30 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="size-12 overflow-hidden rounded-full">
            <Image
              src={alumni}
              alt="NORSU Alumni Tracker logo"
              width={48}
              height={48}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span>
            <span className="block text-lg font-black leading-none text-white">
              NORSU Alumni
            </span>
            <span className="mt-1 block text-xs font-semibold text-white/70">
              Tracker System
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/75 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                active === item.key
                  ? "text-white"
                  : "transition hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/survey"
                className={
                  isSurveyActive
                    ? "inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-blue-dark shadow-sm transition hover:bg-gray-2"
                    : "inline-flex h-10 items-center justify-center rounded-md bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white hover:text-blue-dark"
                }
              >
                Survey
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="flex h-10 items-center gap-2 rounded-md bg-white px-2.5 pr-3 text-sm font-bold text-dark shadow-sm transition hover:bg-gray-2"
                  aria-expanded={accountOpen}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-blue-light-5 text-xs font-black text-blue-dark">
                    {getInitials(user.name)}
                  </span>
                  <span className="max-w-[160px] truncate">{user.name}</span>
                  <svg
                    className={`size-4 text-dark-5 transition ${accountOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-md border border-stroke bg-white shadow-2">
                    <div className="border-b border-stroke px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-blue-light-5 text-sm font-black text-blue-dark">
                          {getInitials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-dark">
                            {user.name}
                          </p>
                          <p className="truncate text-xs font-medium text-dark-5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-dark transition hover:bg-gray-1"
                    >
                      <span>Profile</span>
                      <span className="text-xs text-dark-5">View</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between border-t border-stroke px-4 py-3 text-left text-sm font-semibold text-red transition hover:bg-gray-1"
                    >
                      <span>Logout</span>
                      <span className="text-xs text-red/70">Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="hidden h-10 w-[180px] rounded-md bg-white/10 ring-1 ring-white/10 sm:block" />
          ) : (
            <>
              {/* Register button — uses prop callback on landing page, direct link elsewhere */}
              {onRegisterClick && publicSignupEnabled ? (
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="hidden h-10 items-center justify-center rounded-md bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white hover:text-dark sm:inline-flex"
                >
                  Register
                </button>
              ) : publicSignupEnabled ? (
                <Link
                  href="/auth/sign-up"
                  className="hidden h-10 items-center justify-center rounded-md bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white hover:text-dark sm:inline-flex"
                >
                  Register
                </Link>
              ) : null}

              {/* Login button — uses prop callback on landing page, direct link elsewhere */}
              {onLoginClick ? (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-dark transition hover:bg-gray-2"
                >
                  Login
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-dark transition hover:bg-gray-2"
                >
                  Login
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid size-10 place-items-center rounded-md bg-white/10 text-white ring-1 ring-white/20 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span className="h-0.5 w-5 bg-current shadow-[0_6px_0_current,0_-6px_0_current]" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-5 rounded-md bg-white p-4 shadow-2 lg:hidden">
          <nav className="grid gap-1 text-sm font-semibold text-dark">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  active === item.key
                    ? "rounded-md bg-blue-light-5 px-3 py-2 text-blue-dark"
                    : "rounded-md px-3 py-2 transition hover:bg-gray-1"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {isLoggedIn && user ? (
            <div className="mt-4 border-t border-stroke pt-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-blue-light-5 text-sm font-black text-blue-dark">
                  {getInitials(user.name)}
                </span>
                <span className="font-bold text-dark">{user.name}</span>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/survey"
                  onClick={() => setMenuOpen(false)}
                  className="h-10 rounded-md border border-stroke text-sm font-bold text-dark"
                >
                  <span className="flex h-full items-center justify-center">
                    Survey
                  </span>
                </Link>
                <div className="overflow-hidden rounded-md border border-stroke">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-center text-sm font-bold text-dark"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block h-10 w-full border-t border-stroke bg-blue-dark text-sm font-bold text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 border-t border-stroke pt-4">
              <Link
                href="/auth/sign-in"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 items-center justify-center rounded-md bg-blue-dark text-sm font-bold text-white transition hover:bg-blue"
              >
                Login
              </Link>
              {publicSignupEnabled && (
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 items-center justify-center rounded-md border border-stroke text-sm font-bold text-dark transition hover:bg-gray-1"
                >
                  Register
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
