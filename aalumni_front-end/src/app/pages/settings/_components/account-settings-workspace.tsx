"use client";

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

type AccountSettings = {
  id: number;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  bio: string;
  profileImageUrl: string | null;
};

type SettingsResponse = {
  item?: AccountSettings;
  errors?: Record<string, string>;
  message?: string;
};

type PersonalForm = Pick<
  AccountSettings,
  "fullName" | "email" | "username" | "phoneNumber" | "bio"
>;

type ActiveSection = "personal" | "photo" | "password" | null;
type AdminActiveSection = ActiveSection | "registration";

type SystemSettings = {
  publicSignupEnabled: boolean;
};

type SystemSettingsResponse = {
  item?: SystemSettings;
  message?: string;
  errors?: Record<string, string>;
};

const emptyPersonalForm: PersonalForm = {
  fullName: "",
  email: "",
  username: "",
  phoneNumber: "",
  bio: "",
};

export function AccountSettingsWorkspace() {
  const [account, setAccount] = useState<AccountSettings | null>(null);
  const [personalForm, setPersonalForm] = useState<PersonalForm>(emptyPersonalForm);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<AdminActiveSection>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [registrationSaving, setRegistrationSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto]);

  const avatarUrl = photoPreview || account?.profileImageUrl || "";
  const initials = useMemo(() => {
    const name = account?.fullName || personalForm.fullName || "Account User";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [account?.fullName, personalForm.fullName]);

  async function loadSettings() {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/account/settings", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as SettingsResponse;

      if (!response.ok || !body.item) {
        setErrors({ form: body.message || "Unable to load account settings." });
        return;
      }

      setAccount(body.item);
      setPersonalForm(toPersonalForm(body.item));
      await loadSystemSettings();
    } catch {
      setErrors({ form: "Unable to reach the account settings endpoint." });
    } finally {
      setLoading(false);
    }
  }

  async function loadSystemSettings() {
    try {
      const response = await fetch("/api/admin/system-settings", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as SystemSettingsResponse;

      if (response.ok && body.item) {
        setSystemSettings(body.item);
      }
    } catch {
      setSystemSettings(null);
    }
  }

  async function saveRegistrationAccess(enabled: boolean) {
    setRegistrationSaving(true);
    setErrors({});
    setMessages({});

    try {
      const response = await fetch("/api/admin/system-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicSignupEnabled: enabled }),
      });
      const body = (await response.json().catch(() => ({}))) as SystemSettingsResponse;

      if (!response.ok || !body.item) {
        setErrors({ registration: body.message || "Unable to update registration access." });
        return;
      }

      setSystemSettings(body.item);
      setMessages({
        registration: body.item.publicSignupEnabled
          ? "Normal sign-up page is now enabled."
          : "Normal sign-up page is now hidden. QR registration remains available.",
      });
    } catch {
      setErrors({ registration: "Unable to reach the system settings endpoint." });
    } finally {
      setRegistrationSaving(false);
    }
  }

  async function savePersonalInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPersonalSaving(true);
    setErrors({});
    setMessages({});

    try {
      const response = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalForm),
      });
      const body = (await response.json().catch(() => ({}))) as SettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { personal: body.message || "Unable to save personal info." });
        return;
      }

      setAccount(body.item);
      setPersonalForm(toPersonalForm(body.item));
      notifyAccountUpdated();
      setMessages({ personal: "Personal information saved." });
    } catch {
      setErrors({ personal: "Unable to reach the account settings endpoint." });
    } finally {
      setPersonalSaving(false);
    }
  }

  async function savePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPhoto) {
      setErrors({ photo: "Please choose a photo first." });
      return;
    }

    setPhotoSaving(true);
    setErrors({});
    setMessages({});

    const formData = new FormData();
    formData.append("photo", selectedPhoto);

    try {
      const response = await fetch("/api/account/photo", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json().catch(() => ({}))) as SettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { photo: body.message || "Unable to update photo." });
        return;
      }

      setAccount(body.item);
      setSelectedPhoto(null);
      notifyAccountUpdated();
      setMessages({ photo: "Profile photo updated." });
    } catch {
      setErrors({ photo: "Unable to reach the photo endpoint." });
    } finally {
      setPhotoSaving(false);
    }
  }

  async function removePhoto() {
    setPhotoSaving(true);
    setErrors({});
    setMessages({});

    try {
      const response = await fetch("/api/account/photo", { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as SettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { photo: body.message || "Unable to remove photo." });
        return;
      }

      setAccount(body.item);
      setSelectedPhoto(null);
      notifyAccountUpdated();
      setMessages({ photo: "Profile photo removed." });
    } catch {
      setErrors({ photo: "Unable to reach the photo endpoint." });
    } finally {
      setPhotoSaving(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaving(true);
    setErrors({});
    setMessages({});

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const body = (await response.json().catch(() => ({}))) as SettingsResponse;

      if (!response.ok) {
        setErrors(body.errors ?? { password: body.message || "Unable to change password." });
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessages({ password: "Password changed." });
    } catch {
      setErrors({ password: "Unable to reach the password endpoint." });
    } finally {
      setPasswordSaving(false);
    }
  }

  function resetPersonalForm() {
    if (account) {
      setPersonalForm(toPersonalForm(account));
    }
    setErrors({});
    setMessages({});
  }

  if (loading) {
    return (
      <Section title="Account Settings">
        <div className="flex items-center gap-3 font-medium">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading account settings...
        </div>
      </Section>
    );
  }

  if (errors.form) {
    return <Message tone="error">{errors.form}</Message>;
  }

  return (
    <div className="space-y-6">
      {activeSection === null && (
        <div className="grid gap-4 md:grid-cols-3">
          <SectionSelector
            title="Personal Information"
            description="Name, email, username, phone, and bio"
            onClick={() => setActiveSection("personal")}
          />
          <SectionSelector
            title="Your Photo"
            description="Upload, replace, or remove your avatar"
            onClick={() => setActiveSection("photo")}
          />
          <SectionSelector
            title="Change Password"
            description="Update your account password"
            onClick={() => setActiveSection("password")}
          />
          {systemSettings && (
            <SectionSelector
              title="Registration Access"
              description="Choose normal sign-up or QR-only registration"
              onClick={() => setActiveSection("registration")}
            />
          )}
        </div>
      )}

      {activeSection === "personal" && (
        <Section title="Personal Information" onBack={() => setActiveSection(null)}>
          <form onSubmit={savePersonalInfo} className="mx-auto max-w-3xl space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                name="fullName"
                value={personalForm.fullName}
                onChange={setPersonalForm}
                error={errors.fullName}
              />
              <Field
                label="Phone Number"
                name="phoneNumber"
                value={personalForm.phoneNumber}
                onChange={setPersonalForm}
                error={errors.phoneNumber}
              />
            </div>
            <Field
              label="Email Address"
              type="email"
              name="email"
              value={personalForm.email}
              onChange={setPersonalForm}
              error={errors.email}
            />
            <Field
              label="Username"
              name="username"
              value={personalForm.username}
              onChange={setPersonalForm}
              error={errors.username}
            />
            <TextAreaField
              label="Bio"
              name="bio"
              value={personalForm.bio}
              onChange={setPersonalForm}
              error={errors.bio}
            />
            {errors.personal && <Message tone="error">{errors.personal}</Message>}
            {messages.personal && <Message tone="success">{messages.personal}</Message>}
            <FormActions
              saving={personalSaving}
              saveLabel="Save"
              onCancel={resetPersonalForm}
            />
          </form>
        </Section>
      )}

      {activeSection === "photo" && (
        <Section title="Your Photo" onBack={() => setActiveSection(null)}>
          <form onSubmit={savePhoto} className="mx-auto max-w-xl space-y-5">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="grid size-16 place-items-center rounded-full bg-primary text-lg font-bold text-white">
                  {initials || "NA"}
                </div>
              )}
              <div>
                <p className="font-medium text-dark dark:text-white">
                  Edit your photo
                </p>
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={photoSaving || (!account?.profileImageUrl && !selectedPhoto)}
                  className="mt-1 text-sm font-medium text-red disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove current photo
                </button>
              </div>
            </div>

            <label className="block cursor-pointer rounded-xl border border-dashed border-gray-4 bg-gray-2 p-5 text-center transition hover:border-primary dark:border-dark-3 dark:bg-dark-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  setSelectedPhoto(event.target.files?.[0] ?? null);
                  setErrors({});
                  setMessages({});
                }}
              />
              <span className="font-medium text-primary">Click to upload</span>
              <span className="block text-sm font-medium text-dark-5">
                JPG, PNG, or WEBP up to 10MB
              </span>
              {selectedPhoto && (
                <span className="mt-2 block text-sm font-semibold text-dark dark:text-white">
                  {selectedPhoto.name}
                </span>
              )}
            </label>

            {errors.photo && <Message tone="error">{errors.photo}</Message>}
            {messages.photo && <Message tone="success">{messages.photo}</Message>}
            <FormActions
              saving={photoSaving}
              saveLabel="Save Photo"
              onCancel={() => {
                setSelectedPhoto(null);
                setErrors({});
                setMessages({});
              }}
            />
          </form>
        </Section>
      )}

      {activeSection === "password" && (
        <Section title="Change Password" onBack={() => setActiveSection(null)}>
          <form onSubmit={changePassword} className="mx-auto max-w-xl space-y-5">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={setPasswordForm}
              error={errors.currentPassword}
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={setPasswordForm}
              error={errors.newPassword}
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={setPasswordForm}
              error={errors.confirmPassword}
            />
            {errors.password && <Message tone="error">{errors.password}</Message>}
            {messages.password && <Message tone="success">{messages.password}</Message>}
            <FormActions
              saving={passwordSaving}
              saveLabel="Change Password"
              onCancel={() => {
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setErrors({});
                setMessages({});
              }}
            />
          </form>
        </Section>
      )}

      {activeSection === "registration" && systemSettings && (
        <Section title="Registration Access" onBack={() => setActiveSection(null)}>
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="rounded-lg border border-stroke p-5 dark:border-dark-3">
              <p className="text-lg font-bold text-dark dark:text-white">
                Normal Sign-up Page
              </p>
              <p className="mt-2 font-medium text-dark-5 dark:text-dark-6">
                Turn this off when you only want alumni to register through generated QR registration links.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={registrationSaving}
                  onClick={() => saveRegistrationAccess(true)}
                  className={
                    systemSettings.publicSignupEnabled
                      ? "rounded-lg border border-primary bg-primary px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      : "rounded-lg border border-stroke px-5 py-3 font-semibold text-dark transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-3 dark:text-white"
                  }
                >
                  Allow Normal Sign-up
                </button>
                <button
                  type="button"
                  disabled={registrationSaving}
                  onClick={() => saveRegistrationAccess(false)}
                  className={
                    !systemSettings.publicSignupEnabled
                      ? "rounded-lg border border-primary bg-primary px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      : "rounded-lg border border-stroke px-5 py-3 font-semibold text-dark transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-3 dark:text-white"
                  }
                >
                  Use QR Registration Only
                </button>
              </div>
            </div>
            {errors.registration && <Message tone="error">{errors.registration}</Message>}
            {messages.registration && <Message tone="success">{messages.registration}</Message>}
          </div>
        </Section>
      )}
    </div>
  );
}

