"use client";

import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import {
  CreateQrBatchAction,
  QrBatchActions,
  QrPreview,
} from "@/components/alumni-system/qr-registration-actions";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QrRegistrationResponse } from "@/lib/api";
import { useEffect, useState } from "react";

const flowSteps = [
  "Create a QR registration batch for a campus event or alumni desk.",
  "Share the generated QR code with attendees for self-service registration.",
  "Review the captured registration drafts and approve verified accounts.",
  "Track the batch outcome through admin audit history.",
];

type ApiError = {
  message?: string;
  error?: string;
};

type RegisterOptionsResponse = {
  batchYears?: number[];
};

export function QrRegistrationWorkspace() {
  const [response, setResponse] = useState<QrRegistrationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBatches = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetch("/api/admin/qr-registration", {
        cache: "no-store",
      });
      const body = (await result.json().catch(() => ({}))) as
        | QrRegistrationResponse
        | ApiError;

      if (!result.ok) {
        const fallback = await fetch("/api/auth/register-options", {
          cache: "no-store",
        });
        const fallbackBody = (await fallback.json().catch(() => ({}))) as
          | RegisterOptionsResponse
          | ApiError;

        if (fallback.ok && Array.isArray((fallbackBody as RegisterOptionsResponse).batchYears)) {
          const batchYears = (fallbackBody as RegisterOptionsResponse).batchYears ?? [];

          setResponse({
            items: batchYears.map((batchYear) => ({
              id: batchYear,
              batchYear,
              isOpen: true,
              createdAt: null,
              registrationUrl: getFrontendQrRegistrationUrl(batchYear),
            })),
            meta: {
              total: batchYears.length,
              open: batchYears.length,
              defaultBatchYear: new Date().getFullYear(),
              maxBatchYear: new Date().getFullYear() + 10,
            },
          });
          setError("");
          return;
        }

        setResponse(null);
        setError(
          (body as ApiError).message ||
            (body as ApiError).error ||
            (fallbackBody as ApiError).message ||
            (fallbackBody as ApiError).error ||
            `Unable to load QR batches. Status ${result.status}.`,
        );
        return;
      }

      setResponse(body as QrRegistrationResponse);
    } catch {
      setResponse(null);
      setError("Unable to reach the QR registration endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBatches();
  }, []);

  const batches = response?.items ?? [];
  const openBatches =
    response?.meta.open ?? batches.filter((batch) => batch.isOpen).length;
  const defaultBatchYear =
    response?.meta.defaultBatchYear ?? new Date().getFullYear();
  const latestBatch = batches[0];
  const batchOptions = [...batches]
    .sort((a, b) => b.batchYear - a.batchYear)
    .map((batch) => ({
      label: `Batch ${batch.batchYear}`,
      value: `Batch ${batch.batchYear}`,
    }));

  return (
    <>
      <FeatureHeader
        title="QR Registration"
        description="Create and manage public QR registration links for alumni batches, campus desks, and event check-ins."
        actions={
          <CreateQrBatchAction
            defaultBatchYear={defaultBatchYear}
            onSaved={loadBatches}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total batches"
          value={response?.meta.total ?? batches.length}
        />
        <MetricCard label="Open batches" value={openBatches} />
        <MetricCard
          label="Latest batch"
          value={latestBatch ? latestBatch.batchYear : "None"}
          detail={
            latestBatch ? formatDate(latestBatch.createdAt) : "No QR batch yet"
          }
        />
      </div>

      {loading ? (
        <Panel>
          <div className="flex items-center gap-3 p-7.5 font-medium">
            <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading QR batches...
          </div>
        </Panel>
      ) : error ? (
        <EmptyState title="QR registration unavailable" description={error} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel title="QR Registration Batches">
            {batches.length ? (
              <JQueryDataTable
                order={[[2, "desc"]]}
                pageLength={10}
                filters={[
                  {
                    id: "batch",
                    label: "Batch",
                    column: 0,
                    placeholder: "All batches",
                    options: batchOptions,
                  },
                  {
                    id: "status",
                    label: "Status",
                    column: 1,
                    match: "exact",
                    placeholder: "All statuses",
                    options: [
                      { label: "Open", value: "Open" },
                      { label: "Closed", value: "Closed" },
                    ],
                  },
                ]}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="[&>th]:py-4">
                      <TableHead className="min-w-[360px] pl-5 sm:pl-7.5">
                        QR Link
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="pr-5 text-right sm:pr-7.5">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id} className="text-base">
                        <TableCell className="pl-5 sm:pl-7.5">
                          <QrPreview
                            url={getFrontendQrRegistrationUrl(batch.batchYear)}
                            batchYear={batch.batchYear}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusPill status={batch.isOpen ? "Open" : "Closed"} />
                        </TableCell>
                        <TableCell>{formatDate(batch.createdAt)}</TableCell>
                        <TableCell className="pr-5 sm:pr-7.5">
                          <QrBatchActions
                            batch={{
                              ...batch,
                              registrationUrl: getFrontendQrRegistrationUrl(
                                batch.batchYear,
                              ),
                            }}
                            onSaved={loadBatches}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </JQueryDataTable>
            ) : (
              <div className="p-7.5">
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  No QR batches yet
                </h3>
                <p className="mt-2 font-medium text-dark-5 dark:text-dark-6">
                  Create the first batch to generate a public registration QR link.
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Batch Registration Flow">
            <div className="grid gap-4 p-5 sm:p-7.5">
              {flowSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[10px] border border-stroke p-5 dark:border-dark-3"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-4 font-medium text-dark dark:text-white">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}

function getFrontendQrRegistrationUrl(batchYear: number) {
  if (typeof window === "undefined") {
    return `/register/qr/${batchYear}`;
  }

  return `${window.location.origin}/register/qr/${batchYear}`;
}
