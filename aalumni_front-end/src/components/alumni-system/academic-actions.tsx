"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import type { College, Department } from "@/lib/api";

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

// ─── COLLEGE ACTIONS ─────────────────────────────────────────────────────────

export function CreateCollegeAction() {
  return (
    <CollegeFormModal
      trigger={
        <button
          type="button"
          id="btn-add-college"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <PlusIcon />
          Add College
        </button>
      }
    />
  );
}

export function CollegeRowActions({ college }: { college: College }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nextActive = !college.isActive;
  const actionLabel = college.isActive ? "Deactivate" : "Activate";

  const handleToggleStatus = async () => {
    if (!window.confirm(`${actionLabel} college "${college.name}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/academic/colleges/${college.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) {
        setError(body.message || body.error || "Unable to update college status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1">
        <CollegeFormModal
          college={college}
          trigger={
            <button
              type="button"
              title="Edit college"
              className="grid size-8 place-items-center rounded-md border border-stroke text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              <span className="sr-only">Edit college</span>
              <EditIcon />
            </button>
          }
        />
        <button
          type="button"
          title={college.isActive ? "Set college inactive" : "Set college active"}
          onClick={handleToggleStatus}
          disabled={saving}
          className="grid size-8 place-items-center rounded-md border border-amber-300/60 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10"
        >
          <span className="sr-only">{saving ? `${actionLabel} college` : `${actionLabel} college`}</span>
          {saving ? <SpinnerIcon /> : college.isActive ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function CollegeFormModal({
  college,
  trigger,
}: {
  college?: College;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(college);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setForm({
      name: college?.name ?? "",
      code: college?.code ?? "",
      description: college?.description ?? "",
      isActive: college?.isActive ?? true,
    });
    setError("");
    setFieldErrors({});
    setOpen(true);
  };

  const closeModal = () => { if (!saving) setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch(
        isEditing ? `/api/admin/academic/colleges/${college?.id}` : "/api/admin/academic/colleges",
        { method: isEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) },
      );
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) { setError(body.message || body.error || "Unable to save college."); setFieldErrors(body.errors ?? {}); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Unable to reach the server."); }
    finally { setSaving(false); }
  };

  return (
    <>
      {React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: openModal })}

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Edit college" : "Add college"}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:bg-gray-dark">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#0F3D91,#1C3FB7)] px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                  {isEditing ? "Editing" : "New"} College
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {isEditing ? `Edit "${college?.name}"` : "Add College"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                title="Close"
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="px-6 py-5">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    ref={firstInputRef}
                    label="College Name"
                    required
                    value={form.name}
                    placeholder="e.g. College of Engineering"
                    error={fieldErrors.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <FormField
                    label="Code"
                    required
                    value={form.code}
                    placeholder="e.g. CEIT"
                    error={fieldErrors.code}
                    onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))}
                  />
                </div>

                <FormField
                  label="Description"
                  value={form.description}
                  placeholder="Brief description (optional)"
                  error={fieldErrors.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                />

                <div>
                  <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">Status</span>
                  <div className="flex gap-3">
                    {(["active", "inactive"] as const).map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="college-status"
                          value={opt}
                          checked={form.isActive === (opt === "active")}
                          onChange={() => setForm((f) => ({ ...f, isActive: opt === "active" }))}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium capitalize text-dark dark:text-white">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red/20 bg-red/[0.06] px-4 py-3">
                    <AlertIcon />
                    <p className="text-sm font-medium text-red">{error}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-stroke px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-gray-1 disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <SpinnerIcon />}
                  {saving ? "Saving…" : isEditing ? "Save Changes" : "Create College"}
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

// ─── DEPARTMENT ACTIONS ───────────────────────────────────────────────────────

export function CreateDepartmentAction({ colleges }: { colleges: College[] }) {
  return (
    <DepartmentFormModal
      colleges={colleges}
      trigger={
        <button
          type="button"
          id="btn-add-department"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <PlusIcon />
          Add Department
        </button>
      }
    />
  );
}

export function DepartmentRowActions({
  department,
  colleges,
}: {
  department: Department;
  colleges: College[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nextActive = !department.isActive;
  const actionLabel = department.isActive ? "Deactivate" : "Activate";

  const handleToggleStatus = async () => {
    if (!window.confirm(`${actionLabel} department "${department.name}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/academic/departments/${department.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) {
        setError(body.message || body.error || "Unable to update department status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1">
        <DepartmentFormModal
          department={department}
          colleges={colleges}
          trigger={
            <button
              type="button"
              title="Edit department"
              className="grid size-8 place-items-center rounded-md border border-stroke text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              <span className="sr-only">Edit department</span>
              <EditIcon />
            </button>
          }
        />
        <button
          type="button"
          title={department.isActive ? "Set department inactive" : "Set department active"}
          onClick={handleToggleStatus}
          disabled={saving}
          className="grid size-8 place-items-center rounded-md border border-amber-300/60 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10"
        >
          <span className="sr-only">{saving ? `${actionLabel} department` : `${actionLabel} department`}</span>
          {saving ? <SpinnerIcon /> : department.isActive ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function DepartmentFormModal({
  department,
  colleges,
  trigger,
}: {
  department?: Department;
  colleges: College[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
    collegeId: colleges[0]?.id ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(department);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setForm({
      name: department?.name ?? "",
      code: department?.code ?? "",
      description: department?.description ?? "",
      isActive: department?.isActive ?? true,
      collegeId: department?.college?.id ?? (colleges[0]?.id ?? 0),
    });
    setError("");
    setFieldErrors({});
    setOpen(true);
  };

  const closeModal = () => { if (!saving) setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch(
        isEditing ? `/api/admin/academic/departments/${department?.id}` : "/api/admin/academic/departments",
        { method: isEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) },
      );
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) { setError(body.message || body.error || "Unable to save department."); setFieldErrors(body.errors ?? {}); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Unable to reach the server."); }
    finally { setSaving(false); }
  };

  return (
    <>
      {React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: openModal })}

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Edit department" : "Add department"}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:bg-gray-dark">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#0F3D91,#1C3FB7)] px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                  {isEditing ? "Editing" : "New"} Department
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {isEditing ? `Edit "${department?.name}"` : "Add Department"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                title="Close"
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="px-6 py-5">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    ref={firstInputRef}
                    label="Department Name"
                    required
                    value={form.name}
                    placeholder="e.g. Computer Science"
                    error={fieldErrors.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <FormField
                    label="Code"
                    required
                    value={form.code}
                    placeholder="e.g. BSCS"
                    error={fieldErrors.code}
                    onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))}
                  />
                </div>

                <FormField
                  label="Description"
                  value={form.description}
                  placeholder="Brief description (optional)"
                  error={fieldErrors.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                />

                <div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">
                      College <span className="text-red">*</span>
                    </span>
                    <select
                      value={form.collegeId || ""}
                      onChange={(e) => setForm((f) => ({ ...f, collegeId: Number(e.target.value) }))}
                      required
                      className="w-full rounded-xl border border-stroke bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                    >
                      {!form.collegeId && (
                        <option value="" disabled>Select a college…</option>
                      )}
                      {colleges.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    {fieldErrors.collegeId && (
                      <span className="mt-1 block text-xs font-medium text-red">{fieldErrors.collegeId}</span>
                    )}
                  </label>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">Status</span>
                  <div className="flex gap-3">
                    {(["active", "inactive"] as const).map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="dept-status"
                          value={opt}
                          checked={form.isActive === (opt === "active")}
                          onChange={() => setForm((f) => ({ ...f, isActive: opt === "active" }))}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium capitalize text-dark dark:text-white">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red/20 bg-red/[0.06] px-4 py-3">
                    <AlertIcon />
                    <p className="text-sm font-medium text-red">{error}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-stroke px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-gray-1 disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <SpinnerIcon />}
                  {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Department"}
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

// ─── SHARED FORM FIELD ────────────────────────────────────────────────────────

import { forwardRef } from "react";

const FormField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    placeholder?: string;
    error?: string;
  }
>(function FormField({ label, value, onChange, required, placeholder, error }, ref) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">
        {label} {required && <span className="text-red">*</span>}
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stroke bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && <span className="mt-1 block text-xs font-medium text-red">{error}</span>}
    </label>
  );
});

// ─── ICONS ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.25 4.167 15.833 8.75m-10 5.417 1.25-4.584 6.875-6.875a1.768 1.768 0 0 1 2.5 2.5L9.583 12.083 5 13.333l.833.834Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6.5 4.5v11M13.5 4.5v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.25 5.5v9l7-4.5-7-4.5Z" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0 text-red" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 7v4m0 3h.01M9.073 3.41 2.167 15.584A1.072 1.072 0 0 0 3.094 17.2h13.812a1.072 1.072 0 0 0 .927-1.616L10.927 3.41a1.072 1.072 0 0 0-1.854 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
  );
}
