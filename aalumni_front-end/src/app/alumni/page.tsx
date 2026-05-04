import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import { IconActionLink } from "@/components/alumni-system/icon-action-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUsers } from "@/lib/api";
import type { AdminUser } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Records",
};

function surveyEmploymentStatus(user: AdminUser) {
  return (
    user.alumni?.latestSurvey?.employmentStatus ||
    user.alumni?.employmentStatus ||
    "Unspecified"
  );
}

function isEmployedStatus(status: string) {
  const normalized = status.toLowerCase();

  return (
    normalized.includes("employed") ||
    ["regular or permanent", "temporary", "casual", "contractual"].includes(
      normalized,
    )
  ) && !["unemployed", "never employed"].includes(normalized);
}

export default async function AlumniPage() {
  const response = await getAdminUsers(100);
  const alumniUsers = (response?.items ?? []).filter(
    (user) => user.hasAlumniRecord && user.alumni,
  );
  const employed = alumniUsers.filter(
    (user) => isEmployedStatus(surveyEmploymentStatus(user)),
  ).length;
  const selfEmployed = alumniUsers.filter(
    (user) => ["Self-employed", "Self-Employed"].includes(surveyEmploymentStatus(user)),
  ).length;
  const withTracer = alumniUsers.filter(
    (user) => user.alumni?.lastTracerSubmissionAt,
  ).length;
  const batchOptions = Array.from(
    new Set(
      alumniUsers
        .map((user) => user.alumni?.yearGraduated)
        .filter((year): year is number => typeof year === "number"),
    ),
  )
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      label: `Batch ${year}`,
      value: String(year),
    }));
  const employmentOptions = Array.from(
    new Set(
      alumniUsers
        .map((user) => surveyEmploymentStatus(user))
        .filter((status): status is string => Boolean(status)),
    ),
  )
    .sort()
    .map((status) => ({
      label: status,
      value: status,
    }));

  return (
    <>
      <FeatureHeader
        title="Alumni Records"
        description="Browse alumni profile details, education data, employment state, and tracer submission status."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Loaded alumni" value={alumniUsers.length} />
        <MetricCard label="Employed" value={employed} />
        <MetricCard label="Self-employed" value={selfEmployed} />
        <MetricCard label="Tracer submitted" value={withTracer} />
      </div>

      {alumniUsers.length ? (
        <Panel title="Alumni Directory">
          <JQueryDataTable
            order={[[2, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "batch",
                label: "Batch",
                column: 2,
                placeholder: "All batches",
                options: batchOptions,
              },
              {
                id: "employment",
                label: "Employment",
                column: 3,
                match: "exact",
                placeholder: "All employment",
                options: employmentOptions,
              },
              {
                id: "tracer",
                label: "Tracer",
                column: 4,
                placeholder: "All tracer records",
                options: [
                  { label: "Submitted", value: "Submitted" },
                  { label: "No tracer", value: "No tracer" },
                ],
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[220px] pl-5 sm:pl-7.5">
                    Alumni
                  </TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Graduated</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead className="pr-5 sm:pr-7.5">Tracer</TableHead>
                  <TableHead className="w-24 pr-5 sm:pr-7.5">Survey</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumniUsers.map((user) => {
                  const latestSurvey = user.alumni?.latestSurvey;
                  const employmentStatus = surveyEmploymentStatus(user);
                  const employmentDetail =
                    latestSurvey?.occupation ||
                    latestSurvey?.companyName ||
                    user.alumni?.jobTitle ||
                    user.alumni?.companyName ||
                    "";

                  return (
                    <TableRow key={user.id} className="text-base">
                      <TableCell className="pl-5 sm:pl-7.5">
                        <div className="font-semibold text-dark dark:text-white">
                          {user.alumni?.fullName || user.fullName}
                        </div>
                        <div className="text-sm font-medium text-dark-5">
                          {user.alumni?.studentNumber || user.schoolId || user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{user.alumni?.degreeProgram || user.alumni?.course || "Not set"}</div>
                        <div className="text-sm font-medium text-dark-5">
                          {user.alumni?.college || "No college"}
                        </div>
                      </TableCell>
                      <TableCell>{user.alumni?.yearGraduated || "Not set"}</TableCell>
                      <TableCell>
                        <StatusPill status={employmentStatus} />
                        {employmentDetail ? (
                          <div className="mt-1 text-sm font-medium text-dark-5">
                            {employmentDetail}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {latestSurvey?.submittedAt || user.alumni?.lastTracerSubmissionAt ? (
                          <div>
                            <div>Submitted</div>
                            <div className="text-sm font-medium text-dark-5">
                              {formatDate(latestSurvey?.submittedAt || user.alumni?.lastTracerSubmissionAt || "")}
                            </div>
                          </div>
                        ) : (
                          "No tracer"
                        )}
                      </TableCell>
                      <TableCell className="pr-5 sm:pr-7.5">
                        {latestSurvey ? (
                          <IconActionLink
                            href={`/gts/responses/${latestSurvey.id}`}
                            label={`View recent survey for ${user.alumni?.fullName || user.fullName}`}
                            icon="view"
                            variant="primary"
                          />
                        ) : (
                          <span className="text-sm font-medium text-dark-5">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No alumni records loaded" />
      )}
    </>
  );
}
