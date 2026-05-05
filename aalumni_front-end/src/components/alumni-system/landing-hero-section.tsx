"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { norsu } from "@/assets/logos";
import { usePublicAuthState } from "@/lib/public-auth";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";
import { PublicHeader } from "./public-header";

type RegisterOptionsResponse = {
  publicSignupEnabled?: boolean;
};

export function LandingHeroSection() {
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");
  const [pendingAuthView, setPendingAuthView] = useState<PublicAuthView | null>(null);
  const [publicSignupEnabled, setPublicSignupEnabled] = useState(true);
  const authParam = searchParams.get("auth");
  const { isLoggedIn, isLoading, user } = usePublicAuthState({ sync: true });

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

  useEffect(() => {
    if (authParam !== "sign-in" && authParam !== "sign-up") {
      return;
    }

    setPendingAuthView(authParam);

    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [authParam]);

  useEffect(() => {
    if (!pendingAuthView) {
      return;
    }

    if (isLoading || isLoggedIn) {
      if (isLoggedIn) {
        setPendingAuthView(null);
      }
      return;
    }

    setAuthView(pendingAuthView);
    setAuthOpen(true);
    setPendingAuthView(null);
  }, [pendingAuthView, isLoading, isLoggedIn]);

  const openAuthModal = (view: PublicAuthView) => {
    setAuthView(view);
    setAuthOpen(true);
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] pt-[120px] text-white md:pt-[132px] lg:pt-[150px]"
    >
      <PublicHeader
        active="home"
        onLoginClick={() => openAuthModal("sign-in")}
        onRegisterClick={() => openAuthModal("sign-up")}
        accent="blue"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-12 h-[280px] w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[830px] text-center">
          <p className="mb-5 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/20">
            {isLoggedIn && user
              ? `Welcome, ${user.firstName}!`
              : "Alumni services, tracer surveys, and career opportunities"}
          </p>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {isLoggedIn && user ? `Hello, ${user.name}!` : "NORSU Alumni Tracker System"}
          </h1>
          <p className="mx-auto mt-6 max-w-[680px] text-base font-medium leading-8 text-white/80 sm:text-lg">
            {isLoggedIn
              ? "You're logged in. View your profile, answer your tracer survey, and explore alumni opportunities."
              : "A public gateway and alumni portal for graduates to stay connected with the university, keep profiles current, answer tracer surveys, and discover alumni-ready opportunities."}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isLoading ? (
              <div className="h-12 w-full max-w-sm rounded-md bg-white/12 ring-1 ring-white/20 sm:w-72" />
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex h-12 w-full items-center justify-center rounded-md bg-white px-7 text-base font-semibold text-dark shadow-1 transition hover:bg-gray-2 sm:w-auto"
                >
                  View My Profile
                </Link>
                <Link
                  href="/survey"
                  className="inline-flex h-12 w-full items-center justify-center rounded-md bg-white/12 px-7 text-base font-semibold text-white ring-1 ring-white/20 transition hover:bg-white hover:text-dark sm:w-auto"
                >
                  Answer Survey
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-16 max-w-[900px]">
          <div className="overflow-hidden rounded-t-2xl bg-white/12 p-2 shadow-4 ring-1 ring-white/20">
            <Image
              src={norsu}
              alt="NORSU Alumni Tracker landing page preview"
              width={845}
              height={316}
              priority
              className="h-[316px] w-full rounded-t-lg object-cover object-top"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-15 bg-white dark:bg-[#020d1a]" />

      <PublicAuthModal
        open={authOpen}
        view={authView}
        publicSignupEnabled={publicSignupEnabled}
        onViewChange={setAuthView}
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}
