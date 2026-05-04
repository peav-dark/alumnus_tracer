import {
  FeatureHeader,
  MetricCard,
} from "@/components/alumni-system/ui";
import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { getAdminDashboard } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Hub",
};

export default async function AnalyticsPage() {
  const dashboard = await getAdminDashboard();
  const stats = dashboard?.stats;

  return (
    <>
      <FeatureHeader
        title="Analytics Hub"
        description="Alumni population, employment, registration, tracer response, and course-alignment analytics."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tracer responses" value={stats?.totalSurveyResponses ?? 0} />
        <MetricCard label="Survey employment rate" value={`${stats?.surveyEmploymentRate ?? stats?.employmentRate ?? 0}%`} />
        <MetricCard label="Survey course alignment" value={`${stats?.surveyAlignmentRate ?? stats?.alignmentRate ?? 0}%`} />
        <MetricCard label="Answered form fields" value={dashboard?.surveyAnalytics.answeredQuestionCount ?? 0} />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <PaymentsOverview className="col-span-12 xl:col-span-7" />
        <WeeksProfit className="col-span-12 xl:col-span-5" />
        <UsedDevices className="col-span-12" />
      </div>
    </>
  );
}
