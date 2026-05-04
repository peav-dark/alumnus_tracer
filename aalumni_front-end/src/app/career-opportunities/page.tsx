import { getJobPostingImageUrl, getPublicJobs } from "@/lib/api";
import { PublicAuthCta } from "@/components/alumni-system/public-auth-cta";
import { PublicCareersFilter } from "@/components/alumni-system/public-auth-aware-sections";
import { PublicHeader } from "@/components/alumni-system/public-header";
import { PublicJobAction } from "@/components/alumni-system/public-job-action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Opportunities",
  description: "Public career opportunity previews for NORSU alumni.",
};

export default async function CareerOpportunitiesPage() {
  const response = await getPublicJobs(24);
  const jobs = response?.items ?? [];

  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader active="careers" accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Career Opportunities
          </h1>
          <p className="text-white/78 mx-auto mt-5 max-w-2xl text-base font-medium leading-8">
            Browse active job postings, internships, and partner opportunities.
            Full details are available after login with an approved alumni
            account.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PublicCareersFilter />

          {jobs.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="flex min-h-[280px] flex-col rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
                >
                  {getJobPostingImageUrl(job.imageFilename) && (
                    <div className="mb-5 overflow-hidden rounded-xl border border-stroke/70 bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
                      <img
                        src={getJobPostingImageUrl(job.imageFilename) ?? ""}
                        alt={`${job.title} opportunity preview`}
                        className="h-32 w-full object-cover sm:h-36"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-light-7 px-3 py-1 text-xs font-bold uppercase text-green-dark">
                      {job.employmentType || "Open role"}
                    </span>
                    {job.relatedCourse && (
                      <span className="rounded-full bg-blue-light-5 px-3 py-1 text-xs font-bold uppercase text-blue-dark">
                        {job.relatedCourse}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-dark dark:text-white">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-dark-5 dark:text-dark-6">
                    {job.companyName}
                    {job.location ? ` - ${job.location}` : ""}
                  </p>
                  <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                    {job.description || "No opportunity preview available."}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-dark-5 dark:text-dark-6">
                    Deadline: {formatPublicDate(job.deadline)}
                  </div>
                  <PublicJobAction job={job} />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-stroke bg-white p-8 text-center dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="text-xl font-bold text-dark dark:text-white">
                No active career opportunities yet
              </h2>
              <p className="mt-2 text-sm font-medium text-dark-5 dark:text-dark-6">
                Alumni-ready jobs and internships will appear here once posted.
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <PublicAuthCta
              loginLabel="Login to open protected jobs"
              loginClassName="inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function formatPublicDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}
