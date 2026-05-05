"use client";

import { useState, useRef, useCallback, type ChangeEvent, type FormEvent } from "react";
import type {
  StudentRecord,
  StudentRecordImportResponse,
} from "@/lib/api";
import {
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ─── Props ─── */
type StudentRecordsManagerProps = {
  initialRecords: StudentRecord[];
  initialMeta: {
    total: number;
    totalUnclaimed: number;
    totalClaimed: number;
  };
};

/* ─── Main Component ─── */
export function StudentRecordsManager({
  initialRecords,
  initialMeta,
}: StudentRecordsManagerProps) {
  const [records, setRecords] = useState<StudentRecord[]>(initialRecords);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"" | "claimed" | "unclaimed">("");
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchRecords = useCallback(
    async (q = search, status = filter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (status) params.set("status", status);
        params.set("limit", "100");

        const res = await fetch(`/api/admin/student-records?${params.toString()}`);
        const data = await res.json();

        if (data.items) {
          setRecords(data.items);
          setMeta({
            total: data.meta?.total ?? 0,
            totalUnclaimed: data.meta?.totalUnclaimed ?? 0,
            totalClaimed: data.meta?.totalClaimed ?? 0,
          });
        }
      } catch {
        // Silently fail — records stay as-is
      } finally {
        setLoading(false);
      }
    },
    [search, filter],
  );

  async function handleDelete(id: number) {
    if (!confirm("Delete this student record?")) return;

    const res = await fetch("/api/admin/student-records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      await fetchRecords();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Failed to delete record.");
    }
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    void fetchRecords();
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBox label="Total Records" value={meta.total} />
        <StatBox label="Unclaimed" value={meta.totalUnclaimed} color="amber" />
        <StatBox label="Claimed" value={meta.totalClaimed} color="green" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or name..."
            className="h-10 w-64 rounded-md border border-stroke bg-gray-1 px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "" | "claimed" | "unclaimed");
              void fetchRecords(search, e.target.value as "" | "claimed" | "unclaimed");
            }}
            className="h-10 rounded-md border border-stroke bg-gray-1 px-3 text-sm text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">All</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="claimed">Claimed</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        {loading ? (
          <div className="p-8 text-center font-medium text-dark-5">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center font-medium text-dark-5">
            No student records found.{" "}
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="font-bold text-primary underline"
            >
              Import a CSV
            </button>{" "}
            to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="[&>th]:py-4">
                <TableHead className="pl-5">Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => (
                <TableRow key={rec.id} className="text-sm">
                  <TableCell className="pl-5 font-semibold text-dark dark:text-white">
                    {rec.studentId}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-dark dark:text-white">{rec.fullName}</div>
                  </TableCell>
                  <TableCell className="text-dark-5">{rec.college || "—"}</TableCell>
                  <TableCell className="text-dark-5">{rec.department || "—"}</TableCell>
                  <TableCell className="text-dark-5">{rec.batchYear || "—"}</TableCell>
                  <TableCell>
                    {rec.claimed ? (
                      <span title={`Claimed by ${rec.claimedBy?.fullName || "user"}`}>
                        <StatusPill status="Claimed" />
                      </span>
                    ) : (
                      <StatusPill status="Unclaimed" />
                    )}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {rec.claimed ? (
                      <span className="text-xs text-dark-5">
                        {rec.claimedBy?.email}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id)}
                        className="rounded-md px-3 py-1.5 text-xs font-bold text-red transition hover:bg-red/10"
                      >
                        Delete
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            void fetchRecords();
          }}
        />
      )}
    </div>
  );
}

/* ─── Import Modal ─── */
function ImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [batchLabel, setBatchLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<StudentRecordImportResponse | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setError("");
    setResult(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    if (batchLabel.trim()) {
      formData.append("batchLabel", batchLabel.trim());
    }

    try {
      const res = await fetch("/api/admin/student-records/import", {
        method: "POST",
        body: formData,
      });
      const data: StudentRecordImportResponse = await res.json();

      if (!res.ok && data.imported === undefined) {
        setError(data.message || "Import failed.");
        return;
      }

      setResult(data);

      // Reset file input after success
      if (data.imported > 0 || data.updated > 0) {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setUploading(false);
    }
  }

  const hasImported = result && (result.imported > 0 || result.updated > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-dark">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark dark:text-white">
            Import Student Records
          </h3>
          <button
            type="button"
            onClick={hasImported ? onSuccess : onClose}
            className="rounded-md p-1 text-dark-5 transition hover:bg-gray-2 dark:hover:bg-dark-2"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark dark:text-white">
              CSV File <span className="text-red">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="w-full rounded-md border border-stroke bg-gray-1 px-3 py-2.5 text-sm text-dark file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
            <p className="mt-1.5 text-xs text-dark-5">
              Required columns: <code className="rounded bg-gray-2 px-1 dark:bg-dark-2">student_id</code>,{" "}
              <code className="rounded bg-gray-2 px-1 dark:bg-dark-2">first_name</code>,{" "}
              <code className="rounded bg-gray-2 px-1 dark:bg-dark-2">last_name</code>.
              Optional: <code className="rounded bg-gray-2 px-1 dark:bg-dark-2">middle_name</code>,{" "}
              <code className="rounded bg-gray-2 px-1 dark:bg-dark-2">batch_year</code>.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark dark:text-white">
              Batch Label <span className="text-xs font-normal text-dark-5">(Optional)</span>
            </label>
            <input
              type="text"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder='e.g. "Batch 2024 Import"'
              className="h-10 w-full rounded-md border border-stroke bg-gray-1 px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red/20 bg-red/[0.08] px-4 py-2.5 text-sm font-medium text-red">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-md border px-4 py-3 text-sm ${
              hasImported
                ? "border-green/20 bg-green/[0.08] text-green-dark"
                : "border-amber-400/20 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            }`}>
              <p className="font-semibold">{result.message}</p>
              <div className="mt-1.5 flex gap-4 text-xs">
                <span>✅ Imported: {result.imported}</span>
                <span>🔄 Updated: {result.updated}</span>
                <span>⏭️ Skipped: {result.skipped}</span>
              </div>
              {result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold">
                    {result.errors.length} warning(s)
                  </summary>
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {result.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={hasImported ? onSuccess : onClose}
              className="h-10 rounded-md border border-stroke px-4 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white"
            >
              {hasImported ? "Done" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="h-10 rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Small Stat Box ─── */
function StatBox({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "amber" | "green";
}) {
  const colorClasses = {
    blue: "border-primary/20 bg-primary/[0.06]",
    amber: "border-amber-400/20 bg-amber-50 dark:bg-amber-900/10",
    green: "border-green/20 bg-green/[0.06]",
  };

  return (
    <div className={`rounded-md border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-dark-5 dark:text-dark-6">{label}</p>
      <p className="mt-1 text-2xl font-black text-dark dark:text-white">{value}</p>
    </div>
  );
}
