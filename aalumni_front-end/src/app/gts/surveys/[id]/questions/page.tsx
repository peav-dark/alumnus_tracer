import {
  FeatureHeader,
  MetricCard,
} from "@/components/alumni-system/ui";
import { SurveyQuestionBuilder } from "@/components/alumni-system/survey-builder-actions";
import { getAdminGtsSurveyQuestions } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Manage Survey Questions",
};

export default async function GtsSurveyQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surveyId = Number(id);

  if (!Number.isInteger(surveyId) || surveyId <= 0) {
    notFound();
  }

  const response = await getAdminGtsSurveyQuestions(surveyId);

  if (!response?.survey) {
    notFound();
  }

  const activeQuestions = response.items.filter((question) => question.isActive).length;

  return (
    <>
      <FeatureHeader
        title={response.survey.title}
        description="Manage the questions inside this survey. This questionnaire is what alumni receive when this survey is sent."
        actions={
          <Link
            href="/gts/surveys"
            className="inline-flex min-h-10 items-center rounded-md border border-stroke px-4 text-sm font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Back to Surveys
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Questions" value={response.items.length} />
        <MetricCard label="Active questions" value={activeQuestions} />
        <MetricCard
          label="Survey status"
          value={response.survey.isActive ? "Active" : "Inactive"}
        />
      </div>

      <SurveyQuestionBuilder survey={response.survey} />
    </>
  );
}
