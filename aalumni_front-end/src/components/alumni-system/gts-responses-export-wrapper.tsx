"use client";

import { useState } from "react";
import { GtsResponsesExportModal } from "@/components/alumni-system/gts-responses-export-modal";
import { Button } from "@/components/ui-elements/button";

interface ExportWrapperProps {
  surveyOptions: Array<{ label: string; value: string }>;
  campaignOptions: Array<{ label: string; value: string }>;
  batchOptions: Array<{ label: string; value: string }>;
  collegeOptions: Array<{ label: string; value: string }>;
  courseOptions: Array<{ label: string; value: string }>;
  children: React.ReactNode;
}

export function GtsResponsesExportWrapper({
  surveyOptions,
  campaignOptions,
  batchOptions,
  collegeOptions,
  courseOptions,
  children,
}: ExportWrapperProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      {/* Export Button */}
      <div className="mb-4 flex justify-end">
        <Button
          label="Export to Excel"
          onClick={() => setIsExportModalOpen(true)}
          variant="primary"
          size="small"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 16v-4m0 0V8m0 4h4m-4 0H8M4 12a8 8 0 1116 0 8 8 0 01-16 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Content */}
      {children}

      {/* Export Modal */}
      <GtsResponsesExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={{}}
        surveyOptions={surveyOptions}
        campaignOptions={campaignOptions}
        batchOptions={batchOptions}
        collegeOptions={collegeOptions}
        courseOptions={courseOptions}
      />
    </>
  );
}
