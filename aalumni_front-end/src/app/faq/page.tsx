import { PublicHeader } from "@/components/alumni-system/public-header";
import { PublicAuthCta } from "@/components/alumni-system/public-auth-cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions for NORSU alumni portal access.",
};

const faqItems = [
  {
    question: "Who can create an alumni account?",
    answer:
      "NORSU graduates can register for an alumni account, verify their email, and wait for account approval.",
  },
  {
    question: "Why does my account need approval?",
    answer:
      "Approval protects alumni-only services and helps keep graduate records and tracer survey data reliable.",
  },
  {
    question: "Can I view announcements without logging in?",
    answer:
      "You can view public previews on the announcements page. Full announcement details are available after login.",
  },
  {
    question: "Can I browse career opportunities without logging in?",
    answer:
      "You can browse public opportunity previews. Full job details and application information require an approved account.",
  },
  {
    question: "What should I do after registering?",
    answer:
      "Verify your email, wait for approval, then complete your profile and answer any available tracer surveys.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader active="faq" accent="blue" />

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-white/78 mx-auto mt-5 max-w-2xl text-base font-medium leading-8">
            Quick answers for alumni registration, account approval, public
            previews, and protected portal access.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
              >
                <h2 className="text-lg font-bold text-dark dark:text-white">
                  {item.question}
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-md bg-[linear-gradient(135deg,#1C3FB7_0%,#3C50E0_100%)] p-6 text-center text-white shadow-4">
            <h2 className="text-2xl font-black">Ready to access the portal?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75">
              Create an account or login to continue with alumni services,
              profile updates, tracer surveys, and protected details.
            </p>
            <PublicAuthCta
              wrapperClassName="mt-6 flex flex-col justify-center gap-3 sm:flex-row"
              registerLabel="Create Alumni Account"
              registerClassName="inline-flex h-11 items-center justify-center rounded-md bg-white px-5 text-sm font-bold text-dark transition hover:bg-gray-2"
              loginLabel="Login"
              loginClassName="inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
