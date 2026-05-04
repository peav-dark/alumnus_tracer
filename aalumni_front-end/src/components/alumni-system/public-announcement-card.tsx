"use client";

import type { Announcement } from "@/lib/api";
import { usePublicAuthState } from "@/lib/public-auth";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode, SVGProps } from "react";

type PublicAnnouncementCardProps = {
  announcement: Announcement;
  descriptionLines?: 3 | 4;
  ctaLabel?: string;
};

export function PublicAnnouncementCard({
  announcement,
  descriptionLines = 4,
  ctaLabel = "View Details",
}: PublicAnnouncementCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, isLoading } = usePublicAuthState();
  const descriptionClassName =
    descriptionLines === 3 ? "line-clamp-3" : "line-clamp-4";
  const cardDate = formatAnnouncementDate(announcement.eventStartAt ?? announcement.datePosted);
  const cardTime = formatAnnouncementTime(announcement.eventStartAt);
  const modalDate =
    announcement.eventStartAt || announcement.datePosted
      ? formatAnnouncementDate(announcement.eventStartAt ?? announcement.datePosted)
      : "Date TBA";
  const modalTime = formatAnnouncementTime(announcement.eventStartAt);
  const loginToJoinHref = `/?auth=sign-in&from=${encodeURIComponent(`/announcements/${announcement.id}`)}`;
  const shouldShowParticipationCta =
    announcement.category?.toLowerCase().includes("event") ||
    Boolean(announcement.joinUrl);

  return (
    <article className="flex min-h-[250px] flex-col rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-light-5 px-3 py-1 text-xs font-bold uppercase text-blue-dark">
          <AnnouncementMiniIcon className="size-3.5" />
          {announcement.category || "Office update"}
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-5 dark:text-dark-6">
          <CalendarMiniIcon className="size-3.5" />
          Date: {cardDate}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold text-dark dark:text-white">
        {announcement.title}
      </h2>

      {(cardTime || announcement.location) && (
        <div className="mt-3 space-y-2 text-xs font-semibold text-dark-5 dark:text-dark-6">
          {cardTime && (
            <p className="inline-flex items-center gap-1.5">
              <ClockMiniIcon className="size-3.5" />
              Time: {cardTime}
            </p>
          )}

          {announcement.location && (
            <p className="inline-flex items-center gap-1.5">
              <LocationMiniIcon className="size-3.5" />
              Location: {announcement.location}
            </p>
          )}
        </div>
      )}

      <p
        className={`mt-3 ${descriptionClassName} text-sm font-medium leading-6 text-dark-5 dark:text-dark-6`}
      >
        {announcement.description || "No announcement preview available."}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 text-left text-sm font-bold text-blue-dark transition hover:text-blue"
        >
          <EyeMiniIcon className="size-4" />
          {ctaLabel}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${announcement.title} details`}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-2 dark:bg-gray-dark">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-light-5 px-3 py-1 text-xs font-bold uppercase text-blue-dark">
                  <AnnouncementMiniIcon className="size-3.5" />
                  {announcement.category || "Office update"}
                </span>
                <h2 className="mt-3 text-2xl font-black leading-tight text-dark dark:text-white">
                  {announcement.title}
                </h2>
              </div>
              <button
                type="button"
                title="Close"
                onClick={() => setIsOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-md border border-stroke text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                <span className="sr-only">Close announcement details</span>
                <CloseMiniIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <DetailTile
                  icon={<CalendarMiniIcon className="size-4" />}
                  label="Date"
                  value={modalDate}
                />
                <DetailTile
                  icon={<ClockMiniIcon className="size-4" />}
                  label="Time"
                  value={modalTime || "Time TBA"}
                />
                <DetailTile
                  icon={<LocationMiniIcon className="size-4" />}
                  label="Location"
                  value={announcement.location || "Location TBA"}
                />
              </div>

              <p className="whitespace-pre-line text-base font-medium leading-8 text-dark-5 dark:text-dark-6">
                {announcement.description || "No announcement details available."}
              </p>

              {announcement.postedBy?.fullName && (
                <div className="rounded-md border border-stroke bg-gray-1 px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-dark-5 dark:text-dark-6">
                    Posted by
                  </p>
                  <p className="mt-1 font-semibold text-dark dark:text-white">
                    {announcement.postedBy.fullName}
                  </p>
                </div>
              )}

              {shouldShowParticipationCta && !isLoading && !isLoggedIn && (
                <div className="flex justify-end">
                  <Link
                    href={loginToJoinHref}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-semibold text-white transition hover:bg-opacity-90"
                  >
                    Login to Participate
                  </Link>
                </div>
              )}

              {announcement.joinUrl && !isLoading && isLoggedIn && (
                <div className="flex justify-end">
                  <a
                    href={announcement.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-semibold text-white transition hover:bg-opacity-90"
                  >
                    Participate Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-dark">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-dark dark:text-white">
        {value}
      </p>
    </div>
  );
}

function formatAnnouncementDate(value: string | null) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function AnnouncementMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.167 8.333V11.667C4.167 12.127 4.54 12.5 5 12.5H6.667L8.609 15.412C8.793 15.687 9.167 15.557 9.167 15.225V12.5H10C10.46 12.5 10.833 12.127 10.833 11.667V8.333C10.833 7.873 10.46 7.5 10 7.5H5C4.54 7.5 4.167 7.873 4.167 8.333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.333 7.5C14.714 7.5 15.833 8.619 15.833 10C15.833 11.381 14.714 12.5 13.333 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.667 1.667V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.333 1.667V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 7.083H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="2.5"
        y="3.333"
        width="15"
        height="13.333"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M1.667 10C3.125 6.875 6.042 5 10 5C13.958 5 16.875 6.875 18.333 10C16.875 13.125 13.958 15 10 15C6.042 15 3.125 13.125 1.667 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function formatAnnouncementTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ClockMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.667V10L12.5 11.667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 17.5C12.917 14.583 15 11.979 15 9.167C15 6.405 12.762 4.167 10 4.167C7.238 4.167 5 6.405 5 9.167C5 11.979 7.083 14.583 10 17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="9.167" r="1.667" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CloseMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
