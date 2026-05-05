"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState } from "react";
import type { College, Department } from "@/lib/api";

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

// ─── COLLEGE ACTIONS ─────────────────────────────────────────────────────────

export function CreateCollegeAction() {
  return (
    <CollegeFormDialog
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          <PlusIcon />
          <span>Add College</span>
        </span>
      }
    />
  );
}

export function CollegeRowActions({ college }: { college: College }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!window.confirm(`Delete college "${college.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/academic/colleges/${college.id}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) { setError(body.message || body.error || "Unable to delete college."); return; }
      router.refresh();
    } catch { setError("Unable to reach the server."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-end gap-1.5">
        <CollegeFormDialog
          college={college}
          trigger={<IconButton label="Edit college" icon="edit" />}
        />
        <DeleteButton deleting={deleting} onDelete={handleDelete} label="college" />
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function CollegeFormDialog({
  college,
  trigger,
}: {
  college?: College;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: college?.name ?? "",
    code: college?.code ?? "",
    description: college?.description ?? "",
    isActive: college?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(college);

  const handleOpen = () => {
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
      <button type="button" onClick={handleOpen} className="contents">{trigger}</button>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={isEditing ? "Edit college" : "Add college"}>
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
            <div className="flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">{isEditing ? "Edit College" : "Add College"}</h2>
                <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">Colleges group related departments and courses.</p>
              </div>
              <CloseButton onClose={() => setOpen(false)} />
            </div>
            <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="College name *" value={form.name} error={fieldErrors.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <Field label="Code *" value={form.code} placeholder="e.g. CEIT" error={fieldErrors.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} />
              </div>
              <Field label="Description" value={form.description} error={fieldErrors.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
              <StatusSelect value={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              {error && <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">{error}</p>}
              <FormFooter saving={saving} onClose={() => setOpen(false)} />
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
    <DepartmentFormDialog
      colleges={colleges}
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          <PlusIcon />
          <span>Add Department</span>
        </span>
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!window.confirm(`Delete department "${department.name}"?`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/academic/departments/${department.id}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) { setError(body.message || body.error || "Unable to delete department."); return; }
      router.refresh();
    } catch { setError("Unable to reach the server."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-end gap-1.5">
        <DepartmentFormDialog
          department={department}
          colleges={colleges}
          trigger={<IconButton label="Edit department" icon="edit" />}
        />
        <DeleteButton deleting={deleting} onDelete={handleDelete} label="department" />
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function DepartmentFormDialog({
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
    name: department?.name ?? "",
    code: department?.code ?? "",
    description: department?.description ?? "",
    isActive: department?.isActive ?? true,
    collegeId: department?.college?.id ?? (colleges[0]?.id ?? 0),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(department);

  const handleOpen = () => {
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
      <button type="button" onClick={handleOpen} className="contents">{trigger}</button>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={isEditing ? "Edit department" : "Add department"}>
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
            <div className="flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">{isEditing ? "Edit Department" : "Add Department"}</h2>
                <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">Departments belong to a college and are used for alumni records.</p>
              </div>
              <CloseButton onClose={() => setOpen(false)} />
            </div>
            <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Department name *" value={form.name} error={fieldErrors.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <Field label="Code *" value={form.code} placeholder="e.g. BSIT" error={fieldErrors.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} />
              </div>
              <Field label="Description" value={form.description} error={fieldErrors.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
              <label className="block">
                <span className="mb-2.5 block font-medium text-dark dark:text-white">College *</span>
                <select
                  value={form.collegeId}
                  onChange={(e) => setForm((f) => ({ ...f, collegeId: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
                {fieldErrors.collegeId && <span className="mt-1 block text-sm font-medium text-red">{fieldErrors.collegeId}</span>}
              </label>
              <StatusSelect value={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              {error && <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">{error}</p>}
              <FormFooter saving={saving} onClose={() => setOpen(false)} />
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ─── SHARED UI HELPERS ────────────────────────────────────────────────────────

function Field({
  label, value, error, type = "text", placeholder, onChange,
}: {
  label: string; value: string; error?: string; type?: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function StatusSelect({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">Status</span>
      <select
        value={value ? "active" : "inactive"}
        onChange={(e) => onChange(e.target.value === "active")}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </label>
  );
}

function FormFooter({ saving, onClose }: { saving: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-3 border-t border-stroke pt-4 dark:border-dark-3">
      <button type="button" onClick={onClose} className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2">
        Cancel
      </button>
      <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" title="Close" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-md border border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2">
      <span className="sr-only">Close</span>
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function DeleteButton({ deleting, onDelete, label }: { deleting: boolean; onDelete: () => void; label: string }) {
  return (
    <button type="button" title={`Delete ${label}`} onClick={onDelete} disabled={deleting} className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50">
      <span className="sr-only">{deleting ? `Deleting ${label}` : `Delete ${label}`}</span>
      {deleting ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function IconButton({ label, icon }: { label: string; icon: "edit" }) {
  return (
    <span title={label} className="p-1.5 text-primary transition hover:text-primary/70">
      <span className="sr-only">{label}</span>
      {icon === "edit" && (
        <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M11.25 4.167 15.833 8.75m-10 5.417 1.25-4.584 6.875-6.875a1.768 1.768 0 0 1 2.5 2.5L9.583 12.083 5 13.333l.833.834Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
