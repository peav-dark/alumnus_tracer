"use client";

import type { JobPosting } from "@/lib/api";
import { usePublicAuthState } from "@/lib/public-auth";
import { useEffect, useState } from "react";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";

export function PublicJobAction({ job }: { job: JobPosting }) {
  const { isLoggedIn, isLoading } = usePublicAuthState();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");

  useEffect(() => {
    if (!detailsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailsOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailsOpen]);

  if (isLoading) {
    return null;
  }

  const handleOpen = () => {
    if (isLoggedIn) {
      setDetailsOpen(true);
      return;
    }

    setAuthView("sign-in");
    setAuthOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mt-auto inline-flex pt-5 text-left text-sm font-bold text-blue-dark transition hover:text-blue"
      >
        {isLoggedIn ? "View full opportunity" : "Login to view full opportunity"}
      </button>

      {detailsOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${job.title} opportunity details`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetailsOpen(false);
            }
          }}
        >
          <article className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-md bg-white shadow-2 dark:bg-gray-dark">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] p-5 text-white dark:border-dark-3 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-light-7 px-3 py-1 text-xs font-bold uppercase text-green-dark">
                    {job.employmentType || "Open role"}
                  </span>
                  {job.industry && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase text-white">
                      {job.industry}
                    </span>
                  )}
                  {job.relatedCourse && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase text-white">
                      {job.relatedCourse}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                  {job.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-white/80 sm:text-base">
                  {job.companyName}
                  {job.location ? ` - ${job.location}` : ""}
                </p>
              </div>

              <button
                type="button"
                title="Close"
                onClick={() => setDetailsOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-md border border-white/25 text-white transition hover:bg-white/10"
              >
                <span className="sr-only">Close opportunity details</span>
                <span aria-hidden="true" className="text-xl leading-none">
                  x
                </span>
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.38fr]">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-bold text-dark dark:text-white">
                    Job Description
                  </h3>
                  <div className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-dark-5 dark:text-dark-6 sm:text-base sm:leading-8">
                    {job.description || "No job description available."}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-dark dark:text-white">
                    Requirements
                  </h3>
                  <div className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-dark-5 dark:text-dark-6 sm:text-base sm:leading-8">
                    {job.requirements || "No requirements listed."}
                  </div>
                </section>
              </div>

              <aside className="h-fit rounded-md border border-stroke bg-gray-1 p-5 dark:border-dark-3 dark:bg-dark-2">
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  Opportunity Details
                </h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <DetailItem label="Deadline" value={formatJobDate(job.deadline)} />
                  <DetailItem label="Salary" value={job.salaryRange || "Not specified"} />
                  <DetailItem label="Contact" value={job.contactEmail || "Not specified"} />
                  <DetailItem label="Posted" value={formatJobDate(job.datePosted)} />
                </dl>

                {job.applicationLink && (
                  <a
                    href={job.applicationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
                  >
                    Apply Online
                  </a>
                )}
              </aside>
            </div>
          </article>
        </div>
      )}

      <PublicAuthModal
        open={authOpen}
        view={authView}
        publicSignupEnabled
        onViewChange={setAuthView}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-dark dark:text-white">{label}</dt>
      <dd className="mt-1 font-medium text-dark-5 dark:text-dark-6">{value}</dd>
    </div>
  );
}

function formatJobDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}
