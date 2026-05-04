import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import { IconActionLink } from "@/components/alumni-system/icon-action-link";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminGtsResponses } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTS Responses",
};

export default async function GtsResponsesPage() {
  const response = await getAdminGtsResponses("limit=100");
  const rows = response?.items ?? [];
  const meta = response?.meta ?? {
    page: 1,
    limit: 100,
    total: rows.length,
    totalPages: 1,
  };
  const campaignResponses = rows.filter((row) => row.campaign).length;
  const directResponses = rows.length - campaignResponses;
  const surveyOptions = Array.from(
    new Set(
      rows.map((row) =>
        row.surveyTemplate ? row.surveyTemplate.title : "Legacy GTS",
      ),
    ),
  )
    .sort()
    .map((title) => ({
      label: title,
      value: title,
    }));
  const campaignOptions = Array.from(
    new Set(
      rows.map((row) => (row.campaign ? row.campaign.name : "Direct response")),
    ),
  )
    .sort()
    .map((name) => ({
      label: name,
      value: name,
    }));
  const visibleBatchOptions = Array.from(
    new Set(
      rows.map((row) =>
        row.targetBatchYear ? `Batch ${row.targetBatchYear}` : "Not set",
      ),
    ),
  )
    .sort()
    .map((batch) => ({
      label: batch,
      value: batch,
    }));
  const invitationOptions = Array.from(
    new Set(
      rows.map((row) =>
        row.invitation ? row.invitation.status : "No invitation",
      ),
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
        title="GTS Responses"
        description="Review submitted tracer survey forms from alumni campaigns and direct survey submissions."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total responses" value={meta.total} />
        <MetricCard label="Loaded responses" value={rows.length} />
        <MetricCard label="Campaign responses" value={campaignResponses} />
        <MetricCard label="Direct responses" value={directResponses} />
      </div>

      {rows.length ? (
        <Panel title="Submitted Responses">
          <JQueryDataTable
            order={[[5, "desc"]]}
            pageLength={25}
            filters={[
              {
                id: "survey",
                label: "Survey",
                column: 1,
                match: "exact",
                placeholder: "All surveys",
                options: surveyOptions,
              },
              {
                id: "campaign",
                label: "Campaign",
                column: 2,
                match: "exact",
                placeholder: "All campaigns",
                options: campaignOptions,
              },
              {
                id: "batch",
                label: "Batch",
                column: 3,
                match: "exact",
                placeholder: "All batches",
                options: visibleBatchOptions,
              },
              {
                id: "invitation",
                label: "Invitation",
                column: 4,
                placeholder: "All invitations",
                options: invitationOptions,
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[240px] pl-5 sm:pl-7.5">
                    Respondent
                  </TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Invitation</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-7.5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {row.respondent.name}
                      </div>
                      <div className="text-sm font-medium text-dark-5">
                        {row.respondent.email || "No email"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.surveyTemplate ? row.surveyTemplate.title : "Legacy GTS"}
                    </TableCell>
                    <TableCell>
                      {row.campaign ? row.campaign.name : "Direct response"}
                    </TableCell>
                    <TableCell>
                      {row.targetBatchYear ? `Batch ${row.targetBatchYear}` : "Not set"}
                    </TableCell>
                    <TableCell>
                      {row.invitation ? (
                        <div className="space-y-1">
                          <StatusPill status={row.invitation.status} />
                          <div className="text-xs font-medium text-dark-5">
                            {formatDate(row.invitation.completedAt)}
                          </div>
                        </div>
                      ) : (
                        "No invitation"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(row.submittedAt)}</TableCell>
                    <TableCell className="pr-5 text-right sm:pr-7.5">
                      <div className="flex justify-end">
                        <IconActionLink
                          href={`/gts/responses/${row.id}`}
                          label="View response"
                          icon="view"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState
          title="No GTS responses found"
          description="Submitted survey responses will appear here after alumni complete an invitation or direct tracer survey."
        />
      )}
    </>
  );
}
