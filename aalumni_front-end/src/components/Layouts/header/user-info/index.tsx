"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

type AccountSettings = {
  fullName: string;
  email: string;
  profileImageUrl: string | null;
};

type AccountSettingsResponse = {
  item?: AccountSettings;
};

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState<AccountSettings | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);

  useEffect(() => {
    void loadAccount();

    const refreshAccount = () => void loadAccount();
    window.addEventListener("account-settings-updated", refreshAccount);
    window.addEventListener("focus", refreshAccount);

    return () => {
      window.removeEventListener("account-settings-updated", refreshAccount);
      window.removeEventListener("focus", refreshAccount);
    };
  }, []);

  const userName = account?.fullName || "Admin User";
  const userEmail = account?.email || "admin@norsu.edu.ph";
  const avatarSrc = account?.profileImageUrl
    ? withCacheBust(account.profileImageUrl, avatarVersion)
    : "";
  const initials = useMemo(() => getInitials(userName), [userName]);

  async function loadAccount() {
    try {
      const response = await fetch("/api/account/settings", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as AccountSettingsResponse;

      if (response.ok && body.item) {
        setAccount(body.item);
        setAvatarVersion(Date.now());
      }
    } catch {
      setAccount(null);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsOpen(false);
      window.location.replace("/?auth=sign-in");
    }
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <Avatar src={avatarSrc} initials={initials} name={userName} />
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{userName}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Avatar src={avatarSrc} initials={initials} name={userName} />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {userName}
            </div>

            <div className="leading-none text-gray-6">{userEmail}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

function Avatar({
  src,
  initials,
  name,
}: {
  src: string;
  initials: string;
  name: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        className="size-12 rounded-full object-cover"
        alt={`Avatar of ${name}`}
      />
    );
  }

  return (
    <span className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
      {initials}
    </span>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AU"
  );
}

function withCacheBust(url: string, version: number) {
  if (!version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${version}`;
}
