"use client";

import { CameraIcon } from "@/app/profile/_components/icons";
import { PublicAuthModal, type PublicAuthView } from "@/components/alumni-system/public-auth-modal";
import { PublicHeader } from "@/components/alumni-system/public-header";
import { StudentLinkModal } from "@/components/alumni-system/student-link-modal";
import {
  accountToPublicUser,
  isAlumniAccount,
  setStoredAuthState,
  usePublicAuthState,
  type AccountSettings,
  type PublicAlumniUser,
} from "@/lib/public-auth";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type AccountSettingsResponse = {
  item?: AccountSettings;
  errors?: Record<string, string>;
  message?: string;
};

type ProfileForm = Pick<
  AccountSettings,
  "fullName" | "email" | "username" | "phoneNumber" | "bio"
>;

const emptyProfileForm: ProfileForm = {
  fullName: "",
  email: "",
  username: "",
  phoneNumber: "",
  bio: "",
};

export default function ProfilePage() {
  const { isLoggedIn, isLoading, user } = usePublicAuthState({ sync: true });
  const [account, setAccount] = useState<AccountSettings | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyProfileForm);
  const [coverPhoto, setCoverPhoto] = useState("/images/cover/cover-01.png");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [accountLoading, setAccountLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");
  const [showStudentLink, setShowStudentLink] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if redirected from Google with needsStudentLink
  // This param is only set by the backend for alumni users
  useEffect(() => {
    if (searchParams.get("needsStudentLink") === "1") {
      setShowStudentLink(true);
    }
  }, [searchParams]);

  // Also check from account settings (alumni only)
  useEffect(() => {
    if (account && isAlumniAccount(account) && (account as Record<string, unknown>).needsStudentLink === true) {
      setShowStudentLink(true);
    }
  }, [account]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAccount(null);
      setForm(emptyProfileForm);
      return;
    }

    void loadAccount(user);
  }, [isLoggedIn, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto]);

  const alumni = account?.alumni;
  const displayName = alumni?.fullName || account?.fullName || user?.name || "NORSU Alumni";
  const displayEmail = alumni?.emailAddress || account?.email || user?.email || "Not set";
  const avatarSrc = photoPreview || withCacheBust(account?.profileImageUrl || "", avatarVersion);
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const profileFields = [
    ["School ID", alumni?.studentNumber || account?.schoolId || user?.studentId || "Not set"],
    ["Program", alumni?.degreeProgram || alumni?.course || user?.course || "Not set"],
    ["Graduated", String(alumni?.yearGraduated || user?.yearGraduated || "Not set")],
    ["Employment", alumni?.employmentStatus || "Not set"],
  ];
  const accountFields = [
    ["Username", account?.username || user?.username || "Not set"],
    ["Phone", account?.phoneNumber || user?.phone || "Not set"],
    ["Email", displayEmail],
  ];

  async function loadAccount(existingUser?: PublicAlumniUser | null) {
    setAccountLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/account/settings", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as AccountSettingsResponse;

      if (!response.ok || !body.item) {
        setErrors({ form: body.message || "Unable to load your profile." });
        return;
      }

      if (!isAlumniAccount(body.item)) {
        setErrors({ form: "This profile page is only for alumni accounts." });
        return;
      }

      setAccount(body.item);
      setForm(toProfileForm(body.item));
      setAvatarVersion(Date.now());
      setStoredAuthState(accountToPublicUser(body.item, existingUser));
    } catch {
      setErrors({ form: "Unable to reach the account settings endpoint." });
    } finally {
      setAccountLoading(false);
    }
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setCoverPhoto(URL.createObjectURL(file));
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as AccountSettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { personal: body.message || "Unable to save profile." });
        return;
      }

      setAccount(body.item);
      setForm(toProfileForm(body.item));
      setStoredAuthState(accountToPublicUser(body.item, user));
      window.dispatchEvent(new Event("account-settings-updated"));
      setMessage("Profile updated.");
      setEditing(false);
    } catch {
      setErrors({ personal: "Unable to reach the account settings endpoint." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPhoto) {
      setErrors({ photo: "Please choose a photo first." });
      return;
    }

    setSavingPhoto(true);
    setErrors({});
    setMessage("");

    const formData = new FormData();
    formData.append("photo", selectedPhoto);

    try {
      const response = await fetch("/api/account/photo", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json().catch(() => ({}))) as AccountSettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { photo: body.message || "Unable to update photo." });
        return;
      }

      setAccount(body.item);
      setSelectedPhoto(null);
      setAvatarVersion(Date.now());
      setStoredAuthState(accountToPublicUser(body.item, user));
      window.dispatchEvent(new Event("account-settings-updated"));
      setMessage("Profile photo updated.");
    } catch {
      setErrors({ photo: "Unable to reach the photo endpoint." });
    } finally {
      setSavingPhoto(false);
    }
  }

  async function removePhoto() {
    setSavingPhoto(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/account/photo", { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as AccountSettingsResponse;

      if (!response.ok || !body.item) {
        setErrors(body.errors ?? { photo: body.message || "Unable to remove photo." });
        return;
      }

      setAccount(body.item);
      setSelectedPhoto(null);
      setAvatarVersion(Date.now());
      setStoredAuthState(accountToPublicUser(body.item, user));
      window.dispatchEvent(new Event("account-settings-updated"));
      setMessage("Profile photo removed.");
    } catch {
      setErrors({ photo: "Unable to reach the photo endpoint." });
    } finally {
      setSavingPhoto(false);
    }
  }

  function openAuth(view: PublicAuthView) {
    setAuthView(view);
    setAuthOpen(true);
  }

  return (
    <main className="min-h-screen bg-white text-dark dark:bg-[#020d1a]">
      <PublicHeader active="home" accent="blue" />

      {/* Student Link Modal — shown after Google registration */}
      {showStudentLink && (
        <StudentLinkModal
          onLinked={() => {
            setShowStudentLink(false);
            // Reload the page to refresh account data
            window.location.href = "/profile";
          }}
        />
      )}

      <section className="bg-[linear-gradient(135deg,#0F3D91_0%,#1C3FB7_42%,#5475E5_100%)] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
            Alumni profile
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            My Profile
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-white/80">
            Review your alumni account, update your profile photo, and keep your
            contact information current.
          </p>
        </div>
      </section>

      <section className="bg-gray-1 px-5 py-16 dark:bg-dark sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {isLoading || accountLoading ? (
            <ProfileSkeleton />
          ) : !isLoggedIn ? (
            <div className="rounded-md border border-stroke bg-white p-8 text-center shadow-1 dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="text-2xl font-black text-dark dark:text-white">
                Login to view your profile
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-dark-5 dark:text-dark-6">
                Your alumni profile is available after signing in with an
                approved alumni account.
              </p>
              <button
                type="button"
                onClick={() => openAuth("sign-in")}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {errors.form && <Message tone="error">{errors.form}</Message>}
              {message && <Message tone="success">{message}</Message>}

              <article className="overflow-hidden rounded-md bg-white shadow-1 dark:bg-gray-dark">
                <div className="relative z-20 h-40 sm:h-56 md:h-64">
                  <img
                    src={coverPhoto}
                    alt="profile cover"
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute bottom-4 right-4 z-10">
                    <label
                      htmlFor="coverPhoto"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-dark px-4 py-2 text-sm font-bold text-white transition hover:bg-blue"
                    >
                      <input
                        type="file"
                        name="coverPhoto"
                        id="coverPhoto"
                        className="sr-only"
                        onChange={handleCoverChange}
                        accept="image/png, image/jpg, image/jpeg"
                      />
                      <CameraIcon />
                      <span>Edit Cover</span>
                    </label>
                  </div>
                </div>

                <div className="px-5 pb-8 text-center sm:px-8">
                  <div className="relative z-30 mx-auto -mt-20 h-32 w-32 rounded-full bg-white/20 p-2 backdrop-blur sm:h-44 sm:w-44 sm:p-3">
                    <div className="relative size-full drop-shadow-2">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          className="size-full rounded-full object-cover"
                          alt={`Profile avatar of ${displayName}`}
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center rounded-full bg-blue-dark text-4xl font-semibold text-white">
                          {initials}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2 className="text-2xl font-black text-dark dark:text-white">
                      {displayName}
                    </h2>
                    <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                      {displayEmail}
                    </p>

                    <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 rounded-md border border-stroke shadow-1 dark:border-dark-3 dark:bg-dark-2 sm:grid-cols-2 lg:grid-cols-4">
                      {profileFields.map(([label, value], index) => (
                        <ProfileMeta
                          key={label}
                          label={label}
                          value={value}
                          last={index === profileFields.length - 1}
                        />
                      ))}
                    </div>

                    <div className="mx-auto mt-7 max-w-2xl">
                      <h3 className="font-bold text-dark dark:text-white">
                        About Me
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-7 text-dark-5 dark:text-dark-6">
                        {account?.bio || "No bio has been added yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
                <section className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase text-blue-dark">
                        Profile details
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-dark dark:text-white">
                        Account information
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing((current) => !current);
                        setErrors({});
                        setMessage("");
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-blue-dark px-4 text-sm font-bold text-white transition hover:bg-blue"
                    >
                      {editing ? "Close" : "Edit Profile"}
                    </button>
                  </div>

                  {editing ? (
                    <form onSubmit={saveProfile} className="mt-6 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Full Name"
                          name="fullName"
                          value={form.fullName}
                          onChange={setForm}
                          error={errors.fullName}
                        />
                        <Field
                          label="Phone Number"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={setForm}
                          error={errors.phoneNumber}
                        />
                      </div>
                      <Field
                        label="Email Address"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={setForm}
                        error={errors.email}
                      />
                      <Field
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={setForm}
                        error={errors.username}
                      />
                      <TextAreaField
                        label="Bio"
                        name="bio"
                        value={form.bio}
                        onChange={setForm}
                        error={errors.bio}
                      />
                      {errors.personal && <Message tone="error">{errors.personal}</Message>}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          disabled={savingProfile}
                          onClick={() => {
                            if (account) {
                              setForm(toProfileForm(account));
                            }
                            setEditing(false);
                            setErrors({});
                          }}
                          className="rounded-md border border-stroke px-5 py-2 text-sm font-bold text-dark transition hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="rounded-md bg-blue-dark px-5 py-2 text-sm font-bold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {savingProfile ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <InfoTile label="Full Name" value={displayName} />
                      {accountFields.map(([label, value]) => (
                        <InfoTile key={label} label={label} value={value} />
                      ))}
                      <InfoTile label="Employer" value={alumni?.companyName || "Not set"} />
                      <InfoTile label="Job Title" value={alumni?.jobTitle || "Not set"} />
                    </div>
                  )}
                </section>

                <section className="rounded-md border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                  <p className="text-sm font-bold uppercase text-blue-dark">
                    Your photo
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-dark dark:text-white">
                    Profile image
                  </h2>

                  <form onSubmit={savePhoto} className="mt-6 space-y-4">
                    <label className="block cursor-pointer rounded-md border border-dashed border-stroke bg-gray-1 p-5 text-center transition hover:border-blue-dark dark:border-dark-3 dark:bg-dark-2">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                          setSelectedPhoto(event.target.files?.[0] ?? null);
                          setErrors({});
                          setMessage("");
                        }}
                      />
                      <span className="font-bold text-blue-dark">Click to upload</span>
                      <span className="mt-1 block text-sm font-medium text-dark-5 dark:text-dark-6">
                        JPG, PNG, or WEBP up to 10MB
                      </span>
                      {selectedPhoto && (
                        <span className="mt-3 block text-sm font-semibold text-dark dark:text-white">
                          {selectedPhoto.name}
                        </span>
                      )}
                    </label>

                    {errors.photo && <Message tone="error">{errors.photo}</Message>}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={savingPhoto || !selectedPhoto}
                        className="h-10 rounded-md bg-blue-dark px-4 text-sm font-bold text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingPhoto ? "Saving..." : "Save Photo"}
                      </button>
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={savingPhoto || !account?.profileImageUrl}
                        className="h-10 rounded-md border border-stroke px-4 text-sm font-bold text-red transition hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicAuthModal
        open={authOpen}
        view={authView}
        publicSignupEnabled
        onViewChange={setAuthView}
        onClose={() => setAuthOpen(false)}
      />
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-1 dark:bg-gray-dark">
      <div className="h-56 bg-gray-2 dark:bg-dark-2" />
      <div className="px-6 pb-8 text-center">
        <div className="mx-auto -mt-16 size-32 rounded-full bg-gray-3 ring-4 ring-white dark:bg-dark-2 dark:ring-gray-dark" />
        <div className="mx-auto mt-6 h-7 w-56 rounded bg-gray-2 dark:bg-dark-2" />
        <div className="mx-auto mt-3 h-4 w-64 rounded bg-gray-2 dark:bg-dark-2" />
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-4">
          <div className="h-20 rounded bg-gray-2 dark:bg-dark-2" />
          <div className="h-20 rounded bg-gray-2 dark:bg-dark-2" />
          <div className="h-20 rounded bg-gray-2 dark:bg-dark-2" />
          <div className="h-20 rounded bg-gray-2 dark:bg-dark-2" />
        </div>
      </div>
    </div>
  );
}

