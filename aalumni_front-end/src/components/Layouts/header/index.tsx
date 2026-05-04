"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="shrink-0 rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      {/* Search bar — left-aligned, takes available space */}
      <div className="relative flex-1 max-w-[340px]">
        <input
          type="search"
          placeholder="Search alumni, jobs, surveys"
          className="flex w-full items-center gap-3.5 rounded-full border bg-gray-2 py-3 pl-[53px] pr-5 outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary"
        />
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
      </div>

      {/* Right-side icons */}
      <div className="ml-auto flex items-center gap-2 min-[375px]:gap-4">
        <ThemeToggleSwitch />
        <Notification />
        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>

  );
}
