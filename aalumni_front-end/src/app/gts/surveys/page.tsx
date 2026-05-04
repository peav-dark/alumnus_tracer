import {
  FeatureHeader,
  MetricCard,
} from "@/components/alumni-system/ui";
import {
  CreateSurveyTemplateAction,
  SurveyBuilderWorkspace,
} from "@/components/alumni-system/survey-builder-actions";
import { getAdminGtsSurveys } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTS Survey Builder",
};

export default async function GtsSurveysPage() {
  const response = await getAdminGtsSurveys();
  const surveys = response?.items ?? [];
  const active = surveys.filter((survey) => survey.isActive).length;
  const questions = surveys.reduce((sum, survey) => sum + survey.questionCount, 0);

  return (
    <>
      <FeatureHeader
        title="GTS Survey Builder"
        description="Organize Graduate Tracer Study templates, active forms, question banks, and linked campaign usage."
        actions={<CreateSurveyTemplateAction />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Survey templates" value={surveys.length} />
        <MetricCard label="Active templates" value={active} />
        <MetricCard label="Questions" value={questions} />
      </div>

      <SurveyBuilderWorkspace surveys={surveys} />
    </>
  );
}
