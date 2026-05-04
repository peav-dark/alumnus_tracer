import { getPublicAnnouncements } from "@/lib/api";
import { PublicAnnouncementCard } from "@/components/alumni-system/public-announcement-card";
import { PublicEventsBanner } from "@/components/alumni-system/public-auth-aware-sections";
import { PublicHeader } from "@/components/alumni-system/public-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events and Announcements",
  description: "Public NORSU alumni events, notices, and university updates.",
};

export default async function AnnouncementsPage() {
  const response = await getPublicAnnouncements(24);
  const announcements = response?.items ?? [];

  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader active="announcements" accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Events and Announcements
          </h1>
          <p className="text-white/78 mx-auto mt-5 max-w-2xl text-base font-medium leading-8">
            Browse active alumni events, office notices, and university updates.
            Open any item to see the full details, schedule, location, and join
            information.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PublicEventsBanner />

          {announcements.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {announcements.map((announcement) => (
                <PublicAnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-stroke bg-white p-8 text-center dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="text-xl font-bold text-dark dark:text-white">
                No active announcements yet
              </h2>
              <p className="mt-2 text-sm font-medium text-dark-5 dark:text-dark-6">
                Alumni office notices will appear here once they are published.
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
