import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicAnnouncementCard } from "@/components/alumni-system/public-announcement-card";
import { LandingHeroSection } from "@/components/alumni-system/landing-hero-section";
import { PublicAuthCta } from "@/components/alumni-system/public-auth-cta";
import { PublicJobAction } from "@/components/alumni-system/public-job-action";
import { alumni, graduate, graduates } from "@/assets/logos";
import { getJobPostingImageUrl, getPublicAnnouncements, getPublicJobs } from "@/lib/api";

export const metadata: Metadata = {
  title: "NORSU Alumni Tracker",
  description:
    "An alumni portal for NORSU graduates to stay connected, update profiles, answer tracer surveys, and discover career opportunities.",
};

const featureCards = [
  {
    title: "Verified alumni access",
    description:
      "Graduates can create accounts, verify email, and access alumni services after approval.",
    icon: "01",
  },
  {
    title: "Tracer survey workflows",
    description:
      "Assigned tracer forms help the university gather reliable graduate outcome data.",
    icon: "02",
  },
  {
    title: "Career opportunity board",
    description:
      "Alumni can discover curated job openings, internships, and partner opportunities.",
    icon: "03",
  },
  {
    title: "Events and announcements",
    description:
      "Published events and notices keep alumni informed about university updates and activities.",
    icon: "04",
  },
];

const platformStats = [
  ["Alumni profiles", "Centralized"],
  ["Tracer surveys", "Guided"],
  ["Career posts", "Curated"],
  ["Events & updates", "Official"],
];

const workflowItems = [
  "Create an alumni account and verify your email",
  "Complete your profile and academic background",
  "Answer tracer surveys assigned by the alumni office",
  "Follow events, announcements, and career opportunities from one portal",
];

const testimonials = [
  {
    name: "Alumni Office",
    role: "NORSU",
    image: "/images/play/testimonials/author-01.png",
    quote:
      "The tracker keeps engagement, career updates, and graduate feedback organized in one place.",
  },
  {
    name: "Graduate Services",
    role: "Tracer support",
    image: "/images/play/testimonials/author-02.png",
    quote:
      "Survey participation becomes easier when alumni can return to a familiar portal.",
  },
  {
    name: "Career Partners",
    role: "Opportunities",
    image: "/images/play/testimonials/author-03.png",
    quote:
      "Posting roles for verified alumni gives partners a focused channel for relevant candidates.",
  },
];

const faqItems = [
  {
    question: "Who can create an account?",
    answer:
      "NORSU graduates can register for an alumni account and complete email verification.",
  },
  {
    question: "Why does my account need approval?",
    answer:
      "Approval protects alumni-only services and keeps the tracker data reliable.",
  },
  {
    question: "Where can I see full job or announcement details?",
    answer:
      "Job, event, and announcement details are public. Logging in is only needed for protected alumni actions like joining event links.",
  },
];

