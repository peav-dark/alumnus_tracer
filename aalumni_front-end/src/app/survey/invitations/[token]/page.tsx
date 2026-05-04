import { PublicHeader } from "@/components/alumni-system/public-header";
import { PublicSurveyInvitationWorkspace } from "@/components/alumni-system/public-survey-invitation-workspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survey Invitation",
  description: "Answer your assigned NORSU alumni tracer survey invitation.",
};

type SurveyInvitationPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SurveyInvitationPage({ params }: SurveyInvitationPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-gray-1 text-dark dark:bg-[#020d1a]">
      <PublicHeader accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-14 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
            NORSU Alumni Tracker
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            Survey Invitation
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-white/78">
            Complete the tracer survey assigned to your alumni account.
          </p>
        </div>
      </section>

      <PublicSurveyInvitationWorkspace token={token} />
    </main>
  );
}
