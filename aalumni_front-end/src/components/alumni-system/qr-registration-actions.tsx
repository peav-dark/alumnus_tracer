"use client";

import type { QrRegistrationBatch } from "@/lib/api";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

export function CreateQrBatchAction({
  defaultBatchYear,
  onSaved,
}: {
  defaultBatchYear: number;
  onSaved?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [batchYear, setBatchYear] = useState(String(defaultBatchYear));
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin/qr-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchYear: Number(batchYear), isOpen }),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to create QR batch.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      setBatchYear(String(defaultBatchYear));
      setIsOpen(true);
      await onSaved?.();
      router.refresh();
    } catch {
      setError("Unable to reach the QR registration endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        title="Create QR batch"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        <ActionIcon name="plus" />
        <span>Create QR batch</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Create QR registration batch"
          >
            <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
                <div>
                  <h2 className="text-xl font-bold text-dark dark:text-white">
                    Create QR Batch
                  </h2>
                  <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                    Generate a public QR registration link for a batch year.
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
                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Batch Year
                  </span>
                  <input
                    type="number"
                    min={1950}
                    max={defaultBatchYear + 10}
                    value={batchYear}
                    onChange={(event) => setBatchYear(event.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  />
                  {fieldErrors.batchYear && (
                    <span className="mt-1 block text-sm font-medium text-red">
                      {fieldErrors.batchYear}
                    </span>
                  )}
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-stroke p-4 font-medium dark:border-dark-3">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(event) => setIsOpen(event.target.checked)}
                    className="size-4"
                  />
                  Open immediately
                </label>

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

export function QrBatchActions({
  batch,
  onSaved,
}: {
  batch: QrRegistrationBatch;
  onSaved?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggle = async () => {
    setLoadingAction("toggle");
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/qr-registration/${batch.id}/toggle`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to toggle batch.");
        return;
      }

      await onSaved?.();
      router.refresh();
    } catch {
      setError("Unable to reach the QR registration endpoint.");
    } finally {
      setLoadingAction(null);
    }
  };

  const copyLink = async () => {
    setMessage("");
    setError("");

    try {
      await navigator.clipboard.writeText(batch.registrationUrl);
      setMessage("Link copied.");
    } catch {
      setError("Unable to copy link.");
    }
  };

  const downloadQrCode = async () => {
    setLoadingAction("download");
    setMessage("");
    setError("");

    try {
      const response = await fetch(getQrImageUrl(batch.registrationUrl, 800));

      if (!response.ok) {
        throw new Error("Unable to download QR image.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `batch-${batch.batchYear}-qr-registration.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setMessage("QR download started.");
    } catch {
      setError("Unable to download QR code.");
    } finally {
      setLoadingAction(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete QR registration for batch ${batch.batchYear}?`)) {
      return;
    }

    setLoadingAction("delete");
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/qr-registration/${batch.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to delete batch.");
        return;
      }

      await onSaved?.();
      router.refresh();
    } catch {
      setError("Unable to reach the QR registration endpoint.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex min-w-[180px] flex-col gap-2">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          title={batch.isOpen ? "Close batch" : "Open batch"}
          onClick={toggle}
          disabled={loadingAction !== null}
          className="p-1.5 text-primary transition hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="sr-only">{batch.isOpen ? "Close batch" : "Open batch"}</span>
          {loadingAction === "toggle" ? (
            <SpinnerIcon />
          ) : (
            <ActionIcon name={batch.isOpen ? "lock" : "unlock"} />
          )}
        </button>
        <button
          type="button"
          title="Copy registration link"
          onClick={copyLink}
          className="p-1.5 text-primary transition hover:text-primary/70"
        >
          <span className="sr-only">Copy registration link</span>
          <ActionIcon name="copy" />
        </button>
        <button
          type="button"
          title="Download QR code"
          onClick={downloadQrCode}
          disabled={loadingAction !== null}
          className="p-1.5 text-primary transition hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="sr-only">Download QR code</span>
          {loadingAction === "download" ? (
            <SpinnerIcon />
          ) : (
            <ActionIcon name="download" />
          )}
        </button>
        <button
          type="button"
          title="Delete batch"
          onClick={remove}
          disabled={loadingAction !== null}
          className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="sr-only">Delete batch</span>
          {loadingAction === "delete" ? <SpinnerIcon /> : <ActionIcon name="trash" />}
        </button>
      </div>
      {message && <p className="text-right text-xs font-medium text-green">{message}</p>}
      {error && <p className="text-right text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

export function QrPreview({ url, batchYear }: { url: string; batchYear: number }) {
  const qrUrl = getQrImageUrl(url, 160);

  return (
    <div className="flex items-center gap-4">
      <img
        src={qrUrl}
        alt={`QR code for batch ${batchYear} registration`}
        className="size-24 rounded-lg border border-stroke bg-white p-2 dark:border-dark-3"
      />
      <div className="min-w-0">
        <p className="font-semibold text-dark dark:text-white">Batch {batchYear}</p>
        <p className="mt-1 truncate text-sm font-medium text-dark-5 dark:text-dark-6">
          {url}
        </p>
      </div>
    </div>
  );
}

function ActionIcon({
  name,
}: {
  name:
    | "plus"
    | "x"
    | "trash"
    | "copy"
    | "download"
    | "lock"
    | "unlock";
}) {
  if (name === "plus") {
    return (
      <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 7.5h7.083v7.083H7.5V7.5ZM5.417 12.5h-.834a1.25 1.25 0 0 1-1.25-1.25V4.583a1.25 1.25 0 0 1 1.25-1.25h6.667a1.25 1.25 0 0 1 1.25 1.25v.834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3.333v8.334M6.667 8.333 10 11.667l3.333-3.334M4.167 14.167v1.666h11.666v-1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "lock" || name === "unlock") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d={name === "lock" ? "M5.833 8.333h8.334v7.5H5.833v-7.5ZM7.5 8.333V6.667a2.5 2.5 0 0 1 5 0v1.666" : "M5.833 8.333h8.334v7.5H5.833v-7.5ZM7.5 8.333V6.667a2.5 2.5 0 0 1 4.5-1.5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function getQrImageUrl(url: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&data=${encodeURIComponent(url)}`;
}