export default async function LandingPage() {
  const announcementResponse = await getPublicAnnouncements(6);
  const announcements = announcementResponse?.items ?? [];
  const jobResponse = await getPublicJobs(6);
  const jobs = jobResponse?.items ?? [];

  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <LandingHeroSection />

      <section id="features" className="relative z-10 pb-16 pt-10 sm:pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Core platform"
            title="Everything alumni need to stay connected"
            description="The landing page is now wired into this system's real public data while keeping the polished Play-style presentation."
          />

          <div className="mt-11 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-md border border-stroke bg-white p-7 shadow-1 transition hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark"
              >
                <div className="mb-7 flex size-14 items-center justify-center rounded-md bg-blue-dark text-lg font-black text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-gray-1 py-16 dark:bg-dark sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className="grid grid-cols-2 gap-5">
            <Image
              src={graduate}
              alt="Alumni collaboration"
              width={570}
              height={420}
              className="h-full min-h-[260px] rounded-md object-cover shadow-2"
            />
            <Image
              src={graduates}
              alt="Graduate support"
              width={570}
              height={420}
              className="mt-10 h-full min-h-[260px] rounded-md object-cover shadow-2"
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase text-blue-dark">About us</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-dark dark:text-white sm:text-4xl">
              A stronger connection between NORSU and its graduates
            </h2>
            <p className="mt-5 text-base font-medium leading-8 text-dark-5 dark:text-dark-6">
              NORSU Alumni Tracker supports long-term alumni engagement by
              bringing graduate records, tracer survey participation, official
              updates, and career resources into one accessible portal.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {platformStats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark"
                >
                  <strong className="block text-2xl font-black text-blue-dark">
                    {value}
                  </strong>
                  <span className="mt-1 block text-sm font-semibold text-dark-5 dark:text-dark-6">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="announcements" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Events and Announcements"
              title="Latest alumni events and office updates"
              description="Preview active events and announcements here. Open any item for the full details, then sign in only when you need protected alumni actions."
            />
            <PublicAuthCta
              loginLabel="Login to join events"
              loginClassName="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-stroke px-5 text-sm font-bold text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            />
          </div>

          {announcements.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {announcements.map((announcement) => (
                <PublicAnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  descriptionLines={3}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active announcements yet"
              description="Alumni office notices will appear here once they are published."
            />
          )}
        </div>
      </section>

      <section
        id="journey"
        className="bg-[linear-gradient(135deg,#1C3FB7_0%,#3C50E0_100%)] py-16 text-white sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.82fr_1fr] lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-white/70">
              Alumni journey
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
              Your university connection after graduation
            </h2>
            <p className="mt-4 text-base font-medium leading-8 text-white/75">
              Register once, keep your profile updated, and return whenever the
              alumni office publishes new surveys, notices, or opportunities.
            </p>
          </div>

          <div className="grid gap-3">
            {workflowItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-md bg-white p-4 text-dark shadow-1"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-light-5 text-sm font-black text-blue-dark">
                  {index + 1}
                </span>
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="career-opportunities"
        className="bg-gray-1 py-16 dark:bg-dark sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Career opportunities"
              title="Active roles for NORSU alumni"
              description="Preview available job postings here. Full opportunity details are available after login with an approved alumni account."
            />
            <PublicAuthCta
              loginLabel="Login to view full jobs"
              loginClassName="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-stroke bg-white px-5 text-sm font-bold text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:bg-dark-2"
            />
          </div>

          {jobs.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  <h3 className="mt-5 text-xl font-bold text-dark dark:text-white">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-dark-5 dark:text-dark-6">
                    {job.companyName}
                    {job.location ? ` - ${job.location}` : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                    {job.description || "No opportunity preview available."}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-dark-5 dark:text-dark-6">
                    Deadline: {formatLandingDate(job.deadline)}
                  </div>
                  <PublicJobAction job={job} />
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active career opportunities yet"
              description="Alumni-ready jobs and internships will appear here once posted."
            />
          )}
        </div>
      </section>

      <section id="testimonials" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Built for alumni work"
            title="A focused portal for everyday alumni services"
            description="The template sections now speak to the workflows this system already supports."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
              >
                <p className="text-sm font-medium leading-7 text-dark-5 dark:text-dark-6">
                  {testimonial.quote}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-dark dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-gray-1 py-16 dark:bg-dark sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="FAQ"
            title="Common alumni access questions"
            description="A quick orientation for graduates arriving from the public landing page."
          />

          <div className="mt-10 grid gap-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
              >
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid overflow-hidden rounded-md bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] shadow-4 md:grid-cols-[1fr_0.85fr]">
            <div className="p-8 text-white sm:p-10 lg:p-12">
              <p className="text-sm font-bold uppercase text-white/70">
                Contact us
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                Need help with your alumni account?
              </h2>
              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-white/75">
                Reach out to the alumni office for registration, profile, tracer
                survey, or job board assistance.
              </p>
              <PublicAuthCta
                wrapperClassName="mt-7 flex flex-col gap-3 sm:flex-row"
                registerLabel="Create Alumni Account"
                registerClassName="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-bold text-dark transition hover:bg-gray-2"
                loginLabel="Login"
                loginClassName="inline-flex h-12 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              />
            </div>
            <div className="bg-[#102B75] p-8 text-white sm:p-10 lg:p-12">
              <p className="text-sm font-semibold text-white/70">
                Alumni Office
              </p>
              <p className="mt-3 text-2xl font-black">alumni@norsu.edu.ph</p>
              <p className="mt-5 text-sm font-medium leading-7 text-white/65">
                For approved alumni, the protected dashboard contains profile
                updates, announcements, job details, and tracer survey access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function LandingFooter() {
  const links = [
    ["Home", "/"],
    ["About", "/about"],
    ["Events & Announcements", "/announcements"],
    ["Career Opportunities", "/career-opportunities"],
    ["FAQ", "/faq"],
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0B215F] py-12 text-white">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="size-11 overflow-hidden rounded-full">
              <Image
                src={alumni}
                alt="NORSU Alumni Logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </span>
            <span>
              <span className="block text-lg font-black leading-none">
                NORSU Alumni
              </span>
              <span className="mt-1 block text-xs font-semibold text-white/60">
                Tracker System
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-[420px] text-sm font-medium leading-7 text-white/60">
            An alumni portal for verified graduates, official university
            updates, tracer surveys, and alumni-ready opportunities.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/65">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-white">
              {label}
            </a>
          ))}
        </div>
      </div>

      <Image
        src="/images/play/footer/shape-1.svg"
        alt=""
        width={570}
        height={492}
        className="pointer-events-none absolute left-0 top-0 opacity-40"
      />
      <Image
        src="/images/play/footer/shape-3.svg"
        alt=""
        width={372}
        height={264}
        className="pointer-events-none absolute bottom-0 right-0 opacity-40"
      />
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      <p className="text-sm font-bold uppercase text-blue-dark">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-dark dark:text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base font-medium leading-7 text-dark-5 dark:text-dark-6">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10 rounded-md border border-dashed border-stroke bg-white p-8 text-center dark:border-dark-3 dark:bg-gray-dark">
      <h3 className="text-xl font-bold text-dark dark:text-white">{title}</h3>
      <p className="mt-2 text-sm font-medium text-dark-5 dark:text-dark-6">
        {description}
      </p>
    </div>
  );
}

function formatLandingDate(value: string | null) {
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