function ProfileMeta({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex min-h-20 flex-col items-center justify-center gap-1 px-4 py-4 ${
        last ? "" : "border-b border-stroke dark:border-dark-3 sm:border-r lg:border-b-0"
      }`}
    >
      <span className="break-all text-center font-bold text-dark dark:text-white">
        {value}
      </span>
      <span className="text-sm font-medium text-dark-5 dark:text-dark-6">
        {label}
      </span>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
      <p className="text-xs font-bold uppercase text-dark-5 dark:text-dark-6">
        {label}
      </p>
      <p className="mt-2 break-words font-semibold text-dark dark:text-white">
        {value}
      </p>
    </div>
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
  name: keyof ProfileForm;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<ProfileForm>>;
  error?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-dark dark:text-white">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="h-11 w-full rounded-md border border-stroke bg-gray-1 px-4 text-sm font-medium text-dark outline-none transition focus:border-blue-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
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
  name: keyof ProfileForm;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<ProfileForm>>;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-dark dark:text-white">
        {label}
      </span>
      <textarea
        rows={5}
        name={name}
        value={value}
        onChange={(event) =>
          onChange((current) => ({ ...current, [name]: event.target.value }))
        }
        className="w-full rounded-md border border-stroke bg-gray-1 px-4 py-3 text-sm font-medium text-dark outline-none transition focus:border-blue-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      {error && <span className="mt-1 block text-sm font-medium text-red">{error}</span>}
    </label>
  );
}

function Message({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      className={
        tone === "success"
          ? "rounded-md border border-[#1D9E75]/20 bg-[#1D9E75]/10 px-4 py-3 text-sm font-semibold text-[#0F6B52]"
          : "rounded-md border border-red/20 bg-red/[0.08] px-4 py-3 text-sm font-semibold text-red"
      }
    >
      {children}
    </p>
  );
}

function toProfileForm(account: AccountSettings): ProfileForm {
  return {
    fullName: account.fullName ?? "",
    email: account.email ?? "",
    username: account.username ?? "",
    phoneNumber: account.phoneNumber ?? "",
    bio: account.bio ?? "",
  };
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NA"
  );
}

function withCacheBust(url: string, version: number) {
  if (!url || !version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${version}`;
}
