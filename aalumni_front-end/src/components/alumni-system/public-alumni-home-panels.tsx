"use client";

import {
  accountToPublicUser,
  setStoredAuthState,
  usePublicAuthState,
  type PublicAlumniUser,
} from "@/lib/public-auth";
import { useEffect, useMemo, useState } from "react";

type ProfileForm = Pick<
  PublicAlumniUser,
  | "name"
  | "studentId"
  | "course"
  | "yearGraduated"
  | "location"
  | "employer"
  | "jobTitle"
  | "email"
  | "phone"
>;

const mockSurveys = [
  {
    id: 1,
    title: "Graduate Tracer Survey 2024",
    dateSent: "January 15, 2024",
    status: "pending",
  },
  {
    id: 2,
    title: "Employment Status Survey 2023",
    dateSent: "June 10, 2023",
    status: "completed",
    completedDate: "June 18, 2023",
  },
];

export function PublicAlumniHomePanels() {
  const { isLoggedIn, user } = usePublicAuthState({ sync: true });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [surveyOpen, setSurveyOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(toProfileForm(user));
    }
  }, [user]);

  const completion = useMemo(() => {
    if (!user) {
      return 0;
    }

    const values = [
      user.name,
      user.studentId,
      user.course,
      user.yearGraduated,
      user.location,
      user.employer,
      user.jobTitle,
      user.email,
      user.phone,
    ];
    const completed = values.filter((value) => value && value !== "Not set").length;

    return Math.round((completed / values.length) * 100);
  }, [user]);

  if (!isLoggedIn || !user || !form) {
    return null;
  }

  const updateForm = (key: keyof ProfileForm, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          username: user.username || "",
          phoneNumber: form.phone === "Not set" ? "" : form.phone,
          bio: user.bio || "",
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        item?: Parameters<typeof accountToPublicUser>[0];
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok || !body.item) {
        setMessage(
          body.message ||
            Object.values(body.errors ?? {})[0] ||
            "Unable to save profile changes.",
        );
        return;
      }

      const nextUser = {
        ...accountToPublicUser(body.item, user),
        studentId: form.studentId,
        course: form.course,
        yearGraduated: form.yearGraduated,
        location: form.location,
        employer: form.employer,
        jobTitle: form.jobTitle,
      };

      setStoredAuthState(nextUser);
      setEditing(false);
      setMessage("Profile changes saved.");
    } catch {
      setMessage("Unable to reach the account settings API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-gray-1 py-16 dark:bg-dark sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <article
          id="profile-panel"
          className="scroll-mt-28 rounded-md border border-stroke bg-white p-6 shadow-1 transition-all duration-300 dark:border-dark-3 dark:bg-gray-dark sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-blue-dark">
                My Profile
              </p>
              <h2 className="mt-2 text-2xl font-black text-dark dark:text-white">
                Alumni profile details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-blue-dark px-5 text-sm font-bold text-white transition hover:bg-blue"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm font-bold">
              <span className="text-dark dark:text-white">
                Profile {completion}% complete
              </span>
              <span className="text-blue-dark">{completion}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-2 dark:bg-dark-2">
              <div
                className="h-full rounded-full bg-[#1D9E75] transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {profileFields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-xs font-bold uppercase text-dark-5 dark:text-dark-6">
                  {field.label}
                </span>
                {editing ? (
                  <input
                    value={form[field.key]}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-stroke bg-gray-1 px-3 text-sm font-semibold text-dark outline-none transition focus:border-blue-dark focus:bg-white dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                ) : (
                  <p className="mt-2 min-h-11 rounded-md border border-stroke bg-gray-1 px-3 py-3 text-sm font-semibold text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                    {form[field.key] || "Not set"}
                  </p>
                )}
              </label>
            ))}
          </div>

          {editing && (
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#1D9E75] px-5 text-sm font-bold text-white transition hover:bg-opacity-90 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}

          {message && (
            <p className="mt-4 rounded-md bg-blue-light-5 px-4 py-3 text-sm font-semibold text-blue-dark">
              {message}
            </p>
          )}
        </article>

        <article
          id="tracer-surveys-panel"
          className="scroll-mt-28 rounded-md border border-stroke bg-white p-6 shadow-1 transition-all duration-300 dark:border-dark-3 dark:bg-gray-dark sm:p-7"
        >
          <p className="text-sm font-bold uppercase text-blue-dark">
            Tracer Surveys
          </p>
          <h2 className="mt-2 text-2xl font-black text-dark dark:text-white">
            Assigned surveys
          </h2>

          <div className="mt-6 grid gap-4">
            {mockSurveys.length ? (
              mockSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-dark dark:text-white">
                        {survey.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-dark-5 dark:text-dark-6">
                        Sent {survey.dateSent}
                      </p>
                    </div>
                    <SurveyBadge
                      status={survey.status}
                      completedDate={"completedDate" in survey ? survey.completedDate : undefined}
                    />
                  </div>

                  {survey.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => setSurveyOpen(true)}
                      className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-dark px-4 text-sm font-bold text-white transition hover:bg-blue"
                    >
                      Answer Survey
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-stroke p-6 text-center text-sm font-semibold text-dark-5 dark:border-dark-3 dark:text-dark-6">
                No surveys assigned yet.
              </div>
            )}
          </div>
        </article>
      </div>

      {surveyOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-2 dark:bg-gray-dark">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-blue-dark">
                  Tracer Survey
                </p>
                <h3 className="mt-2 text-2xl font-black text-dark dark:text-white">
                  Graduate Tracer Survey 2024
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSurveyOpen(false)}
                className="grid size-10 place-items-center rounded-md border border-stroke text-dark dark:border-dark-3 dark:text-white"
              >
                x
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <Field label="Current employment status" placeholder="Employed, self-employed, searching..." />
              <Field label="Current employer" placeholder="Company or organization" />
              <Field label="Current job title" placeholder="Your role" />
            </div>
            <button
              type="button"
              onClick={() => setSurveyOpen(false)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#1D9E75] px-5 text-sm font-bold text-white"
            >
              Submit Survey
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const profileFields: Array<{ key: keyof ProfileForm; label: string }> = [
  { key: "name", label: "Full Name" },
  { key: "studentId", label: "Student ID" },
  { key: "course", label: "Course/Degree" },
  { key: "yearGraduated", label: "Year Graduated" },
  { key: "location", label: "Current Location" },
  { key: "employer", label: "Employer" },
  { key: "jobTitle", label: "Job Title" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

function toProfileForm(user: PublicAlumniUser): ProfileForm {
  return {
    name: user.name,
    studentId: user.studentId,
    course: user.course,
    yearGraduated: user.yearGraduated,
    location: user.location,
    employer: user.employer,
    jobTitle: user.jobTitle,
    email: user.email,
    phone: user.phone,
  };
}

function SurveyBadge({
  status,
  completedDate,
}: {
  status: string;
  completedDate?: string;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex rounded-full bg-[#1D9E75]/10 px-3 py-1 text-xs font-bold uppercase text-[#1D9E75]">
        Completed {completedDate ? `- ${completedDate}` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
      Pending
    </span>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark dark:text-white">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-stroke bg-gray-1 px-3 text-sm font-medium text-dark outline-none focus:border-blue-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
    </label>
  );
}
