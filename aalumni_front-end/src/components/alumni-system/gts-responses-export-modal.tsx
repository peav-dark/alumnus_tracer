"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui-elements/button";
import { CloseIcon } from "@/assets/icons";
import { previewGtsResponsesExport } from "@/lib/api-client";

interface ExportFilters {
  surveyId?: number;
  campaignId?: number;
  batchYear?: string;
  college?: string;
  course?: string;
  q?: string;
}

interface PreviewData {
  items: Array<{
    id?: number;
    name?: string;
    emailAddress?: string;
    college?: string;
    course?: string;
  }>;
  totalCount: number;
  previewCount: number;
}

interface GtsResponsesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExportFilters;
  surveyOptions: Array<{ label: string; value: string }>;
  campaignOptions: Array<{ label: string; value: string }>;
  batchOptions: Array<{ label: string; value: string }>;
  collegeOptions: Array<{ label: string; value: string }>;
  courseOptions: Array<{ label: string; value: string }>;
}

export function GtsResponsesExportModal({
  isOpen,
  onClose,
  filters,
  surveyOptions,
  campaignOptions,
  batchOptions,
  collegeOptions,
  courseOptions,
}: GtsResponsesExportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [exportFilters, setExportFilters] = useState<ExportFilters>(filters);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, isOpen]);

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const params = new URLSearchParams();
      if (exportFilters.surveyId) params.append("surveyId", String(exportFilters.surveyId));
      if (exportFilters.campaignId) params.append("campaignId", String(exportFilters.campaignId));
      if (exportFilters.batchYear) params.append("batchYear", exportFilters.batchYear);
      if (exportFilters.college) params.append("college", exportFilters.college);
      if (exportFilters.course) params.append("course", exportFilters.course);
      if (exportFilters.q) params.append("q", exportFilters.q);

      const data = await previewGtsResponsesExport(params.toString());
      if (data) {
        setPreviewData(data);
      } else {
        alert("Failed to load preview. Please try again.");
      }
    } catch (error) {
      console.error("Preview error:", error);
      alert("An error occurred while loading preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportFilters.surveyId) params.append("surveyId", String(exportFilters.surveyId));
      if (exportFilters.campaignId) params.append("campaignId", String(exportFilters.campaignId));
      if (exportFilters.batchYear) params.append("batchYear", exportFilters.batchYear);
      if (exportFilters.college) params.append("college", exportFilters.college);
      if (exportFilters.course) params.append("course", exportFilters.course);
      if (exportFilters.q) params.append("q", exportFilters.q);

      const response = await fetch(`/api/admin/gts/responses/export?${params}`, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gts-responses-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        onClose();
      } else {
        alert("Failed to export responses. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("An error occurred while exporting responses.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Export GTS Responses"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-dark-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-7 p-6 dark:border-dark-3">
          <h2 className="text-lg font-bold text-dark dark:text-white">Export GTS Responses</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full transition hover:bg-gray-1 dark:hover:bg-dark-2"
            aria-label="Close"
          >
            <CloseIcon className="size-5 text-dark dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {!previewData ? (
            <>
              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-white mb-2">
                  Batch Year
                </label>
                <select
                  value={exportFilters.batchYear || ""}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, batchYear: e.target.value })
                  }
                  className="w-full rounded border border-dark-7 bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-1 dark:text-white"
                >
                  <option value="">All batches</option>
                  {batchOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* College Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-white mb-2">
                  College
                </label>
                <select
                  value={exportFilters.college || ""}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, college: e.target.value })
                  }
                  className="w-full rounded border border-dark-7 bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-1 dark:text-white"
                >
                  <option value="">All colleges</option>
                  {collegeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course/Program Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-white mb-2">
                  Course / Program
                </label>
                <select
                  value={exportFilters.course || ""}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, course: e.target.value })
                  }
                  className="w-full rounded border border-dark-7 bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-1 dark:text-white"
                >
                  <option value="">All programs</option>
                  {courseOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Survey Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-white mb-2">
                  Survey Template
                </label>
                <select
                  value={exportFilters.surveyId || ""}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      surveyId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded border border-dark-7 bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-1 dark:text-white"
                >
                  <option value="">All surveys</option>
                  {surveyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-white mb-2">
                  Campaign
                </label>
                <select
                  value={exportFilters.campaignId || ""}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      campaignId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded border border-dark-7 bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-1 dark:text-white"
                >
                  <option value="">All campaigns</option>
                  {campaignOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Preview Information */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-dark dark:text-white">
                  Preview showing <span className="font-semibold">{previewData.previewCount}</span> of{" "}
                  <span className="font-semibold">{previewData.totalCount}</span> total responses
                </p>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded border border-dark-7 dark:border-dark-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-7 bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
                      <th className="px-4 py-2 text-left font-semibold text-dark dark:text-white">Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-dark dark:text-white">Email</th>
                      <th className="px-4 py-2 text-left font-semibold text-dark dark:text-white">College</th>
                      <th className="px-4 py-2 text-left font-semibold text-dark dark:text-white">Course</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.items.length > 0 ? (
                      previewData.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-dark-7 dark:border-dark-3 hover:bg-gray-1 dark:hover:bg-dark-2">
                          <td className="px-4 py-2 text-dark dark:text-white">{item.name || "-"}</td>
                          <td className="px-4 py-2 text-dark dark:text-white">{item.emailAddress || "-"}</td>
                          <td className="px-4 py-2 text-dark dark:text-white">{item.college || "-"}</td>
                          <td className="px-4 py-2 text-dark dark:text-white">{item.course || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-dark dark:text-white">
                          No responses found with the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-dark-7 p-6 dark:border-dark-3">
          <button
            type="button"
            onClick={() => {
              if (previewData) {
                setPreviewData(null);
              } else {
                onClose();
              }
            }}
            disabled={isExporting || isPreviewing}
            className="px-6 py-2 text-sm font-medium text-dark transition hover:bg-gray-1 disabled:opacity-50 dark:text-white dark:hover:bg-dark-2"
          >
            {previewData ? "Back" : "Cancel"}
          </button>

          {!previewData && (
            <Button
              label={isPreviewing ? "Loading Preview..." : "Preview"}
              onClick={handlePreview}
              disabled={isPreviewing || isExporting}
              variant="secondary"
              size="small"
            />
          )}

          {previewData ? (
            <Button
              label={isExporting ? "Exporting..." : "Download"}
              onClick={handleExport}
              disabled={isExporting || isPreviewing}
              variant="primary"
              size="small"
            />
          ) : (
            <Button
              label={isExporting ? "Exporting..." : "Export to Excel"}
              onClick={handleExport}
              disabled={isExporting || isPreviewing}
              variant="primary"
              size="small"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
