import { PublicHeader } from "@/components/alumni-system/public-header";
import { PublicSurveyWorkspace } from "@/components/alumni-system/public-survey-workspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracer Survey",
  description: "Alumni tracer survey access for NORSU graduates.",
};

export default function SurveyPage() {
  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Tracer Survey
          </h1>
          <p className="text-white/78 mx-auto mt-5 max-w-2xl text-base font-medium leading-8">
            View assigned tracer surveys and continue alumni feedback work from
            one focused page.
          </p>
        </div>
      </section>

      <PublicSurveyWorkspace />
    </main>
  );
}
