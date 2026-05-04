"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState } from "react";

type JobItem = {
  id: number;
  title: string;
  companyName: string;
  location: string | null;
  description?: string | null;
  requirements?: string | null;
  salaryRange?: string | null;
  employmentType: string | null;
  industry: string | null;
  relatedCourse?: string | null;
  contactEmail?: string | null;
  applicationLink?: string | null;
  deadline: string | null;
  isActive: boolean;
};

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

const employmentTypes = [
  "",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

export function CreateJobAction() {
  return (
    <JobFormDialog
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          <ActionIcon name="plus" />
          <span>Add Job</span>
        </span>
      }
    />
  );
}

export function JobRowActions({ job }: { job: JobItem }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteJob = async () => {
    if (!window.confirm(`Delete "${job.title}"?`)) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to delete job.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to reach the job endpoint.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-w-[100px] flex-col gap-2">
      <div className="flex justify-end gap-2">
        <JobFormDialog job={job} trigger={<IconButton label="Edit job posting" icon="edit" />} />
        <button
          type="button"
          title="Delete job posting"
          onClick={deleteJob}
          disabled={deleting}
          className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="sr-only">
            {deleting ? "Deleting job posting" : "Delete job posting"}
          </span>
          {deleting ? <SpinnerIcon /> : <ActionIcon name="trash" />}
        </button>
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function JobFormDialog({
  job,
  trigger,
}: {
  job?: JobItem;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: job?.title ?? "",
    companyName: job?.companyName ?? "",
    location: job?.location ?? "",
    description: job?.description ?? "",
    requirements: job?.requirements ?? "",
    salaryRange: job?.salaryRange ?? "",
    employmentType: job?.employmentType ?? "",
    industry: job?.industry ?? "",
    relatedCourse: job?.relatedCourse ?? "",
    contactEmail: job?.contactEmail ?? "",
    applicationLink: job?.applicationLink ?? "",
    deadline: job?.deadline ?? "",
    isActive: job?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(job);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(
        isEditing ? `/api/admin/jobs/${job?.id}` : "/api/admin/jobs",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to save job posting.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Unable to reach the job endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Edit job posting" : "Create job posting"}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  {isEditing ? "Edit Job Posting" : "Create Job Posting"}
                </h2>
                <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                  Manage career opportunities shown to alumni.
                </p>
              </div>
              <button
                type="button"
                title="Close"
                onClick={() => setOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-md border border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                <span className="sr-only">Close</span>
                <ActionIcon name="x" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job Title" value={form.title} error={fieldErrors.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
                <Field label="Company" value={form.companyName} error={fieldErrors.companyName} onChange={(value) => setForm((current) => ({ ...current, companyName: value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Location" value={form.location} error={fieldErrors.location} onChange={(value) => setForm((current) => ({ ...current, location: value }))} />
                <Field label="Industry" value={form.industry} error={fieldErrors.industry} onChange={(value) => setForm((current) => ({ ...current, industry: value }))} />
              </div>

              <TextArea label="Description" value={form.description} error={fieldErrors.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
              <TextArea label="Requirements" value={form.requirements} error={fieldErrors.requirements} onChange={(value) => setForm((current) => ({ ...current, requirements: value }))} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Employment Type
                  </span>
                  <select
                    value={form.employmentType}
                    onChange={(event) => setForm((current) => ({ ...current, employmentType: event.target.value }))}
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  >
                    {employmentTypes.map((type) => (
                      <option key={type || "blank"} value={type}>
                        {type || "Select type"}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Related Course" value={form.relatedCourse} error={fieldErrors.relatedCourse} onChange={(value) => setForm((current) => ({ ...current, relatedCourse: value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Salary Range" value={form.salaryRange} error={fieldErrors.salaryRange} onChange={(value) => setForm((current) => ({ ...current, salaryRange: value }))} />
                <Field label="Contact Email" value={form.contactEmail} error={fieldErrors.contactEmail} onChange={(value) => setForm((current) => ({ ...current, contactEmail: value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Application Link" value={form.applicationLink} error={fieldErrors.applicationLink} onChange={(value) => setForm((current) => ({ ...current, applicationLink: value }))} />
                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Deadline
                  </span>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  />
                  {fieldErrors.deadline && (
                    <span className="mt-1 block text-sm font-medium text-red">
                      {fieldErrors.deadline}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-stroke p-4 font-medium dark:border-dark-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="size-4"
                />
                Active and visible to alumni
              </label>

              {error && (
                <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
                  {error}
                </p>
              )}

              <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-stroke bg-white px-5 pt-4 dark:border-dark-3 dark:bg-gray-dark sm:-mx-6 sm:px-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function TextArea({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function IconButton({
  label,
  icon,
}: {
  label: string;
  icon: "plus" | "edit";
}) {
  return (
    <span
      title={label}
      className="p-1.5 text-primary transition hover:text-primary/70"
    >
      <span className="sr-only">{label}</span>
      <ActionIcon name={icon} />
    </span>
  );
}

function ActionIcon({
  name,
}: {
  name: "plus" | "edit" | "trash" | "x";
}) {
  if (name === "plus") {
    return (
      <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M11.25 4.167 15.833 8.75m-10 5.417 1.25-4.584 6.875-6.875a1.768 1.768 0 0 1 2.5 2.5L9.583 12.083 5 13.333l.833.834Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <span
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}
