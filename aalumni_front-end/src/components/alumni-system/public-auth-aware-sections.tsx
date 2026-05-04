"use client";

import { usePublicAuthState } from "@/lib/public-auth";

export function PublicEventsBanner() {
  const { isLoggedIn, user } = usePublicAuthState({ sync: true });

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="mb-8 rounded-md border border-[#1D9E75]/25 bg-[#1D9E75]/10 px-5 py-4 text-sm font-semibold text-[#0F6B52]">
      Welcome, {user.name}! Don&apos;t miss these upcoming events.
    </div>
  );
}

export function PublicCareersFilter() {
  const { isLoggedIn, user } = usePublicAuthState({ sync: true });

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div
      id="careers-filter"
      className="mb-8 flex flex-col gap-3 rounded-md border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm font-bold uppercase text-blue-dark">
          Personalized filter
        </p>
        <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">
          Filter by your course to quickly scan matching opportunities.
        </p>
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-dark dark:text-white">
        Filter by your course:
        <select
          defaultValue={user.course}
          className="h-11 rounded-md border border-stroke bg-gray-1 px-3 text-sm font-semibold outline-none dark:border-dark-3 dark:bg-dark-2"
        >
          <option>{user.course}</option>
          <option>All courses</option>
          <option>BS Computer Science</option>
          <option>BS Business Administration</option>
          <option>BS Civil Engineering</option>
        </select>
      </label>
    </div>
  );
}
