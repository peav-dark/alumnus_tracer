import { PublicHeader } from "@/components/alumni-system/public-header";
import { PublicAuthCta } from "@/components/alumni-system/public-auth-cta";
import { graduate, graduates } from "@/assets/logos";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "About the NORSU Alumni Tracker System.",
};

const focusAreas = [
  {
    title: "Alumni engagement",
    description:
      "Keep graduates connected with official notices, account services, and university activities.",
  },
  {
    title: "Graduate outcomes",
    description:
      "Support tracer survey participation so NORSU can understand employment and program impact.",
  },
  {
    title: "Career support",
    description:
      "Provide alumni with a focused channel for opportunities shared by the university and partners.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader active="about" accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            About NORSU Alumni Tracker
          </h1>
          <p className="text-white/78 mx-auto mt-5 max-w-2xl text-base font-medium leading-8">
            A public gateway and alumni portal built to keep NORSU graduates
            connected after graduation.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
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
            <p className="text-sm font-bold uppercase text-blue-dark">
              Alumni services
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-dark dark:text-white sm:text-4xl">
              A stronger connection between the university and its graduates
            </h2>
            <p className="mt-5 text-base font-medium leading-8 text-dark-5 dark:text-dark-6">
              NORSU Alumni Tracker brings graduate profiles, tracer survey
              participation, official announcements, and career resources into
              one accessible portal.
            </p>
            <p className="mt-4 text-base font-medium leading-8 text-dark-5 dark:text-dark-6">
              The system helps alumni stay informed while giving the university
              better insight into graduate outcomes and alumni needs.
            </p>

            <PublicAuthCta
              wrapperClassName="mt-8"
              registerLabel="Create Alumni Account"
              registerClassName="inline-flex h-12 items-center justify-center rounded-md bg-blue-dark px-6 text-sm font-bold text-white transition hover:bg-blue"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-1 px-5 py-16 dark:bg-dark sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase text-blue-dark">
              What it supports
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-dark dark:text-white sm:text-4xl">
              Built around real alumni workflows
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {focusAreas.map((item) => (
              <article
                key={item.title}
                className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
              >
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
