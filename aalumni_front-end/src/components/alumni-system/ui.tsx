import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function FeatureHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-heading-5 font-bold text-dark dark:text-white">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl font-medium text-dark-5 dark:text-dark-6">
          {description}
        </p>
      </div>

      {actions}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <p className="text-sm font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6">
        {label}
      </p>
      <strong className="mt-2 block text-2xl font-bold text-dark dark:text-white">
        {value}
      </strong>
      {detail && <p className="mt-1 text-sm font-medium">{detail}</p>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      {title && (
        <div className="border-b border-stroke px-5 py-4 dark:border-dark-3 sm:px-7.5">
          <h2 className="text-xl font-bold text-dark dark:text-white">
            {title}
          </h2>
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title = "No data loaded",
  description = "Sign in with an admin account or check the API connection.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-stroke bg-white p-7.5 text-center dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="text-xl font-bold text-dark dark:text-white">{title}</h2>
      <p className="mt-2 font-medium text-dark-5 dark:text-dark-6">
        {description}
      </p>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        {
          "bg-[#219653]/[0.08] text-[#219653]": [
            "active",
            "approved",
            "sent",
            "completed",
            "open",
          ].includes(normalized),
          "bg-[#FFA70B]/[0.08] text-[#FFA70B]": [
            "pending",
            "queued",
            "scheduled",
            "draft",
          ].includes(normalized),
          "bg-[#D34053]/[0.08] text-[#D34053]": [
            "inactive",
            "denied",
            "expired",
            "failed",
            "closed",
          ].includes(normalized),
          "bg-primary/[0.08] text-primary": ![
            "active",
            "approved",
            "sent",
            "completed",
            "open",
            "pending",
            "queued",
            "scheduled",
            "draft",
            "inactive",
            "denied",
            "expired",
            "failed",
            "closed",
          ].includes(normalized),
        },
      )}
    >
      {status}
    </span>
  );
}
