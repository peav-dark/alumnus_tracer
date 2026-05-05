"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";

type StudentRecordResult = {
  id: number;
  studentId: string;
  fullName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  batchYear: number | null;
};

type CollegeOption = { id: number; name: string; code: string | null };
type DepartmentOption = {
  id: number;
  name: string;
  collegeName: string | null;
  collegeId: number | null;
};

type StudentLinkModalProps = {
  onLinked: () => void;
};

export function StudentLinkModal({ onLinked }: StudentLinkModalProps) {
  // Step control: "search" → "details"
  const [step, setStep] = useState<"search" | "details">("search");

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentRecordResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentRecordResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Academic options
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Shared state
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [totalUnclaimed, setTotalUnclaimed] = useState<number | null>(null);

  // Load academic options on mount
  useEffect(() => {
    fetch("/api/account/academic-options")
      .then((res) => res.json())
      .then((data) => {
        setColleges(data.colleges ?? []);
        setDepartments(data.departments ?? []);
      })
      .catch(() => {});
  }, []);

  // Filtered departments based on selected college
  const filteredDepartments = selectedCollegeId
    ? departments.filter((d) => String(d.collegeId) === selectedCollegeId)
    : departments;

  const doSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    setError("");

    try {
      const res = await fetch(
        `/api/account/search-student-records?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const debugInfo = data.debug ? ` [Debug: ${JSON.stringify(data.debug)}]` : "";
        const msg = (data.message || `Search failed (HTTP ${res.status})`) + debugInfo;
        setError(msg);
        setResults([]);
        return;
      }

      setResults(data.items ?? []);
      if (typeof data.totalUnclaimed === "number") {
        setTotalUnclaimed(data.totalUnclaimed);
      }
    } catch {
      setError("Unable to search student records.");
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSearchInput(value: string) {
    setQuery(value);
    setSelectedRecord(null);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void doSearch(value.trim());
    }, 400);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    void doSearch(query.trim());
  }

  function proceedToDetails() {
    if (!selectedRecord) return;
    setStep("details");
    setError("");
  }

  function goBackToSearch() {
    setStep("search");
    setError("");
  }

  async function handleClaim() {
    if (!selectedRecord || !selectedCollegeId || !selectedDepartmentId) {
      setError("Please select your college and department.");
      return;
    }

    setClaiming(true);
    setError("");

    try {
      const res = await fetch("/api/account/claim-student-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRecordId: selectedRecord.id,
          collegeId: Number(selectedCollegeId),
          departmentId: Number(selectedDepartmentId),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "Student record linked successfully!");
        setTimeout(() => onLinked(), 2000);
      } else {
        setError(data.message || "Failed to link student record.");
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setClaiming(false);
    }
  }

  // ─── Success View ───
  if (successMessage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-dark">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green/10">
              <svg className="size-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark dark:text-white">Account Linked!</h3>
            <p className="mt-2 text-sm font-medium text-dark-5">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 1: Search Student ID ───
  if (step === "search") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-dark">
          {/* Header */}
          <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-lg font-black">1</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">Find Your Student Record</h3>
                <p className="mt-0.5 text-sm font-medium text-dark-5">Search by your Student ID to link your account.</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pt-5">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Enter your Student ID (e.g. 202200123)"
                  autoFocus
                  className="h-11 w-full rounded-lg border border-stroke bg-gray-1 pl-10 pr-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
                <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={searching || query.trim().length < 2}
                className="h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto px-6 py-4">
            {searching && (
              <div className="py-6 text-center text-sm font-medium text-dark-5">Searching...</div>
            )}

            {!searching && results.length === 0 && query.length >= 2 && (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-dark-5">
                  No unclaimed records found for &quot;{query}&quot;.
                </p>
                {totalUnclaimed !== null && totalUnclaimed === 0 ? (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠️ There are no student records in the system yet. Please ask the admin to import records first.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-dark-5">
                    Contact the Alumni Office if you can&apos;t find your record.
                    {totalUnclaimed !== null && ` (${totalUnclaimed} unclaimed records in system)`}
                  </p>
                )}
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-dark-5">
                  {results.length} record(s) found
                </p>
                {results.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full rounded-lg border p-3.5 text-left transition ${
                      selectedRecord?.id === record.id
                        ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20"
                        : "border-stroke bg-gray-1 hover:border-primary/40 dark:border-dark-3 dark:bg-dark-2"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-dark dark:text-white">{record.fullName}</p>
                        <p className="mt-0.5 text-xs font-semibold text-primary">ID: {record.studentId}</p>
                      </div>
                      {selectedRecord?.id === record.id && (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {record.batchYear && (
                      <p className="mt-1.5 text-xs font-medium text-dark-5">🎓 Batch {record.batchYear}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 rounded-lg border border-red/20 bg-red/[0.08] px-4 py-2.5 text-sm font-medium text-red">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-stroke px-6 py-4 dark:border-dark-3">
            <p className="text-xs font-medium text-dark-5">Step 1 of 2</p>
            <button
              type="button"
              disabled={!selectedRecord}
              onClick={proceedToDetails}
              className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next: Select College &amp; Department →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: College & Department Selection ───
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-dark">
        {/* Header */}
        <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-lg font-black">2</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark dark:text-white">Select Your College &amp; Department</h3>
              <p className="mt-0.5 text-sm font-medium text-dark-5">Choose where you belonged during your studies.</p>
            </div>
          </div>
        </div>

        {/* Selected record summary */}
        {selectedRecord && (
          <div className="mx-6 mt-5 rounded-lg border border-primary/20 bg-primary/[0.04] p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Selected Record</p>
            <p className="mt-1 text-sm font-bold text-dark dark:text-white">{selectedRecord.fullName}</p>
            <p className="text-xs font-medium text-dark-5">
              ID: {selectedRecord.studentId}
              {selectedRecord.batchYear ? ` · Batch ${selectedRecord.batchYear}` : ""}
            </p>
          </div>
        )}

        {/* Dropdowns */}
        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-dark dark:text-white">College</span>
            <select
              value={selectedCollegeId}
              onChange={(e) => {
                setSelectedCollegeId(e.target.value);
                setSelectedDepartmentId(""); // Reset department when college changes
              }}
              className="h-11 w-full rounded-lg border border-stroke bg-gray-1 px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="">Select your college</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-dark dark:text-white">Department / Program</span>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              disabled={!selectedCollegeId}
              className="h-11 w-full rounded-lg border border-stroke bg-gray-1 px-4 text-sm font-medium text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="">{selectedCollegeId ? "Select your department" : "Select a college first"}</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 rounded-lg border border-red/20 bg-red/[0.08] px-4 py-2.5 text-sm font-medium text-red">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stroke px-6 py-4 dark:border-dark-3">
          <button
            type="button"
            onClick={goBackToSearch}
            className="h-10 rounded-lg border border-stroke px-4 text-sm font-bold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-dark-5">Step 2 of 2</p>
            <button
              type="button"
              disabled={!selectedCollegeId || !selectedDepartmentId || claiming}
              onClick={handleClaim}
              className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {claiming ? "Linking..." : "Complete Linking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
