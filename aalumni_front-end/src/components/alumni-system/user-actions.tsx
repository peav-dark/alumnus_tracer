"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

type ManageUser = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  schoolId: string | null;
  primaryRole: string;
  accountStatus: string;
};

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  schoolId: string;
  role: string;
  alumniCollege: string;
  alumniDepartment: string;
  password: string;
};

type EditUserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  schoolId: string;
  alumniCollege: string;
  alumniDepartment: string;
  password: string;
};

const blankUserForm: UserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  schoolId: "",
  role: "alumni",
  alumniCollege: "",
  alumniDepartment: "",
  password: "",
};

function formFromUser(user: ManageUser): UserFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    schoolId: user.schoolId ?? "",
    role: ["admin", "alumni"].includes(user.primaryRole)
      ? user.primaryRole
      : "alumni",
    alumniCollege: "",
    alumniDepartment: "",
    password: "",
  };
}

export function CreateUserAction({ collegeOptions = [], departmentOptions = [] }: { collegeOptions?: string[]; departmentOptions?: string[] } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<UserFormState>(blankUserForm);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to create user.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      setForm(blankUserForm);
      router.refresh();
    } catch {
      setError("Unable to reach the user endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        title="Add user"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        <ActionIcon name="plus" />
        <span>Add user</span>
      </button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add user"
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  Add User
                </h2>
                <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                  Create an admin, staff, or alumni login account.
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
                <Field label="First Name" value={form.firstName} error={fieldErrors.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                <Field label="Last Name" value={form.lastName} error={fieldErrors.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={form.email} error={fieldErrors.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
                <Field label="School ID" value={form.schoolId} error={fieldErrors.schoolId} onChange={(value) => setForm((current) => ({ ...current, schoolId: value }))} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Role"
                  value={form.role}
                  error={fieldErrors.role}
                  options={[
                    ["alumni", "Alumni"],
                    ["admin", "Admin"],
                  ]}
                  onChange={(value) => setForm((current) => ({ ...current, role: value }))}
                />
                <Field label="Password" type="password" value={form.password} error={fieldErrors.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
              </div>

              {form.role === "alumni" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="College"
                    value={form.alumniCollege}
                    error={fieldErrors.alumniCollege}
                    options={collegeOptions.map((c) => [c, c])}
                    onChange={(value) => setForm((current) => ({ ...current, alumniCollege: value }))}
                  />
                  <SelectField
                    label="Department"
                    value={form.alumniDepartment}
                    error={fieldErrors.alumniDepartment}
                    options={departmentOptions.map((d) => [d, d])}
                    onChange={(value) => setForm((current) => ({ ...current, alumniDepartment: value }))}
                  />
                </div>
              )}

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

export function UserCrudActions({ user, collegeOptions = [], departmentOptions = [] }: { user: ManageUser; collegeOptions?: string[]; departmentOptions?: string[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<EditUserFormState>({
    firstName: "",
    lastName: "",
    email: "",
    schoolId: "",
    alumniCollege: "",
    alumniDepartment: "",
    password: "",
  });
  const statusToggle =
    user.accountStatus === "active"
      ? {
          label: "Deactivate",
          icon: "ban" as const,
          status: "inactive" as const,
          tone: "danger" as const,
        }
      : {
          label: "Activate",
          icon: "check" as const,
          status: "active" as const,
          tone: "primary" as const,
        };

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const openEdit = () => {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      schoolId: user.schoolId ?? "",
      alumniCollege: "",
      alumniDepartment: "",
      password: "",
    });
    setError("");
    setMessage("");
    setFieldErrors({});
    setEditOpen(true);
  };

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to update user.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setEditOpen(false);
      setMessage(body.message || "User updated.");
      router.refresh();
    } catch {
      setError("Unable to reach the user endpoint.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status: "active" | "inactive" | "pending") => {
    setLoadingAction(status);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to update status.");
        return;
      }

      setMessage(body.message || "Status updated.");
      router.refresh();
    } catch {
      setError("Unable to reach the status endpoint.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-2">
        <ActionButton
          label="Edit"
          icon="pencil"
          disabled={loadingAction !== null}
          loading={false}
          onClick={openEdit}
        />
        <ActionButton
          label={statusToggle.label}
          icon={statusToggle.icon}
          tone={statusToggle.tone}
          disabled={loadingAction !== null}
          loading={loadingAction === statusToggle.status}
          onClick={() => updateStatus(statusToggle.status)}
        />
      </div>
      {message && <p className="text-right text-xs font-medium text-green">{message} • {new Date().toLocaleTimeString()}</p>}
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}

      {editOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${user.fullName}`}
          >
            <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
                <div>
                  <h2 className="text-xl font-bold text-dark dark:text-white">
                    Edit User
                  </h2>
                  <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                    Update profile information, college, department, or set a new password.
                  </p>
                </div>
                <button
                  type="button"
                  title="Close"
                  onClick={() => setEditOpen(false)}
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  <span className="sr-only">Close</span>
                  <ActionIcon name="x" />
                </button>
              </div>

              <form onSubmit={submitEdit} className="space-y-4 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First Name" value={form.firstName} error={fieldErrors.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                  <Field label="Last Name" value={form.lastName} error={fieldErrors.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" value={form.email} error={fieldErrors.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
                  <Field label="School ID" value={form.schoolId} error={fieldErrors.schoolId} onChange={(value) => setForm((current) => ({ ...current, schoolId: value }))} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="College"
                    value={form.alumniCollege}
                    error={fieldErrors.alumniCollege}
                    options={collegeOptions.map((college) => [college, college])}
                    onChange={(value) => setForm((current) => ({ ...current, alumniCollege: value }))}
                  />
                  <SelectField
                    label="Department"
                    value={form.alumniDepartment}
                    error={fieldErrors.alumniDepartment}
                    options={departmentOptions.map((dept) => [dept, dept])}
                    onChange={(value) => setForm((current) => ({ ...current, alumniDepartment: value }))}
                  />
                </div>

                <Field label="New Password" type="password" value={form.password} error={fieldErrors.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />

                {error && (
                  <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
                    {error}
                  </p>
                )}

                <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-stroke bg-white px-5 pt-4 dark:border-dark-3 dark:bg-gray-dark sm:-mx-6 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function UserStatusActions({
  userId,
  currentStatus,
}: {
  userId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const statusToggle =
    currentStatus === "active"
      ? {
          label: "Deactivate",
          icon: "ban" as const,
          status: "inactive" as const,
          tone: "danger" as const,
        }
      : {
          label: "Activate",
          icon: "check" as const,
          status: "active" as const,
          tone: "primary" as const,
        };

  const updateStatus = async (status: "active" | "inactive" | "pending") => {
    setLoadingAction(status);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to update status.");
        return;
      }

      setMessage(body.message || "Status updated.");
      router.refresh();
    } catch {
      setError("Unable to reach the status endpoint.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex min-w-[220px] flex-col gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <ActionButton
          label={statusToggle.label}
          icon={statusToggle.icon}
          tone={statusToggle.tone}
          disabled={loadingAction !== null}
          loading={loadingAction === statusToggle.status}
          onClick={() => updateStatus(statusToggle.status)}
        />
        <ActionButton
          label="Pending"
          icon="clock"
          disabled={currentStatus === "pending" || loadingAction !== null}
          loading={loadingAction === "pending"}
          onClick={() => updateStatus("pending")}
        />
      </div>
      {message && <p className="text-right text-xs font-medium text-green">{message}</p>}
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

export function VerificationActions({ userId }: { userId: number }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");

  const submit = async (action: "approve" | "deny") => {
    setLoadingAction(action);
    setError("");

    try {
      const response = await fetch(`/api/admin/verification/${userId}/${action}`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || `Unable to ${action} user.`);
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to reach the verification endpoint.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex min-w-[150px] flex-col gap-2">
      <div className="flex justify-end gap-2">
        <ActionButton
          label="Approve"
          icon="check"
          disabled={loadingAction !== null}
          loading={loadingAction === "approve"}
          onClick={() => submit("approve")}
        />
        <ActionButton
          label="Deny"
          icon="x"
          tone="danger"
          disabled={loadingAction !== null}
          loading={loadingAction === "deny"}
          onClick={() => submit("deny")}
        />
      </div>
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  error,
  options,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  loading,
  tone = "primary",
}: {
  label: string;
  icon: "check" | "clock" | "ban" | "x" | "pencil" | "trash";
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  tone?: "primary" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={
        tone === "danger"
          ? "p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
          : "p-1.5 text-primary transition hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <span className="sr-only">{loading ? `${label} in progress` : label}</span>
      {loading ? <SpinnerIcon /> : <ActionIcon name={icon} />}
    </button>
  );
}

function ActionIcon({
  name,
}: {
  name: "check" | "clock" | "ban" | "x" | "plus" | "pencil" | "trash";
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

  if (name === "check") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M16.25 5.625 8.125 13.75 3.75 9.375"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M10 6.25V10l2.5 1.875"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "ban") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4.7 4.7 15.3 15.3M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "pencil") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M11.25 4.167 15.833 8.75M3.75 16.25l4.05-.675 8.85-8.85a1.62 1.62 0 0 0 0-2.292l-1.083-1.083a1.62 1.62 0 0 0-2.292 0l-8.85 8.85-.675 4.05Z"
          stroke="currentColor"
          strokeWidth="1.6"
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
          d="M3.333 5h13.334M8.333 8.333v5M11.667 8.333v5M5.833 5l.834 11.667h6.666L14.167 5M8.333 5V3.333h3.334V5"
          stroke="currentColor"
          strokeWidth="1.6"
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