function SectionSelector({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[10px] border border-stroke bg-white p-5 text-left shadow-1 transition hover:border-primary hover:bg-primary/[0.03] dark:border-dark-3 dark:bg-gray-dark"
    >
      <span className="block text-lg font-bold text-dark dark:text-white">
        {title}
      </span>
      <span className="mt-1 block text-sm font-medium text-dark-5 dark:text-dark-6">
        {description}
      </span>
    </button>
  );
}

function Section({
  title,
  children,
  onBack,
}: {
  title: string;
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <section className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center gap-3 border-b border-stroke px-4 py-4 dark:border-dark-3 sm:px-6 xl:px-7.5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="grid size-9 place-items-center rounded-md border border-stroke text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
            aria-label="Back to settings"
            title="Back to settings"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12.5 15 7.5 10l5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h2 className="font-medium text-dark dark:text-white">{title}</h2>
      </div>
      <div className="p-4 sm:p-6 xl:p-7">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  name: keyof PersonalForm;
  value: string;
  onChange: Dispatch<SetStateAction<PersonalForm>>;
  error?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: keyof PersonalForm;
  value: string;
  onChange: Dispatch<SetStateAction<PersonalForm>>;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </span>
      <textarea
        rows={5}
        name={name}
        value={value}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: "currentPassword" | "newPassword" | "confirmPassword";
  value: string;
  onChange: Dispatch<
    SetStateAction<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={(event) =>
            onChange((current) => ({ ...current, [name]: event.target.value }))
          }
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-2.5 pr-12 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
        />
        <button
          type="button"
          title={visible ? "Hide password" : "Show password"}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-dark-5 transition hover:bg-gray-2 hover:text-primary dark:text-dark-6 dark:hover:bg-dark-2"
        >
          <PasswordVisibilityIcon visible={visible} />
        </button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  );
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="m3.333 3.333 13.334 13.334M8.233 8.233A2.5 2.5 0 0 0 11.767 11.767M7.158 4.658A8.302 8.302 0 0 1 10 4.167c5 0 7.5 5.833 7.5 5.833a13.77 13.77 0 0 1-2.025 3.05M5.525 5.525C3.492 6.9 2.5 10 2.5 10s2.5 5.833 7.5 5.833a7.88 7.88 0 0 0 4.1-1.142"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 10s2.5-5.833 7.5-5.833S17.5 10 17.5 10s-2.5 5.833-7.5 5.833S2.5 10 2.5 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FormActions({
  saving,
  saveLabel,
  onCancel,
}: {
  saving: boolean;
  saveLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:text-white"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}

function Message({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={
        tone === "success"
          ? "rounded-lg bg-[#219653]/[0.08] px-4 py-3 text-sm font-medium text-[#219653]"
          : "rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red"
      }
    >
      {children}
    </p>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-sm font-medium text-red">{children}</span>;
}

function toPersonalForm(account: AccountSettings): PersonalForm {
  return {
    fullName: account.fullName ?? "",
    email: account.email ?? "",
    username: account.username ?? "",
    phoneNumber: account.phoneNumber ?? "",
    bio: account.bio ?? "",
  };
}

function notifyAccountUpdated() {
  window.dispatchEvent(new Event("account-settings-updated"));
}
