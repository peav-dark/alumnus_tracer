import {
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import type { GtsResponseAnswer } from "@/lib/api";
import { getAdminGtsResponse } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "GTS Response Detail",
};

export default async function GtsResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const responseId = Number(id);

  if (!Number.isInteger(responseId) || responseId <= 0) {
    notFound();
  }

  const response = await getAdminGtsResponse(responseId);
  const item = response?.item;

  if (!item) {
    notFound();
  }

  return (
    <>
      <FeatureHeader
        title={`GTS Response #${item.id}`}
        description="Read-only view of the submitted tracer survey form."
        actions={
          <Link
            href="/gts/responses"
            className="inline-flex h-10 items-center rounded-md border border-stroke px-4 text-sm font-semibold text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Back to Responses
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Respondent" value={item.respondent.name} />
        <MetricCard
          label="Survey"
          value={item.surveyTemplate?.title ?? "Legacy GTS"}
        />
        <MetricCard
          label="Campaign"
          value={item.campaign?.name ?? "Direct response"}
        />
        <MetricCard label="Submitted" value={formatDate(item.submittedAt)} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Respondent">
          <dl className="grid gap-4 p-5 text-sm sm:p-7.5">
            <MetaRow label="Name" value={item.respondent.name} />
            <MetaRow label="Email" value={item.respondent.email || "No email"} />
            <MetaRow
              label="Institution Code"
              value={item.respondent.institutionCode || "Not set"}
            />
            <MetaRow
              label="Control Code"
              value={item.respondent.controlCode || "Not set"}
            />
          </dl>
        </Panel>

        <Panel title="Survey Source">
          <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2 sm:p-7.5">
            <MetaRow
              label="Template"
              value={item.surveyTemplate?.title ?? "Legacy GTS"}
            />
            <MetaRow
              label="Campaign"
              value={item.campaign?.name ?? "Direct response"}
            />
            <MetaRow
              label="Batch"
              value={item.targetBatchYear ? `Batch ${item.targetBatchYear}` : "Not set"}
            />
            <div>
              <dt className="font-semibold text-dark-5">Invitation Status</dt>
              <dd className="mt-1">
                {item.invitation ? (
                  <StatusPill status={item.invitation.status} />
                ) : (
                  <span className="font-semibold text-dark dark:text-white">
                    No invitation
                  </span>
                )}
              </dd>
            </div>
            <MetaRow
              label="Completed"
              value={formatDate(item.invitation?.completedAt)}
            />
            <MetaRow label="Submitted" value={formatDate(item.submittedAt)} />
          </dl>
        </Panel>
      </div>

      <div className="space-y-6">
        {item.answerSections.length ? (
          item.answerSections.map((section) => (
            <Panel key={section.title} title={section.title}>
              <div className="divide-y divide-stroke dark:divide-dark-3">
                {section.items.map((answer) => (
                  <div key={answer.key || answer.questionText} className="p-5 sm:p-7.5">
                    <h3 className="font-semibold text-dark dark:text-white">
                      {answer.questionText}
                    </h3>
                    <div className="mt-3 text-sm font-medium text-dark-5 dark:text-dark-6">
                      <AnswerValue answer={answer} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))
        ) : (
          <Panel title="Answers">
            <div className="p-7.5 font-medium text-dark-5">
              No stored answers were found for this response.
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-dark-5">{label}</dt>
      <dd className="mt-1 font-semibold text-dark dark:text-white">{value}</dd>
    </div>
  );
}

function AnswerValue({ answer }: { answer: GtsResponseAnswer }) {
  if (answer.inputType === "repeater" && Array.isArray(answer.answer)) {
    const rows = answer.answer.filter(isRecord);
    const columns = repeaterColumns(answer.options, rows);

    if (rows.length === 0) {
      return <span>Not answered</span>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="border-b border-stroke dark:border-dark-3">
              {columns.map((column) => (
                <th key={column.key} className="py-2 pr-4 font-semibold text-dark dark:text-white">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-stroke last:border-0 dark:border-dark-3">
                {columns.map((column) => (
                  <td key={column.key} className="py-2 pr-4">
                    {stringifyAnswer(row[column.key]) || "Not set"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (Array.isArray(answer.answer)) {
    const values = answer.answer.map((value) => stringifyAnswer(value)).filter(Boolean);

    return values.length ? (
      <ul className="list-inside list-disc space-y-1">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    ) : (
      <span>Not answered</span>
    );
  }

  return <p className="whitespace-pre-wrap">{stringifyAnswer(answer.answer) || "Not answered"}</p>;
}

function repeaterColumns(
  options: GtsResponseAnswer["options"],
  rows: Record<string, unknown>[],
) {
  const columns = Array.isArray(options)
    ? options
        .filter(isRecord)
        .map((option) => ({
          key: String(option.key ?? ""),
          label: String(option.label ?? option.key ?? ""),
        }))
        .filter((column) => column.key !== "")
    : [];

  if (columns.length) {
    return columns;
  }

  return Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
    (key) => ({ key, label: humanizeKey(key) }),
  );
}

function stringifyAnswer(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyAnswer(item)).filter(Boolean).join(", ");
  }

  if (isRecord(value)) {
    return Object.values(value).map((item) => stringifyAnswer(item)).filter(Boolean).join(", ");
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function humanizeKey(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
