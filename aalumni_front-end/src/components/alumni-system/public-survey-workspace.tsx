"use client";

import { usePublicAuthState } from "@/lib/public-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";

type InvitationItem = {
  token: string;
  status: string;
  createdAt?: string | null;
  sentAt?: string | null;
  openedAt?: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
  campaign: {
    id: number;
    name: string;
    emailSubject: string;
  };
  surveyTemplate: {
    id: number;
    title: string;
  };
};

type InvitationListResponse = {
  items?: InvitationItem[];
  message?: string;
};

export function PublicSurveyWorkspace() {
  const { isLoggedIn, isLoading, user } = usePublicAuthState({ sync: true });
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");
  const [surveys, setSurveys] = useState<InvitationItem[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [message, setMessage] = useState("");

  const sortedSurveys = useMemo(
    () => [...surveys].sort(compareInvitationItems),
    [surveys],
  );

  useEffect(() => {
    if (isLoading || !isLoggedIn) {
      return;
    }

    void loadSurveys();
  }, [isLoading, isLoggedIn]);

  async function loadSurveys() {
    setLoadingSurveys(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/survey/invitations", {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => ({}))) as InvitationListResponse;

      if (!response.ok) {
        setSurveys([]);
        setMessage(body.message || "Unable to load assigned surveys.");

        return;
      }

      setSurveys(Array.isArray(body.items) ? body.items : []);
    } catch {
      setSurveys([]);
      setMessage("Unable to load assigned surveys.");
    } finally {
      setLoadingSurveys(false);
    }
  }

  return (
    <section className="bg-gray-1 px-5 py-16 dark:bg-dark sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {isLoading || (isLoggedIn && loadingSurveys) ? (
          <div className="rounded-md border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <div className="h-4 w-36 rounded bg-gray-2 dark:bg-dark-2" />
            <div className="mt-4 h-8 w-full max-w-md rounded bg-gray-2 dark:bg-dark-2" />
            <div className="mt-6 grid gap-4">
              <div className="h-28 rounded-md bg-gray-2 dark:bg-dark-2" />
              <div className="h-28 rounded-md bg-gray-2 dark:bg-dark-2" />
            </div>
          </div>
        ) : !isLoggedIn ? (
          <div className="rounded-md border border-stroke bg-white p-8 text-center shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="text-2xl font-black text-dark dark:text-white">
              Login to view assigned surveys
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
              Alumni survey assignments are available after login with an
              approved alumni account.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-7">
            <p className="text-sm font-bold uppercase text-blue-dark">
              Welcome, {user?.firstName || "Alumni"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-dark dark:text-white">
              Assigned surveys
            </h2>

            {message && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {message}
              </div>
            )}

            <div className="mt-6 grid gap-4">
              {sortedSurveys.length ? (
                sortedSurveys.map((survey) => (
                  <div
                    key={survey.token}
                    className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-dark dark:text-white">
                          {survey.surveyTemplate.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">
                          Sent {formatDate(survey.sentAt || survey.createdAt)}
                        </p>
                      </div>
                      <SurveyBadge
                        status={survey.status}
                        completedDate={survey.completedAt}
                      />
                    </div>

                    {isActionableStatus(survey.status) && (
                      <Link
                        href={`/survey/invitations/${encodeURIComponent(survey.token)}`}
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-dark px-4 text-sm font-bold text-white transition hover:bg-blue"
                      >
                        {survey.status === "opened" ? "Continue Survey" : "Answer Survey"}
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-stroke p-6 text-center text-sm font-semibold text-dark-5 dark:border-dark-3 dark:text-dark-6">
                  No surveys assigned yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PublicAuthModal
        open={authOpen}
        view={authView}
        publicSignupEnabled
        redirectPath={pathname}
        onViewChange={setAuthView}
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}

function SurveyBadge({
  status,
  completedDate,
}: {
  status: string;
  completedDate?: string | null;
}) {
  const normalized = status.toLowerCase();

  if (normalized === "completed") {
    return (
      <span className="inline-flex rounded-full bg-[#1D9E75]/10 px-3 py-1 text-xs font-bold uppercase text-[#1D9E75]">
        Completed {completedDate ? `- ${formatDate(completedDate)}` : ""}
      </span>
    );
  }

  if (normalized === "opened") {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
        Opened
      </span>
    );
  }

  if (normalized === "expired") {
    return (
      <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-700">
        Expired
      </span>
    );
  }

  if (normalized === "failed") {
    return (
      <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-700">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
      Pending
    </span>
  );
}

function isActionableStatus(status: string) {
  return ["queued", "sent", "opened"].includes(status.toLowerCase());
}

function compareInvitationItems(a: InvitationItem, b: InvitationItem) {
  const priorityDifference = invitationStatusPriority(a.status) - invitationStatusPriority(b.status);
  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return invitationTimestamp(b) - invitationTimestamp(a);
}

function invitationStatusPriority(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "opened") {
    return 0;
  }

  if (normalized === "sent" || normalized === "queued") {
    return 1;
  }

  if (normalized === "failed") {
    return 2;
  }

  if (normalized === "completed") {
    return 3;
  }

  if (normalized === "expired") {
    return 4;
  }

  return 5;
}

function invitationTimestamp(invitation: InvitationItem) {
  return parseTimestamp(
    invitation.sentAt || invitation.createdAt || invitation.openedAt || invitation.completedAt,
  );
}

function parseTimestamp(value?: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
