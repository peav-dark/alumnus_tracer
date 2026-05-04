import { getAdminFeatures } from "@/lib/api";
import Link from "next/link";

const routeByFeature: Record<string, string> = {
  users: "/users",
  verification: "/verification",
  announcements: "/admin/announcements",
  jobs: "/jobs",
  academic: "/academic",
  gts: "/gts/surveys",
  audit_logs: "/audit-logs",
  dashboard: "/analytics",
};

const fallbackFeatures = [
  { key: "users", label: "Manage Users", endpoint: "/api/admin/users" },
  {
    key: "verification",
    label: "Profile Verification",
    endpoint: "/api/admin/verification",
  },
  {
    key: "announcements",
    label: "Events and Announcements",
    endpoint: "/api/admin/announcements",
  },
  { key: "jobs", label: "Job Postings", endpoint: "/api/admin/jobs" },
  {
    key: "academic",
    label: "Academic Management",
    endpoint: "/api/admin/academic",
  },
  {
    key: "gts",
    label: "GTS Surveys and Campaigns",
    endpoint: "/api/admin/gts/surveys",
  },
  {
    key: "audit_logs",
    label: "Audit Logs",
    endpoint: "/api/admin/audit-logs",
  },
];

export async function FeatureLaunchpad() {
  const response = await getAdminFeatures();
  const features = response?.features?.length ? response.features : fallbackFeatures;

  return (
    <section className="mt-4 rounded-[10px] border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:mt-6 sm:p-7.5 2xl:mt-9">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Feature Workspace
        </h2>
        <p className="font-medium text-dark-5 dark:text-dark-6">
          Admin modules exposed by the alumni tracker backend.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Link
            key={feature.key}
            href={routeByFeature[feature.key] || "/"}
            className="rounded-[10px] border border-stroke p-4 transition-colors hover:border-primary hover:bg-primary/[0.03] dark:border-dark-3 dark:hover:border-primary"
          >
            <span className="font-semibold text-dark dark:text-white">
              {feature.label}
            </span>
            <span className="mt-1 block text-sm font-medium text-dark-5 dark:text-dark-6">
              {feature.endpoint}
            </span>
          </Link>
        ))}
        <Link
          href="/qr-registration"
          className="rounded-[10px] border border-stroke p-4 transition-colors hover:border-primary hover:bg-primary/[0.03] dark:border-dark-3 dark:hover:border-primary"
        >
          <span className="font-semibold text-dark dark:text-white">
            QR Registration
          </span>
          <span className="mt-1 block text-sm font-medium text-dark-5 dark:text-dark-6">
            Batch QR onboarding workflow
          </span>
        </Link>
      </div>
    </section>
  );
}
