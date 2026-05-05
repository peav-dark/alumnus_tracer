import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import { VerificationActions } from "@/components/alumni-system/user-actions";
import { StudentRecordsManager } from "@/components/alumni-system/student-records-manager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminVerification, getAdminStudentRecords } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Verification",
};

export default async function VerificationPage() {
  const [verification, studentRecordsData] = await Promise.all([
    getAdminVerification(),
    getAdminStudentRecords(100),
  ]);
  const pending = verification?.pending ?? [];

  return (
    <>
      <FeatureHeader
        title="Profile Verification"
        description="Queue for checking new registrations and manage imported student records for ID-based account linking."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Pending" value={verification?.counts.pending ?? 0} />
        <MetricCard label="Approved" value={verification?.counts.approved ?? 0} />
        <MetricCard label="Denied" value={verification?.counts.denied ?? 0} />
      </div>

      {verification ? (
        <Panel title="Pending Review">
          {pending.length ? (
            <JQueryDataTable
              order={[[3, "desc"]]}
              pageLength={10}
              filters={[
                {
                  id: "status",
                  label: "Status",
                  column: 2,
                  match: "exact",
                  placeholder: "All statuses",
                  options: [
                    { label: "Pending", value: "pending" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ],
                },
              ]}
            >
              <Table>
                <TableHeader>
                  <TableRow className="[&>th]:py-4">
                    <TableHead className="min-w-[220px] pl-5 sm:pl-7.5">
                      Applicant
                    </TableHead>
                    <TableHead>School ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="pr-5 text-right sm:pr-7.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((user) => (
                    <TableRow key={user.id} className="text-base">
                      <TableCell className="pl-5 sm:pl-7.5">
                        <div className="font-semibold text-dark dark:text-white">
                          {user.fullName}
                        </div>
                        <div className="text-sm font-medium text-dark-5">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{user.schoolId || "Not set"}</TableCell>
                      <TableCell>
                        <StatusPill status={user.accountStatus} />
                      </TableCell>
                      <TableCell>
                        {formatDate(user.dateRegistered)}
                      </TableCell>
                      <TableCell className="pr-5 sm:pr-7.5">
                        <VerificationActions userId={user.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </JQueryDataTable>
          ) : (
            <div className="p-7.5 font-medium">No pending registrations.</div>
          )}
        </Panel>
      ) : (
        <EmptyState title="Verification queue unavailable" />
      )}

      {/* ── Student Records Section ── */}
      <div className="mt-8">
        <Panel title="Student Records">
          <div className="p-5">
            <StudentRecordsManager
              initialRecords={studentRecordsData?.items ?? []}
              initialMeta={{
                total: studentRecordsData?.meta.total ?? 0,
                totalUnclaimed: studentRecordsData?.meta.totalUnclaimed ?? 0,
                totalClaimed: studentRecordsData?.meta.totalClaimed ?? 0,
              }}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}

