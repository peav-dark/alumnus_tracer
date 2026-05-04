import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import { CampaignTableActions } from "@/components/alumni-system/campaign-table-actions";
import { CampaignRowActions } from "@/components/alumni-system/campaign-row-actions";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignLaunchPanel } from "@/components/alumni-system/campaign-actions";
import {
  getAdminGtsCampaigns,
  getAdminGtsSurveys,
  getAdminQrRegistration,
} from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTS Campaigns",
};

export default async function GtsCampaignsPage() {
  const [response, qrRegistration, surveysResponse] = await Promise.all([
    getAdminGtsCampaigns(),
    getAdminQrRegistration(),
    getAdminGtsSurveys(),
  ]);
  const campaigns = response?.items ?? [];
  const batches = qrRegistration?.items ?? [];
  const surveys = surveysResponse?.items ?? [];
  const openBatches = batches.filter((batch) => batch.isOpen).length;
  const sendableSurveys = surveys.filter(
    (survey) => survey.isActive && survey.questionCount > 0,
  ).length;
  const invitations = campaigns.reduce(
    (sum, campaign) => sum + campaign.invitations.total,
    0,
  );
  const completed = campaigns.reduce(
    (sum, campaign) => sum + campaign.invitations.completed,
    0,
  );
  const surveyOptions = Array.from(
    new Set(campaigns.map((campaign) => campaign.surveyTemplate.title)),
  )
    .sort()
    .map((title) => ({
      label: title,
      value: title,
    }));
  const batchOptions = [...batches]
    .sort((a, b) => b.batchYear - a.batchYear)
    .map((batch) => ({
      label: `Batch ${batch.batchYear}`,
      value: `Batch ${batch.batchYear}`,
    }));
  const statusOptions = Array.from(
    new Set(campaigns.map((campaign) => campaign.status)),
  )
    .sort()
    .map((status) => ({
      label: status,
      value: status,
    }));

  return (
    <>
      <FeatureHeader
        title="GTS Campaigns"
        description="Monitor tracer study email campaigns, target cohorts, delivery state, and completion counts."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Campaigns" value={campaigns.length} />
        <MetricCard label="Invitations" value={invitations} />
        <MetricCard label="Completed" value={completed} />
        <MetricCard
          label="QR batches"
          value={batches.length}
          detail={`${openBatches} open`}
        />
        <MetricCard
          label="Sendable surveys"
          value={sendableSurveys}
          detail={`${surveys.length} total`}
        />
      </div>

      <div className="mb-6">
        <Panel title="Launch Survey Campaign">
          <CampaignLaunchPanel surveys={surveys} batches={batches} />
        </Panel>
      </div>

      <div className="mb-6">
        <Panel title="Available Registration Batches">
          {batches.length ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7.5 xl:grid-cols-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-[10px] border border-stroke p-4 dark:border-dark-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-dark-5">
                        Batch
                      </p>
                      <strong className="mt-1 block text-2xl font-bold text-dark dark:text-white">
                        {batch.batchYear}
                      </strong>
                    </div>
                    <StatusPill status={batch.isOpen ? "Open" : "Closed"} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-dark-5">
                    Created {formatDate(batch.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-7.5 font-medium text-dark-5">
              No QR registration batches loaded.
            </div>
          )}
        </Panel>
      </div>

      {campaigns.length ? (
        <Panel title="Survey Campaigns">
          <JQueryDataTable
            order={[[7, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "survey",
                label: "Survey",
                column: 1,
                placeholder: "All surveys",
                options: surveyOptions,
              },
              {
                id: "batch",
                label: "Batch",
                column: 2,
                placeholder: "All batches",
                options: batchOptions,
              },
              {
                id: "status",
                label: "Status",
                column: 5,
                match: "exact",
                placeholder: "All statuses",
                options: statusOptions,
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[260px] pl-5 sm:pl-7.5">
                    Campaign
                  </TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Target Batch</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Invitations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Send Date</TableHead>
                  <TableHead className="pr-5 sm:pr-7.5">Created</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-7.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {campaign.name}
                      </div>
                      <div className="text-sm font-medium text-dark-5">
                        {campaign.emailSubject}
                      </div>
                    </TableCell>
                    <TableCell>{campaign.surveyTemplate.title}</TableCell>
                    <TableCell>
                      {campaign.targetGraduationYears.length
                        ? campaign.targetGraduationYears
                            .map((batchYear) => `Batch ${batchYear}`)
                            .join(", ")
                        : "All batches"}
                    </TableCell>
                    <TableCell>
                      {campaign.targetCollege || "All colleges"}
                      <div className="text-sm font-medium text-dark-5">
                        {campaign.targetCourse || "All courses"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.invitations.completed}/{campaign.invitations.total}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start">
                        <StatusPill status={campaign.status} />
                        <CampaignRowActions
                          campaignId={campaign.id}
                          campaignName={campaign.name}
                          status={campaign.status}
                          completedCount={campaign.invitations.completed}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.scheduledSendAt
                        ? formatDate(campaign.scheduledSendAt)
                        : campaign.sentAt
                          ? formatDate(campaign.sentAt)
                          : "Not set"}
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-7.5">
                      {formatDate(campaign.createdAt)}
                    </TableCell>
                    <TableCell className="pr-5 text-right sm:pr-7.5">
                      <CampaignTableActions
                        campaign={campaign}
                        surveys={surveys}
                        batches={batches}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No GTS campaigns loaded" />
      )}
    </>
  );
}
