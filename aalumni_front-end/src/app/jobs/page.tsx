import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import {
  CreateJobAction,
  JobRowActions,
} from "@/components/alumni-system/job-actions";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminJobs } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Postings",
};

export default async function JobsPage() {
  const response = await getAdminJobs(50);
  const jobs = response?.items ?? [];
  const active = jobs.filter((job) => job.isActive && !job.isExpired).length;
  const expired = jobs.filter((job) => job.isExpired).length;
  const typeOptions = Array.from(
    new Set(jobs.map((job) => job.employmentType || "Open role")),
  )
    .sort()
    .map((type) => ({ label: type, value: type }));
  const courseOptions = Array.from(
    new Set(jobs.map((job) => job.relatedCourse || "Any")),
  )
    .sort()
    .map((course) => ({ label: course, value: course }));

  return (
    <>
      <FeatureHeader
        title="Job Postings"
        description="Track career opportunities shared to alumni with company, deadline, course fit, and posting state."
        actions={<CreateJobAction />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Loaded jobs" value={jobs.length} />
        <MetricCard label="Active jobs" value={active} />
        <MetricCard label="Expired" value={expired} />
      </div>

      {jobs.length ? (
        <Panel title="Career Opportunities">
          <JQueryDataTable
            order={[[5, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "type",
                label: "Type",
                column: 2,
                placeholder: "All types",
                options: typeOptions,
              },
              {
                id: "course",
                label: "Course",
                column: 3,
                placeholder: "All courses",
                options: courseOptions,
              },
              {
                id: "status",
                label: "Status",
                column: 4,
                match: "exact",
                placeholder: "All statuses",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Closed", value: "Closed" },
                ],
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[260px] pl-5 sm:pl-7.5">
                    Position
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Related course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-7.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {job.title}
                      </div>
                      <div className="text-sm font-medium text-dark-5">
                        {job.location || "No location"}
                      </div>
                    </TableCell>
                    <TableCell>{job.companyName}</TableCell>
                    <TableCell>{job.employmentType || "Open role"}</TableCell>
                    <TableCell>{job.relatedCourse || "Any"}</TableCell>
                    <TableCell>
                      <StatusPill
                        status={job.isActive && !job.isExpired ? "Active" : "Closed"}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(job.deadline)}
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-7.5">
                      <JobRowActions job={job} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No job postings loaded" />
      )}
    </>
  );
}
