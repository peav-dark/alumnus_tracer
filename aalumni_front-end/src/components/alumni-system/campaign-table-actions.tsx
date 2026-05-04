"use client";

import type { QrRegistrationBatch, SurveyCampaign, SurveyTemplate } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IconActionLink } from "./icon-action-link";

type FieldErrors = Record<string, string>;

type CampaignTableActionsProps = {
  campaign: SurveyCampaign;
  surveys: SurveyTemplate[];
  batches: QrRegistrationBatch[];
};

export function CampaignTableActions({ campaign, surveys, batches }: CampaignTableActionsProps) {
  const router = useRouter();
  const canEdit = ["draft", "scheduled"].includes(campaign.status.toLowerCase());
  const sortedBatches = useMemo(
    () => [...batches].sort((a, b) => b.batchYear - a.batchYear),
    [batches],
  );
  const [open, setOpen] = useState(false);
  const [surveyTemplateId, setSurveyTemplateId] = useState(String(campaign.surveyTemplate.id));
  const [targetBatchYear, setTargetBatchYear] = useState(
    String(campaign.targetGraduationYears[0] ?? ""),
  );
  const [name, setName] = useState(campaign.name);
  const [emailSubject, setEmailSubject] = useState(campaign.emailSubject);
  const [emailBody, setEmailBody] = useState(campaign.emailBody);
  const [expiryDays, setExpiryDays] = useState(String(campaign.expiryDays));
  const [scheduledSendAt, setScheduledSendAt] = useState(
    toDateTimeLocalValue(campaign.scheduledSendAt),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch(`/api/admin/gts/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyTemplateId: Number(surveyTemplateId),
          targetBatchYear: Number(targetBatchYear),
          name,
          emailSubject,
          emailBody,
          expiryDays: Number(expiryDays),
          scheduledSendAt,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setError(body.message || "Unable to update campaign.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setMessage(body.message || "Campaign updated.");
      router.refresh();
      setOpen(false);
    } catch {
      setError("Unable to update campaign.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <IconActionLink
          href={`/gts/responses?campaignId=${campaign.id}`}
          label="View responses"
          icon="responses"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!canEdit}
          title={canEdit ? "Edit campaign" : "Only scheduled campaigns can be edited"}
          aria-label={canEdit ? "Edit campaign" : "Only scheduled campaigns can be edited"}
          className="p-1.5 text-primary transition hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M11.667 4.167 15.833 8.333M2.5 17.5l3.523-.783a3.333 3.333 0 0 0 1.707-.909L16.25 7.287a1.768 1.768 0 0 0 0-2.5l-1.037-1.037a1.768 1.768 0 0 0-2.5 0l-8.52 8.52a3.333 3.333 0 0 0-.91 1.707L2.5 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-3xl rounded-md bg-white p-6 shadow-2 dark:bg-gray-dark">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Edit Campaign</p>
                <h3 className="mt-2 text-2xl font-black text-dark dark:text-white">
                  {campaign.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-md border border-stroke text-dark dark:border-dark-3 dark:text-white"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <Field label="Survey" error={fieldErrors.surveyTemplateId}>
                <select value={surveyTemplateId} onChange={(event) => setSurveyTemplateId(event.target.value)} className={fieldClassName}>
                  {surveys.map((survey) => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title} {survey.isActive ? "" : "(inactive)"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Target Batch" error={fieldErrors.targetBatchYear}>
                <select value={targetBatchYear} onChange={(event) => setTargetBatchYear(event.target.value)} className={fieldClassName}>
                  {sortedBatches.map((batch) => (
                    <option key={batch.id} value={batch.batchYear}>
                      Batch {batch.batchYear}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Campaign Name" error={fieldErrors.name}>
                <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClassName} />
              </Field>

              <Field label="Invitation Expiry" error={fieldErrors.expiryDays}>
                <input type="number" min={1} max={180} value={expiryDays} onChange={(event) => setExpiryDays(event.target.value)} className={fieldClassName} />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field label="Email Subject" error={fieldErrors.emailSubject}>
                <input value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} className={fieldClassName} />
              </Field>

              <Field label="Email Body" error={fieldErrors.emailBody}>
                <textarea rows={7} value={emailBody} onChange={(event) => setEmailBody(event.target.value)} className={fieldClassName} />
              </Field>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Field label="Send Date and Time" error={fieldErrors.scheduledSendAt}>
                <input type="datetime-local" min={minimumScheduleDateTime()} value={scheduledSendAt} onChange={(event) => setScheduledSendAt(event.target.value)} className={fieldClassName} />
              </Field>
            </div>

            {error ? <p className="mt-4 rounded-md bg-[#D34053]/[0.08] px-4 py-3 text-sm font-medium text-[#D34053]">{error}</p> : null}
            {message ? <p className="mt-4 rounded-md bg-[#219653]/[0.08] px-4 py-3 text-sm font-medium text-[#219653]">{message}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center rounded-md border border-stroke px-5 text-sm font-semibold text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-[#D34053]">{error}</span> : null}
    </label>
  );
}

const fieldClassName =
  "w-full rounded-md border border-stroke bg-white px-4 py-3 text-sm font-medium text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";

function minimumScheduleDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}
