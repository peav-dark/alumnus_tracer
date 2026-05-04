import { AUTH_COOKIE, getPublicAnnouncement } from "@/lib/api";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Event and Announcement Details",
};

export default async function AnnouncementDetailPage({ params }: Props) {
  const { id } = await params;
  const announcementId = Number(id);

  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    notFound();
  }

  const response = await getPublicAnnouncement(announcementId);
  const announcement = response?.item;
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE)?.value);

  if (!announcement) {
    notFound();
  }

  const loginToJoinHref = `/?auth=sign-in&from=${encodeURIComponent(`/announcements/${announcement.id}`)}`;

  return (
    <main className="mx-auto max-w-5xl">
      <article className="overflow-hidden rounded-[28px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-6 py-8 text-white sm:px-8 sm:py-10">
          <Link
            href="/announcements"
            className="inline-flex text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Back to events and announcements
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {announcement.category || "Office Update"}
            </span>
            <span className="text-sm font-medium text-white/75">
              Posted {formatAnnouncementDate(announcement.datePosted)}
            </span>
            {announcement.postedBy?.fullName && (
              <span className="text-sm font-medium text-white/75">
                Posted by {announcement.postedBy.fullName}
              </span>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl">
            {announcement.title}
          </h1>

          {(announcement.eventStartAt || announcement.location) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {announcement.eventStartAt && (
                <DetailPill
                  label="Event Schedule"
                  value={formatAnnouncementDateTime(announcement.eventStartAt)}
                />
              )}
              {announcement.location && (
                <DetailPill label="Location" value={announcement.location} />
              )}
              {announcement.joinUrl && (
                <DetailPill label="Access" value="Available after login" />
              )}
            </div>
          )}
        </div>

        <div className="p-6 dark:bg-gray-dark sm:p-8">
          <div className="whitespace-pre-line text-base font-medium leading-8 text-dark-5 dark:text-dark-6">
            {announcement.description || "No announcement details available."}
          </div>

          {announcement.joinUrl && (
            <div className="mt-8 rounded-2xl border border-stroke bg-gray-1 p-5 dark:border-dark-3 dark:bg-dark-2">
              <h2 className="text-lg font-bold text-dark dark:text-white">
                Join Information
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                {isAuthenticated
                  ? "Your session is active. You can open the event link now."
                  : "Sign in first to continue to the event link or meeting room."}
              </p>

              {isAuthenticated ? (
                <a
                  href={announcement.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-blue"
                >
                  Join now
                </a>
              ) : (
                <Link
                  href={loginToJoinHref}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-blue"
                >
                  Login now to join
                </Link>
              )}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/70">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatAnnouncementDateTime(value: string | null) {
  if (!value) {
    return "Schedule to be announced";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
