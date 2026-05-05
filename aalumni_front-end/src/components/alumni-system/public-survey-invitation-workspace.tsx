"use client";

import { clearStoredAuthState, usePublicAuthState } from "@/lib/public-auth";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";
import {
  PhAddressPicker,
  EMPTY_PH_ADDRESS,
  formatPhAddress,
  type PhAddressValue,
} from "@/components/forms/ph-address-picker";

type SurveyQuestion = {
  key: string;
  section: string;
  questionText: string;
  inputType: "text" | "textarea" | "radio" | "checkbox" | "select" | "date" | "repeater" | "location";
  options?: Array<string | RepeaterColumn> | null;
  isRequired?: boolean;
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
  const [missingRequiredKeys, setMissingRequiredKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

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
      setMissingRequiredKeys([]);
      setCurrentSectionIndex(0);
    } catch {
      setMessage("Unable to reach the survey invitation endpoint.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const totalSections = invitation?.questionSections.length ?? 0;
    if (invitation && totalSections > 0 && currentSectionIndex < totalSections - 1) {
      if (currentSection && sectionHasMissingRequired(currentSection, answers)) {
        setMissingRequiredKeys(
          getMissingRequiredQuestionKeys([currentSection], answers),
        );
        setMessage("Please answer all required questions before continuing.");
        return;
      }

      setMissingRequiredKeys([]);
      setCurrentSectionIndex((index) => Math.min(index + 1, totalSections - 1));
      return;
    }

    if (invitation && hasMissingRequiredAnswers(invitation.questionSections, answers)) {
      setMissingRequiredKeys(getMissingRequiredQuestionKeys(invitation.questionSections, answers));
      setMessage("Please answer all required questions before submitting.");
      return;
    }

    if (!hasAnyAnswer(answers)) {
      setMessage("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMissingRequiredKeys([]);

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
  const totalSections = invitation?.questionSections.length ?? 0;
  const sectionIndex = totalSections === 0
    ? 0
    : Math.min(currentSectionIndex, totalSections - 1);
  const currentSection = totalSections === 0
    ? null
    : invitation?.questionSections[sectionIndex] ?? null;
  const isFirstSection = sectionIndex === 0;
  const isLastSection = totalSections === 0 || sectionIndex === totalSections - 1;
  const hasMissingRequiredInSection = currentSection
    ? sectionHasMissingRequired(currentSection, answers)
    : false;
  const hasRequiredQuestions = useMemo(
    () => invitation?.questionSections.some((section) =>
      section.items.some((question) => question.isRequired)) ?? false,
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
                {hasRequiredQuestions && (
                  <p className="mt-2 text-xs font-semibold text-red">
                    Fields marked with * are required.
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
              {currentSection ? (
                <section key={currentSection.title} className="space-y-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h3 className="text-xl font-black text-dark dark:text-white">
                      {currentSection.title}
                    </h3>
                    {totalSections > 1 && (
                      <span className="text-xs font-semibold text-dark-5 dark:text-dark-6">
                        Section {sectionIndex + 1} of {totalSections}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {currentSection.items.map((question) => (
                      <QuestionField
                        key={question.key}
                        question={question}
                        value={answers[question.key]}
                        isInvalid={missingRequiredKeys.includes(question.key)}
                        onChange={(value) =>
                          setAnswers((current) => ({ ...current, [question.key]: value }))
                        }
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            {totalSections > 1 && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={isFirstSection}
                  onClick={() => setCurrentSectionIndex((index) => Math.max(index - 1, 0))}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-stroke px-5 text-sm font-semibold text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Previous
                </button>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    disabled={isLastSection}
                    onClick={() => {
                      if (hasMissingRequiredInSection && currentSection) {
                        setMissingRequiredKeys(
                          getMissingRequiredQuestionKeys([currentSection], answers),
                        );
                        setMessage("Please answer all required questions before continuing.");
                        return;
                      }

                      setMissingRequiredKeys([]);
                      setMessage("");
                      setCurrentSectionIndex((index) => Math.min(index + 1, totalSections - 1));
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-semibold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next Section
                  </button>
                  {hasMissingRequiredInSection && !isLastSection ? (
                    <span className="text-xs font-semibold text-red">
                      Complete required fields to continue.
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {isLastSection && (
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
            )}
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
  isInvalid,
  onChange,
}: {
  question: SurveyQuestion;
  value: Answers[string] | undefined;
  isInvalid: boolean;
  onChange: (value: Answers[string]) => void;
}) {
  const options = Array.isArray(question.options)
    ? question.options.filter((option): option is string => typeof option === "string")
    : [];

  return (
    <div
      className={`rounded-md border p-4 dark:bg-dark-2 ${isInvalid
        ? "border-red bg-red/[0.06] dark:border-red/40"
        : "border-stroke bg-gray-1 dark:border-dark-3"
      }`}
    >
      <label className="block text-sm font-bold text-dark dark:text-white">
        {question.questionText}
        {question.isRequired ? (
          <span className="ml-1 text-red" aria-hidden="true">*</span>
        ) : null}
        {question.isRequired ? <span className="sr-only">Required</span> : null}
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
        ) : question.inputType === "location" ? (
          <LocationField
            value={typeof value === "string" ? value : ""}
            onChange={(formatted) => onChange(formatted)}
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
      {isInvalid ? (
        <p className="mt-2 text-xs font-semibold text-red">
          This required question needs to be filled up.
        </p>
      ) : null}
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

function LocationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (formatted: string) => void;
}) {
  const [address, setAddress] = useState<PhAddressValue>(() => {
    if (!value) return EMPTY_PH_ADDRESS;

    // Parse "Barangay, City, Province, Region" back into parts
    const parts = value.split(", ").map((s) => s.trim());

    return {
      barangay: parts[0] ?? "",
      barangayCode: "",
      cityMun: parts[1] ?? "",
      cityMunCode: "",
      province: parts[2] ?? "",
      provinceCode: "",
      region: parts[3] ?? "",
      regionCode: "",
    };
  });

  const handleChange = (next: PhAddressValue) => {
    setAddress(next);
    const formatted = formatPhAddress(next);
    onChange(formatted);
  };

  return <PhAddressPicker value={address} onChange={handleChange} />;
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

function hasMissingRequiredAnswers(sections: SurveyInvitation["questionSections"], answers: Answers) {
  return sections.some((section) =>
    section.items.some((question) =>
      question.isRequired && isEmptyAnswer(answers[question.key])),
  );
}

function getMissingRequiredQuestionKeys(
  sections: SurveyInvitation["questionSections"],
  answers: Answers,
) {
  return sections.flatMap((section) =>
    section.items
      .filter((question) => question.isRequired && isEmptyAnswer(answers[question.key]))
      .map((question) => question.key),
  );
}

function sectionHasMissingRequired(
  section: SurveyInvitation["questionSections"][number],
  answers: Answers,
) {
  return section.items.some((question) =>
    question.isRequired && isEmptyAnswer(answers[question.key]));
}

function isEmptyAnswer(answer: Answers[string] | undefined) {
  if (answer === undefined || answer === null) {
    return true;
  }

  if (typeof answer === "string") {
    return answer.trim() === "";
  }

  if (!Array.isArray(answer) || answer.length === 0) {
    return true;
  }

  return answer.every((item) => {
    if (typeof item === "string") {
      return item.trim() === "";
    }

    return Object.values(item).every((value) => value.trim() === "");
  });
}
