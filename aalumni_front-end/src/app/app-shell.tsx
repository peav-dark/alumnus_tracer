"use client";

import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const isGoogleCallbackPage = pathname === "/auth/google/callback";
  const isPublicFeaturePage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/announcements" ||
    pathname === "/career-opportunities" ||
    pathname === "/faq" ||
    pathname === "/profile" ||
    pathname === "/survey";
  const isPublicDetailPage =
    pathname.startsWith("/announcements/") ||
    pathname.startsWith("/register/qr/") ||
    pathname.startsWith("/survey/invitations/");

  if (isPublicFeaturePage || isPublicDetailPage || isGoogleCallbackPage) {
    return children;
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen overflow-hidden bg-white dark:bg-[#020d1a]">
        <div className="relative isolate min-h-screen">
          <div className="absolute inset-x-0 top-0 h-[320px] bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] sm:h-[380px] lg:h-[430px]" />
          <div className="absolute left-1/2 top-10 h-[360px] w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
