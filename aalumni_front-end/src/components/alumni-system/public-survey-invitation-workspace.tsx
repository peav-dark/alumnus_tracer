"use client";

import { clearStoredAuthState, usePublicAuthState } from "@/lib/public-auth";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";

type SurveyQuestion = {
  key: string;
  section: string;
  questionText: string;
  inputType: "text" | "textarea" | "radio" | "checkbox" | "select" | "date" | "repeater";
  options?: Array<string | RepeaterColumn> | null;
};

type RepeaterColumn = {
  key: string;
  label: string;
  type: string;
  options?: string[] | null;
};

type SurveyInvitation = {
  token: string;
  status: string;
  expiresAt?: string | null;
  completedAt?: string | null;
  campaign: {
    name: string;
    emailSubject: string;
  };
  surveyTemplate: {
    title: string;
    description?: string | null;
  };
  questionSections: Array<{
    title: string;
    items: SurveyQuestion[];
  }>;
};

type InvitationResponse = {
  item?: SurveyInvitation;
  message?: string;
};

type Answers = Record<string, string | string[] | Array<Record<string, string>>>;

export function PublicSurveyInvitationWorkspace({ token }: { token: string }) {
  const { isLoggedIn, isLoading } = usePublicAuthState({ sync: true });
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");
  const [invitation, setInvitation] = useState<SurveyInvitation | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoggedIn) {
      setAuthOpen(true);
      setMessage("Please log in with the alumni account that received this survey invitation.");
      return;
    }

    void loadInvitation();
  }, [isLoading, isLoggedIn, token]);

  async function loadInvitation() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/account/survey/invitations/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => ({}))) as InvitationResponse;

      if (!response.ok || !body.item) {
        if (response.status === 401) {
          requireFreshLogin("Please log in again to open this survey invitation.");
          return;
        }

        setMessage(body.message || "Unable to load this survey invitation.");
        return;
      }

      setInvitation(body.item);
    } catch {
      setMessage("Unable to reach the survey invitation endpoint.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAnyAnswer(answers)) {
      setMessage("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/account/survey/invitations/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body = (await response.json().catch(() => ({}))) as InvitationResponse;

      if (!response.ok) {
        if (response.status === 401) {
          requireFreshLogin("Please log in again before submitting this survey.");
          return;
        }

        if (response.status === 409 && body.item) {
          setInvitation(body.item);
          setSubmitted(true);
          setMessage(body.message || "This survey has already been submitted.");
          return;
        }

        if (response.status >= 500 && await markSubmittedIfAlreadyCompleted()) {
          return;
        }

        setMessage(body.message || "Unable to submit this survey.");
        return;
      }

      setInvitation(body.item ?? invitation);
      setSubmitted(true);
      setMessage(body.message || "Your tracer survey was submitted.");
    } catch {
      setMessage("Unable to reach the survey submission endpoint.");
    } finally {
      setSubmitting(false);
    }
  }

  function requireFreshLogin(nextMessage: string) {
    clearStoredAuthState();
    setInvitation(null);
    setSubmitted(false);
    setMessage(nextMessage);
    setAuthView("sign-in");
    setAuthOpen(true);
  }

  async function markSubmittedIfAlreadyCompleted() {
    try {
      const response = await fetch(`/api/account/survey/invitations/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => ({}))) as InvitationResponse;

      if (response.status === 409 && body.item) {
        setInvitation(body.item);
        setSubmitted(true);
        setMessage(body.message || "Your tracer survey was submitted.");
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  const questionCount = useMemo(
    () => invitation?.questionSections.reduce((sum, section) => sum + section.items.length, 0) ?? 0,
    [invitation],
  );

  return (
    <section className="px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {isLoading || loading ? (
          <div className="rounded-md border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <div className="h-5 w-44 rounded bg-gray-2 dark:bg-dark-2" />
            <div className="mt-4 h-9 w-full max-w-xl rounded bg-gray-2 dark:bg-dark-2" />
            <div className="mt-8 space-y-4">
              <div className="h-28 rounded-md bg-gray-2 dark:bg-dark-2" />
              <div className="h-28 rounded-md bg-gray-2 dark:bg-dark-2" />
              <div className="h-28 rounded-md bg-gray-2 dark:bg-dark-2" />
            </div>
          </div>
        ) : !isLoggedIn ? (
          <LoginRequiredCard
            message={message}
            onLogin={() => {
              setAuthView("sign-in");
              setAuthOpen(true);
            }}
          />
        ) : submitted ? (
          <StatusCard title="Survey submitted" message={message || "Thank you for completing your tracer survey."} />
        ) : invitation ? (
          <form
            onSubmit={submitSurvey}
            className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-8"
          >
            <div className="flex flex-col gap-4 border-b border-stroke pb-6 dark:border-dark-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-blue-dark">
                  {invitation.campaign.name}
                </p>
                <h2 className="mt-2 text-3xl font-black text-dark dark:text-white">
                  {invitation.surveyTemplate.title}
                </h2>
                {invitation.surveyTemplate.description && (
                  <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                    {invitation.surveyTemplate.description}
                  </p>
                )}
              </div>
              <div className="rounded-md bg-gray-1 px-4 py-3 text-sm font-semibold text-dark-5 dark:bg-dark-2 dark:text-dark-6">
                {questionCount} questions
                {invitation.expiresAt ? (
                  <span className="block text-xs">Expires {formatDate(invitation.expiresAt)}</span>
                ) : null}
              </div>
            </div>

            {message && (
              <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {message}
              </div>
            )}

            <div className="mt-8 space-y-8">
              {invitation.questionSections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h3 className="text-xl font-black text-dark dark:text-white">
                    {section.title}
                  </h3>
                  <div className="grid gap-4">
                    {section.items.map((question) => (
                      <QuestionField
                        key={question.key}
                        question={question}
                        value={answers[question.key]}
                        onChange={(value) =>
                          setAnswers((current) => ({ ...current, [question.key]: value }))
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full sm:w-auto">
                {message && (
                  <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-md bg-blue-dark px-6 text-sm font-bold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {submitting ? "Submitting..." : "Submit Survey"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <StatusCard title="Survey unavailable" message={message || "Unable to load this survey invitation."} />
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

function LoginRequiredCard({ message, onLogin }: { message: string; onLogin: () => void }) {
  return (
    <div className="rounded-md border border-stroke bg-white p-8 text-center shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="text-2xl font-black text-dark dark:text-white">
        Login to answer this survey
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
        {message || "Please use the alumni account that received this invitation."}
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
      >
        Login
      </button>
    </div>
  );
}

function StatusCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-md border border-stroke bg-white p-8 text-center shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="text-2xl font-black text-dark dark:text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
        {message}
      </p>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: Answers[string] | undefined;
  onChange: (value: Answers[string]) => void;
}) {
  const options = Array.isArray(question.options)
    ? question.options.filter((option): option is string => typeof option === "string")
    : [];

  return (
    <div className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
      <label className="block text-sm font-bold text-dark dark:text-white">
        {question.questionText}
      </label>
      <div className="mt-3">
        {question.inputType === "textarea" ? (
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            className={inputClassName}
          />
        ) : question.inputType === "radio" ? (
          <ChoiceList
            type="radio"
            options={options}
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
          />
        ) : question.inputType === "checkbox" ? (
          <ChoiceList
            type="checkbox"
            options={options}
            value={Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []}
            onChange={onChange}
          />
        ) : question.inputType === "select" ? (
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          >
            <option value="">Select an answer</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : question.inputType === "repeater" ? (
          <RepeaterField
            columns={
              Array.isArray(question.options)
                ? question.options.filter((option): option is RepeaterColumn => typeof option === "object" && option !== null)
                : []
            }
            value={Array.isArray(value) ? value.filter((item): item is Record<string, string> => typeof item === "object" && item !== null && !Array.isArray(item)) : []}
            onChange={onChange}
          />
        ) : (
          <input
            type={question.inputType === "date" ? "date" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          />
        )}
      </div>
    </div>
  );
}

function ChoiceList({
  type,
  options,
  value,
  onChange,
}: {
  type: "radio" | "checkbox";
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = type === "checkbox"
          ? Array.isArray(value) && value.includes(option)
          : value === option;

        return (
          <label key={option} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium dark:bg-gray-dark">
            <input
              type={type}
              checked={checked}
              onChange={(event) => {
                if (type === "radio") {
                  onChange(option);
                  return;
                }

                const current = Array.isArray(value) ? value : [];
                onChange(
                  event.target.checked
                    ? [...current, option]
                    : current.filter((item) => item !== option),
                );
              }}
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

function RepeaterField({
  columns,
  value,
  onChange,
}: {
  columns: RepeaterColumn[];
  value: Array<Record<string, string>>;
  onChange: (value: Array<Record<string, string>>) => void;
}) {
  const row = value[0] ?? {};

  if (columns.length === 0) {
    return (
      <input
        value={row.value ?? ""}
        onChange={(event) => onChange([{ value: event.target.value }])}
        className={inputClassName}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {columns.map((column) => (
        <label key={column.key} className="block">
          <span className="mb-1 block text-xs font-bold text-dark-5 dark:text-dark-6">
            {column.label}
          </span>
          <input
            value={row[column.key] ?? ""}
            onChange={(event) => onChange([{ ...row, [column.key]: event.target.value }])}
            className={inputClassName}
          />
        </label>
      ))}
    </div>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm font-medium text-dark outline-none transition focus:border-blue-dark dark:border-dark-3 dark:bg-gray-dark dark:text-white";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hasAnyAnswer(answers: Answers) {
  return Object.values(answers).some((answer) => {
    if (typeof answer === "string") {
      return answer.trim() !== "";
    }

    if (!Array.isArray(answer)) {
      return false;
    }

    return answer.some((item) => {
      if (typeof item === "string") {
        return item.trim() !== "";
      }

      return Object.values(item).some((value) => value.trim() !== "");
    });
  });
}
