"use client";

import type {
  QrRegistrationBatch,
  SurveyCampaignPreviewResponse,
  SurveyTemplate,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type FieldErrors = Record<string, string>;

export function CampaignLaunchPanel({
  surveys,
  batches,
}: {
  surveys: SurveyTemplate[];
  batches: QrRegistrationBatch[];
}) {
  const router = useRouter();
  const activeSurveys = useMemo(
    () => surveys.filter((survey) => survey.isActive),
    [surveys],
  );
  const sortedBatches = useMemo(
    () =>
      [...batches].sort(
        (a, b) => Number(b.isOpen) - Number(a.isOpen) || b.batchYear - a.batchYear,
      ),
    [batches],
  );
  const firstSurvey = activeSurveys[0];
  const firstBatch = sortedBatches[0];
  const [surveyTemplateId, setSurveyTemplateId] = useState(
    firstSurvey ? String(firstSurvey.id) : "",
  );
  const [targetBatchYear, setTargetBatchYear] = useState(
    firstBatch ? String(firstBatch.batchYear) : "",
  );
  const selectedSurvey = activeSurveys.find(
    (survey) => survey.id === Number(surveyTemplateId),
  );
  const [name, setName] = useState(defaultCampaignName(firstSurvey));
  const [emailSubject, setEmailSubject] = useState(defaultSubject(firstSurvey));
  const [emailBody, setEmailBody] = useState(defaultBody);
  const [expiryDays, setExpiryDays] = useState("30");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledSendAt, setScheduledSendAt] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<SurveyCampaignPreviewResponse | null>(
    null,
  );
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const hasValidScheduleDate =
    sendMode === "now" || isFutureDateTime(scheduledSendAt);
  const canSubmit =
    Boolean(surveyTemplateId) &&
    Boolean(targetBatchYear) &&
    Boolean(selectedSurvey?.questionCount) &&
    hasValidScheduleDate &&
    activeSurveys.length > 0 &&
    sortedBatches.length > 0 &&
    !sending;

  const handleSurveyChange = (value: string) => {
    setSurveyTemplateId(value);
    setPreview(null);

    const survey = activeSurveys.find((item) => item.id === Number(value));
    if (survey) {
      setName(defaultCampaignName(survey));
      setEmailSubject(defaultSubject(survey));
    }
  };

  const buildPayload = () => ({
    surveyTemplateId: Number(surveyTemplateId),
    targetBatchYear: Number(targetBatchYear),
    name,
    emailSubject,
    emailBody,
    expiryDays: Number(expiryDays),
    sendMode,
    scheduledSendAt,
  });

  const previewRecipients = async () => {
    setPreviewing(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin/gts/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = (await response.json().catch(() => ({}))) as
        | SurveyCampaignPreviewResponse
        | { message?: string; errors?: FieldErrors };

      if (!response.ok) {
        setError(body.message || "Unable to preview campaign recipients.");
        setFieldErrors("errors" in body ? body.errors ?? {} : {});
        return;
      }

      setPreview(body as SurveyCampaignPreviewResponse);
    } catch {
      setError("Unable to preview campaign recipients.");
    } finally {
      setPreviewing(false);
    }
  };

  const sendCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    if (sendMode === "schedule" && !isFutureDateTime(scheduledSendAt)) {
      setFieldErrors({
        scheduledSendAt: "Please choose a future send date and time.",
      });
      setSending(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/gts/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setError(body.message || "Unable to send campaign.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setMessage(body.message || "Campaign queued.");
      setPreview(null);
      router.refresh();
    } catch {
      setError("Unable to send campaign.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={sendCampaign} className="p-5 sm:p-7.5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Survey" error={fieldErrors.surveyTemplateId}>
          <select
            value={surveyTemplateId}
            onChange={(event) => handleSurveyChange(event.target.value)}
            className={fieldClassName}
            disabled={activeSurveys.length === 0}
          >
            {activeSurveys.length ? (
              activeSurveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.title} ({survey.questionCount} questions)
                </option>
              ))
            ) : (
              <option value="">No active surveys</option>
            )}
          </select>
        </Field>

        <Field label="Target Batch" error={fieldErrors.targetBatchYear}>
          <select
            value={targetBatchYear}
            onChange={(event) => {
              setTargetBatchYear(event.target.value);
              setPreview(null);
            }}
            className={fieldClassName}
            disabled={sortedBatches.length === 0}
          >
            {sortedBatches.length ? (
              sortedBatches.map((batch) => (
                <option key={batch.id} value={batch.batchYear}>
                  Batch {batch.batchYear} {batch.isOpen ? "" : "(closed)"}
                </option>
              ))
            ) : (
              <option value="">No batches</option>
            )}
          </select>
        </Field>

        <Field label="Campaign Name" error={fieldErrors.name}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
          />
        </Field>

        <Field label="Invitation Expiry" error={fieldErrors.expiryDays}>
          <input
            type="number"
            min={1}
            max={180}
            value={expiryDays}
            onChange={(event) => setExpiryDays(event.target.value)}
            className={fieldClassName}
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-5">
        <Field label="Email Subject" error={fieldErrors.emailSubject}>
          <input
            value={emailSubject}
            onChange={(event) => setEmailSubject(event.target.value)}
            className={fieldClassName}
          />
        </Field>

        <Field label="Email Body" error={fieldErrors.emailBody}>
          <textarea
            rows={7}
            value={emailBody}
            onChange={(event) => setEmailBody(event.target.value)}
            className={fieldClassName}
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-dark dark:text-white">
            Send Option
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={sendModeClassName(sendMode === "now")}>
              <input
                type="radio"
                name="sendMode"
                value="now"
                checked={sendMode === "now"}
                onChange={() => setSendMode("now")}
                className="size-4"
              />
              <span>
                <span className="block font-semibold text-dark dark:text-white">
                  Send now
                </span>
                <span className="text-sm font-medium text-dark-5">
                  Queue invitations immediately.
                </span>
              </span>
            </label>
            <label className={sendModeClassName(sendMode === "schedule")}>
              <input
                type="radio"
                name="sendMode"
                value="schedule"
                checked={sendMode === "schedule"}
                onChange={() => setSendMode("schedule")}
                className="size-4"
              />
              <span>
                <span className="block font-semibold text-dark dark:text-white">
                  Schedule
                </span>
                <span className="text-sm font-medium text-dark-5">
                  Send at a later date.
                </span>
              </span>
            </label>
          </div>
          {fieldErrors.sendMode && (
            <span className="mt-1 block text-sm text-[#D34053]">
              {fieldErrors.sendMode}
            </span>
          )}
        </fieldset>

        {sendMode === "schedule" && (
          <Field label="Send Date and Time" error={fieldErrors.scheduledSendAt}>
            <input
              type="datetime-local"
              min={minimumScheduleDateTime()}
              value={scheduledSendAt}
              onChange={(event) => {
                setScheduledSendAt(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  scheduledSendAt: "",
                }));
              }}
              className={fieldClassName}
            />
          </Field>
        )}
      </div>

      {selectedSurvey && selectedSurvey.questionCount === 0 && (
        <p className="mt-4 rounded-md bg-[#FFA70B]/[0.08] px-4 py-3 text-sm font-medium text-[#B56A00]">
          Add questions to this survey before sending it.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-[#D34053]/[0.08] px-4 py-3 text-sm font-medium text-[#D34053]">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-md bg-[#219653]/[0.08] px-4 py-3 text-sm font-medium text-[#219653]">
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={previewRecipients}
          disabled={!canSubmit || previewing}
          className="inline-flex h-11 items-center justify-center rounded-md border border-stroke px-5 text-sm font-semibold text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          {previewing ? "Previewing..." : "Preview Recipients"}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending
            ? sendMode === "schedule"
              ? "Scheduling..."
              : "Sending..."
            : sendMode === "schedule"
              ? "Schedule Campaign"
              : "Send Campaign"}
        </button>
      </div>

      {preview && (
        <div className="mt-6 border-t border-stroke pt-5 dark:border-dark-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-dark dark:text-white">
              {preview.count} recipient{preview.count === 1 ? "" : "s"} found in Batch {targetBatchYear}
            </h3>
            <span className="text-sm font-medium text-dark-5">
              Showing up to 25 alumni
            </span>
          </div>

          {preview.items.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stroke text-dark-5 dark:border-dark-3">
                    <th className="py-3 pr-4 font-semibold">Name</th>
                    <th className="py-3 pr-4 font-semibold">Email</th>
                    <th className="py-3 pr-4 font-semibold">Batch</th>
                    <th className="py-3 pr-4 font-semibold">Course</th>
                    <th className="py-3 font-semibold">College</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.items.map((recipient) => (
                    <tr
                      key={recipient.id}
                      className="border-b border-stroke last:border-0 dark:border-dark-3"
                    >
                      <td className="py-3 pr-4 font-medium text-dark dark:text-white">
                        {recipient.name}
                      </td>
                      <td className="py-3 pr-4">{recipient.email}</td>
                      <td className="py-3 pr-4">
                        {recipient.yearGraduated ? `Batch ${recipient.yearGraduated}` : "Not set"}
                      </td>
                      <td className="py-3 pr-4">{recipient.course || "Not set"}</td>
                      <td className="py-3">{recipient.college || "Not set"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 font-medium text-dark-5">
              No active alumni accounts match this batch.
            </p>
          )}
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-[#D34053]">{error}</span>}
    </label>
  );
}

const fieldClassName =
  "w-full rounded-md border border-stroke bg-white px-4 py-3 text-sm font-medium text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";

function sendModeClassName(active: boolean) {
  return active
    ? "flex gap-3 rounded-md border border-primary bg-primary/[0.04] p-4"
    : "flex gap-3 rounded-md border border-stroke p-4 dark:border-dark-3";
}

function minimumScheduleDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  date.setSeconds(0, 0);

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function isFutureDateTime(value: string) {
  if (!value) {
    return false;
  }

  const selectedDate = new Date(value);

  return !Number.isNaN(selectedDate.getTime()) && selectedDate > new Date();
}

const defaultBody =
  "Good day!\n\nYou are invited to complete the Graduate Tracer Survey. Please log in using your alumni account and submit your response before the invitation expires.\n\nThank you.";

function defaultCampaignName(survey?: SurveyTemplate) {
  return survey ? `${survey.title} Alumni Campaign` : "";
}

function defaultSubject(survey?: SurveyTemplate) {
  return survey
    ? `Graduate Tracer Survey Invitation - ${survey.title}`
    : "Graduate Tracer Survey Invitation";
}
