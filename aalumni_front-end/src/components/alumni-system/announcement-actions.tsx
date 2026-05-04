"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState } from "react";

type AnnouncementItem = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  eventStartAt: string | null;
  location: string | null;
  joinUrl: string | null;
  isActive: boolean;
};

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

const categories = [
  "General",
  "Job Opportunity",
  "Event",
  "University News",
  "Seminar",
];

export function CreateAnnouncementAction() {
  return (
    <AnnouncementFormDialog
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          <ActionIcon name="plus" />
          <span>Add Event</span>
        </span>
      }
    />
  );
}

export function AnnouncementRowActions({
  announcement,
}: {
  announcement: AnnouncementItem;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteAnnouncement = async () => {
    if (!window.confirm(`Delete "${announcement.title}"?`)) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to delete announcement.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to reach the announcement endpoint.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-w-[100px] flex-col gap-2">
      <div className="flex justify-end gap-2">
        <AnnouncementFormDialog
          announcement={announcement}
          trigger={<IconButton label="Edit announcement" icon="edit" />}
        />
        <button
          type="button"
          title="Delete announcement"
          onClick={deleteAnnouncement}
          disabled={deleting}
          className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="sr-only">
            {deleting ? "Deleting announcement" : "Delete announcement"}
          </span>
          {deleting ? <SpinnerIcon /> : <ActionIcon name="trash" />}
        </button>
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function AnnouncementFormDialog({
  announcement,
  trigger,
}: {
  announcement?: AnnouncementItem;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: announcement?.title ?? "",
    description: announcement?.description ?? "",
    category: announcement?.category ?? "General",
    eventStartAt: toDateTimeLocalValue(announcement?.eventStartAt),
    location: announcement?.location ?? "",
    joinUrl: announcement?.joinUrl ?? "",
    isActive: announcement?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(announcement);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        joinUrl: normalizeJoinUrl(form.joinUrl),
      };
      const response = await fetch(
        isEditing
          ? `/api/admin/announcements/${announcement?.id}`
          : "/api/admin/announcements",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to save announcement.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Unable to reach the announcement endpoint.");
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
          aria-label={isEditing ? "Edit event or announcement" : "Create event or announcement"}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  {isEditing ? "Edit Event or Announcement" : "Create Event or Announcement"}
                </h2>
                <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                  Publish events, alumni updates, campus notices, and meeting links.
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
              <Field
                label="Title"
                value={form.title}
                error={fieldErrors.title}
                onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              />

              <label className="block">
                <span className="mb-2.5 block font-medium text-dark dark:text-white">
                  Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                />
                {fieldErrors.description && (
                  <span className="mt-1 block text-sm font-medium text-red">
                    {fieldErrors.description}
                  </span>
                )}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Event date and time"
                  type="datetime-local"
                  value={form.eventStartAt}
                  error={fieldErrors.eventStartAt}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, eventStartAt: value }))
                  }
                />

                <Field
                  label="Location"
                  value={form.location}
                  error={fieldErrors.location}
                  onChange={(value) => setForm((current) => ({ ...current, location: value }))}
                />
              </div>

              <Field
                label="Link"
                placeholder="https://example.com/event-or-form"
                value={form.joinUrl}
                error={fieldErrors.joinUrl}
                onChange={(value) => setForm((current) => ({ ...current, joinUrl: value }))}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Status
                  </span>
                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.value === "active",
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Draft / Inactive</option>
                  </select>
                </label>
              </div>

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
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && (
        <span className="mt-1 block text-sm font-medium text-red">{error}</span>
      )}
    </label>
  );
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.length >= 16 ? value.slice(0, 16) : value;
}

function normalizeJoinUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function IconButton({
  label,
  icon,
  tone = "primary",
}: {
  label: string;
  icon: "plus" | "edit";
  tone?: "primary";
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
        <path
          d="M10 4.167v11.666M4.167 10h11.666"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M11.25 4.167 15.833 8.75m-10 5.417 1.25-4.584 6.875-6.875a1.768 1.768 0 0 1 2.5 2.5L9.583 12.083 5 13.333l.833.834Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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
