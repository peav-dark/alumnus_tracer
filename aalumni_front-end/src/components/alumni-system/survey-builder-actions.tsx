"use client";

import {
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
import type {
  SurveyQuestion,
  SurveyQuestionsResponse,
  SurveyTemplate,
} from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type ApiResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
};

const inputTypes = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "select",
  "date",
  "repeater",
];

export function CreateSurveyTemplateAction() {
  return (
    <SurveyTemplateDialog
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          <ActionIcon name="plus" />
          <span>Add Survey</span>
        </span>
      }
    />
  );
}

export function SurveyTemplateRowActions({
  survey,
}: {
  survey: SurveyTemplate;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteTemplate = async () => {
    if (!window.confirm(`Delete "${survey.title}" and all of its questions?`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/gts/surveys/${survey.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to delete survey.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to reach the survey endpoint.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <SurveyTemplateDialog
        survey={survey}
        trigger={<IconButton label="Edit survey template" icon="edit" />}
      />
      <button
        type="button"
        title="Delete survey template"
        onClick={deleteTemplate}
        disabled={deleting}
        className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="sr-only">
          {deleting ? "Deleting survey template" : "Delete survey template"}
        </span>
        {deleting ? <SpinnerIcon /> : <ActionIcon name="trash" />}
      </button>
      {error && <p className="text-xs font-medium text-red">{error}</p>}
    </>
  );
}

export function SurveyBuilderWorkspace({ surveys }: { surveys: SurveyTemplate[] }) {
  if (surveys.length === 0) {
    return (
      <Panel title="Survey Templates">
        <div className="p-5 sm:p-7.5">
          <div className="flex flex-col gap-4 rounded-[10px] border border-dashed border-stroke p-6 dark:border-dark-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-dark dark:text-white">
                Create a survey first
              </h3>
              <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
                After creating a survey, open it with Manage Questions to build the questionnaire inside it.
              </p>
            </div>
            <SurveyTemplateDialog
              trigger={
                <IconButton
                  label="Create survey template"
                  icon="plus"
                  variant="filled"
                />
              }
            />
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Survey Templates">
      <JQueryDataTable
        order={[[4, "desc"]]}
        pageLength={10}
        filters={[
          {
            id: "status",
            label: "Status",
            column: 3,
            match: "exact",
            placeholder: "All statuses",
            options: [
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ],
          },
        ]}
      >
        <Table>
          <TableHeader>
            <TableRow className="[&>th]:py-4">
              <TableHead className="min-w-[280px] pl-5 sm:pl-7.5">
                Survey
              </TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="pr-5 text-right sm:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id} className="text-base">
                <TableCell className="pl-5 sm:pl-7.5">
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="font-semibold text-dark dark:text-white">
                        {survey.title}
                      </div>
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm font-medium text-dark-5">
                        {survey.description || "No description"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{survey.questionCount}</TableCell>
                <TableCell>{survey.campaignCount}</TableCell>
                <TableCell>
                  <StatusPill status={survey.isActive ? "Active" : "Inactive"} />
                </TableCell>
                <TableCell>{formatDate(survey.createdAt)}</TableCell>
                <TableCell className="pr-5 sm:pr-7.5">
                  <div className="flex items-center justify-end gap-2">
                    <IconActionLink
                      href={`/gts/surveys/${survey.id}/questions`}
                      label="Manage questions"
                      icon="questions"
                      variant="primary"
                    />
                    <IconActionLink
                      href={`/gts/responses?surveyId=${survey.id}`}
                      label="View responses"
                      icon="responses"
                    />
                    <SurveyTemplateRowActions survey={survey} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </JQueryDataTable>
    </Panel>
  );
}

export function SurveyQuestionBuilder({
  survey,
  embedded = false,
}: {
  survey: SurveyTemplate;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQuestions = async (templateId: number) => {
    if (!templateId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/gts/surveys/${templateId}/questions`,
      );
      const body = (await response.json().catch(() => ({}))) as
        | SurveyQuestionsResponse
        | ApiResponse;

      if (!response.ok) {
        setError(
          (body as ApiResponse).message ||
            (body as ApiResponse).error ||
            "Unable to load questions.",
        );
        setQuestions([]);
        return;
      }

      setQuestions((body as SurveyQuestionsResponse).items ?? []);
    } catch {
      setError("Unable to reach the survey question endpoint.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuestions([]);
    setMessage("");
    setError("");
    void loadQuestions(survey.id);
  }, [survey.id]);

  const importDefaults = async () => {
    setWorking("import");
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/gts/surveys/${survey.id}/questions/import-defaults`,
        { method: "POST" },
      );
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(
          body.message || body.error || "Unable to import default questions.",
        );
        return;
      }

      setMessage(body.message || "Default questions imported.");
      await loadQuestions(survey.id);
      router.refresh();
    } catch {
      setError("Unable to reach the default-question endpoint.");
    } finally {
      setWorking(null);
    }
  };

  const onQuestionSaved = async () => {
    await loadQuestions(survey.id);
    router.refresh();
  };

  const builderContent = (
      <div className="space-y-5 p-5 sm:p-7.5">
        {embedded && (
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Questions for {survey.title}
            </h3>
            <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
              These questions are inside this survey. When you send the survey to alumni, this questionnaire is what they receive.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-2.5 block font-medium text-dark dark:text-white">
              Survey
            </span>
            <div className="rounded-lg border border-stroke px-5 py-3 dark:border-dark-3">
              <p className="font-semibold text-dark dark:text-white">{survey.title}</p>
              <p className="mt-1 text-sm font-medium text-dark-5">
                {survey.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              title="Preview form"
              onClick={() => setPreviewOpen(true)}
              disabled={questions.length === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              <ActionIcon name="eye" />
              <span>Preview Form</span>
            </button>
            <button
              type="button"
              title="Import default questionnaire"
              onClick={importDefaults}
              disabled={working !== null || questions.length > 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary px-3 text-sm font-medium text-primary transition hover:bg-primary/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {working === "import" ? (
                <SpinnerIcon />
              ) : (
                <ActionIcon name="download" />
              )}
              <span>Import Defaults</span>
            </button>
            <SurveyQuestionDialog
              templateId={survey.id}
              onSaved={onQuestionSaved}
              trigger={
                <IconButton label="Add question" icon="plus" variant="filled" />
              }
            />
          </div>
        </div>

        {message && (
          <p className="rounded-lg bg-green/[0.08] px-4 py-3 text-sm font-medium text-green">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-8 font-medium">
            <SpinnerIcon />
            Loading questions...
          </div>
        ) : questions.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[360px]">Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id} className="text-base">
                    <TableCell>
                      <div className="font-semibold text-dark dark:text-white">
                        {question.questionText}
                      </div>
                      <p className="mt-1 text-sm font-medium text-dark-5">
                        Sort {question.sortOrder}
                      </p>
                    </TableCell>
                    <TableCell className="capitalize">{question.inputType}</TableCell>
                    <TableCell>{question.section || "General"}</TableCell>
                    <TableCell>
                      <StatusPill
                        status={question.isActive ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell>
                      <SurveyQuestionRowActions
                        question={question}
                        templateId={survey.id}
                        onSaved={onQuestionSaved}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-stroke p-7.5 dark:border-dark-3">
            <h3 className="text-lg font-bold text-dark dark:text-white">
              No questions yet
            </h3>
            <p className="mt-2 font-medium text-dark-5 dark:text-dark-6">
              Add a question or import the default tracer questionnaire.
            </p>
          </div>
        )}

        {previewOpen &&
          createPortal(
            <ModalFrame
              title={`${survey.title} Preview`}
              description="Review the full survey form."
              onClose={() => setPreviewOpen(false)}
              size="wide"
            >
              <SurveyFormPreview survey={survey} questions={questions} />
            </ModalFrame>,
            document.body,
          )}
      </div>
  );

  return embedded ? (
    <div className="border-t border-stroke dark:border-dark-3">
      {builderContent}
    </div>
  ) : (
    <Panel title="Question Builder">{builderContent}</Panel>
  );
}

function SurveyQuestionRowActions({
  question,
  templateId,
  onSaved,
}: {
  question: SurveyQuestion;
  templateId: number;
  onSaved: () => void | Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteQuestion = async () => {
    if (!window.confirm("Delete this survey question?")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/gts/questions/${question.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to delete question.");
        return;
      }

      await onSaved();
    } catch {
      setError("Unable to reach the question endpoint.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <SurveyQuestionDialog
        question={question}
        templateId={templateId}
        onSaved={onSaved}
        trigger={<IconButton label="Edit question" icon="edit" />}
      />
      <button
        type="button"
        title="Delete question"
        onClick={deleteQuestion}
        disabled={deleting}
        className="p-1.5 text-red transition hover:text-red/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="sr-only">
          {deleting ? "Deleting question" : "Delete question"}
        </span>
        {deleting ? <SpinnerIcon /> : <ActionIcon name="trash" />}
      </button>
      {error && <p className="text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

function SurveyTemplateDialog({
  survey,
  trigger,
}: {
  survey?: SurveyTemplate;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: survey?.title ?? "",
    description: survey?.description ?? "",
    isActive: survey?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(survey);

  const openDialog = () => {
    setForm({
      title: survey?.title ?? "",
      description: survey?.description ?? "",
      isActive: survey?.isActive ?? true,
    });
    setError("");
    setFieldErrors({});
    setOpen(true);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(
        isEditing ? `/api/admin/gts/surveys/${survey?.id}` : "/api/admin/gts/surveys",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to save survey.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Unable to reach the survey endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openDialog} className="contents">
        {trigger}
      </button>

      {open &&
        createPortal(
          <ModalFrame
            title={isEditing ? "Edit Survey Template" : "Create Survey Template"}
            description="Configure the tracer survey template details and publishing state."
            onClose={() => setOpen(false)}
          >
            <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
              <Field
                label="Title"
                value={form.title}
                error={fieldErrors.title}
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
              />

              <TextArea
                label="Description"
                value={form.description}
                onChange={(value) =>
                  setForm((current) => ({ ...current, description: value }))
                }
              />

              <StatusSelect
                value={form.isActive}
                onChange={(value) =>
                  setForm((current) => ({ ...current, isActive: value }))
                }
              />

              <DialogFooter
                error={error}
                saving={saving}
                onCancel={() => setOpen(false)}
              />
            </form>
          </ModalFrame>,
          document.body,
        )}
    </>
  );
}

function SurveyQuestionDialog({
  question,
  templateId,
  onSaved,
  trigger,
}: {
  question?: SurveyQuestion;
  templateId: number;
  onSaved: () => void | Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    questionText: question?.questionText ?? "",
    inputType: question?.inputType ?? "text",
    section: question?.section ?? "General",
    optionsText: optionsToText(question?.inputType ?? "text", question?.options),
    sortOrder: String(question?.sortOrder ?? 0),
    isActive: question?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(question);

  const openDialog = () => {
    setForm({
      questionText: question?.questionText ?? "",
      inputType: question?.inputType ?? "text",
      section: question?.section ?? "General",
      optionsText: optionsToText(question?.inputType ?? "text", question?.options),
      sortOrder: String(question?.sortOrder ?? 0),
      isActive: question?.isActive ?? true,
    });
    setError("");
    setFieldErrors({});
    setOpen(true);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/gts/questions/${question?.id}`
          : `/api/admin/gts/surveys/${templateId}/questions`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            sortOrder: Number(form.sortOrder),
          }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(body.message || body.error || "Unable to save question.");
        setFieldErrors(body.errors ?? {});
        return;
      }

      setOpen(false);
      await onSaved();
    } catch {
      setError("Unable to reach the survey question endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openDialog} className="contents">
        {trigger}
      </button>

      {open &&
        createPortal(
          <ModalFrame
            title={isEditing ? "Edit Question" : "Add Question"}
            description="Build a tracer survey question with type, section, order, and choices."
            onClose={() => setOpen(false)}
          >
            <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
              <TextArea
                label="Question Text"
                value={form.questionText}
                error={fieldErrors.questionText}
                rows={3}
                onChange={(value) =>
                  setForm((current) => ({ ...current, questionText: value }))
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2.5 block font-medium text-dark dark:text-white">
                    Input Type
                  </span>
                  <select
                    value={form.inputType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        inputType: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                  >
                    {inputTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.inputType && (
                    <span className="mt-1 block text-sm font-medium text-red">
                      {fieldErrors.inputType}
                    </span>
                  )}
                </label>

                <Field
                  label="Section"
                  value={form.section}
                  error={fieldErrors.section}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, section: value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Sort Order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, sortOrder: value }))
                  }
                />
                <StatusSelect
                  value={form.isActive}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>

              <TextArea
                label={form.inputType === "repeater" ? "Columns" : "Choices"}
                value={form.optionsText}
                rows={5}
                onChange={(value) =>
                  setForm((current) => ({ ...current, optionsText: value }))
                }
              />
              {choiceHelpText(form.inputType) && (
                <p className="-mt-2 text-sm font-medium text-dark-5 dark:text-dark-6">
                  {choiceHelpText(form.inputType)}
                </p>
              )}

              <DialogFooter
                error={error}
                saving={saving}
                onCancel={() => setOpen(false)}
              />
            </form>
          </ModalFrame>,
          document.body,
        )}
    </>
  );
}

function ModalFrame({
  title,
  description,
  onClose,
  size = "default",
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  size?: "default" | "wide";
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={
          size === "wide"
            ? "my-auto max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark"
            : "my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[10px] bg-white shadow-2 dark:bg-gray-dark"
        }
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              {title}
            </h2>
            <p className="mt-1 font-medium text-dark-5 dark:text-dark-6">
              {description}
            </p>
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            <span className="sr-only">Close</span>
            <ActionIcon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DialogFooter({
  error,
  saving,
  onCancel,
}: {
  error: string;
  saving: boolean;
  onCancel: () => void;
}) {
  return (
    <>
      {error && (
        <p className="rounded-lg bg-red/[0.08] px-4 py-3 text-sm font-medium text-red">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-stroke bg-white px-5 pt-4 dark:border-dark-3 dark:bg-gray-dark sm:-mx-6 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  error,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && (
        <span className="mt-1 block text-sm font-medium text-red">{error}</span>
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  error,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      />
      {error && (
        <span className="mt-1 block text-sm font-medium text-red">{error}</span>
      )}
    </label>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block font-medium text-dark dark:text-white">
        Status
      </span>
      <select
        value={value ? "active" : "inactive"}
        onChange={(event) => onChange(event.target.value === "active")}
        className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </label>
  );
}

function SurveyFormPreview({
  survey,
  questions,
}: {
  survey: SurveyTemplate;
  questions: SurveyQuestion[];
}) {
  const sections = groupQuestionsBySection(questions);

  return (
    <div className="space-y-6 p-5 sm:p-6">
      <div className="rounded-[10px] border border-stroke p-5 dark:border-dark-3">
        <h3 className="text-2xl font-bold text-dark dark:text-white">
          {survey.title}
        </h3>
        {survey.description && (
          <p className="mt-2 font-medium text-dark-5 dark:text-dark-6">
            {survey.description}
          </p>
        )}
      </div>

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-[10px] border border-stroke p-5 dark:border-dark-3"
        >
          <h4 className="text-lg font-bold text-dark dark:text-white">
            {section.title}
          </h4>
          <div className="mt-5 space-y-5">
            {section.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <label
                    htmlFor={`preview-question-${question.id}`}
                    className="font-semibold text-dark dark:text-white"
                  >
                    {question.questionText}
                  </label>
                  {!question.isActive && (
                    <span className="w-fit rounded-full bg-red/[0.08] px-3 py-1 text-xs font-semibold text-red">
                      Inactive
                    </span>
                  )}
                </div>
                <QuestionPreviewField question={question} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function QuestionPreviewField({ question }: { question: SurveyQuestion }) {
  const options = optionLabels(question.options);
  const fieldId = `preview-question-${question.id}`;

  if (question.inputType === "textarea") {
    return (
      <textarea
        id={fieldId}
        disabled
        rows={4}
        className="w-full rounded-lg border border-stroke bg-gray-2 px-4 py-3 dark:border-dark-3 dark:bg-dark-2"
      />
    );
  }

  if (question.inputType === "radio" || question.inputType === "checkbox") {
    const type = question.inputType;

    return (
      <div id={fieldId} className="grid gap-2 sm:grid-cols-2">
        {(options.length ? options : ["Option"]).map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 rounded-lg border border-stroke px-4 py-3 font-medium text-dark-5 dark:border-dark-3 dark:text-dark-6"
          >
            <input type={type} disabled className="size-4" />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.inputType === "select") {
    return (
      <select
        id={fieldId}
        disabled
        className="w-full rounded-lg border border-stroke bg-gray-2 px-4 py-3 dark:border-dark-3 dark:bg-dark-2"
      >
        <option>Select an answer</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (question.inputType === "date") {
    return (
      <input
        id={fieldId}
        type="date"
        disabled
        className="w-full rounded-lg border border-stroke bg-gray-2 px-4 py-3 dark:border-dark-3 dark:bg-dark-2"
      />
    );
  }

  if (question.inputType === "repeater") {
    const columns = repeaterColumns(question.options);

    return (
      <div id={fieldId} className="overflow-x-auto rounded-lg border border-stroke dark:border-dark-3">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-dark-3 dark:bg-dark-2">
              {(columns.length ? columns : [{ key: "field", label: "Field", type: "text" }]).map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {(columns.length ? columns : [{ key: "field", label: "Field", type: "text" }]).map((column) => (
                <td key={column.key} className="px-4 py-3">
                  <input
                    type={column.type === "date" ? "date" : "text"}
                    disabled
                    className="w-full rounded-md border border-stroke bg-gray-2 px-3 py-2 dark:border-dark-3 dark:bg-dark-2"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <input
      id={fieldId}
      type="text"
      disabled
      className="w-full rounded-lg border border-stroke bg-gray-2 px-4 py-3 dark:border-dark-3 dark:bg-dark-2"
    />
  );
}

function IconButton({
  label,
  icon,
  variant = "outline",
}: {
  label: string;
  icon: "plus" | "edit";
  variant?: "outline" | "filled";
}) {
  const className =
    variant === "filled"
      ? "inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-opacity-90"
      : "p-1.5 text-primary transition hover:text-primary/70";

  return (
    <span
      title={label}
      className={className}
    >
      <span className="sr-only">{label}</span>
      <ActionIcon name={icon} />
      {variant === "filled" && <span aria-hidden="true">{label}</span>}
    </span>
  );
}

function ActionIcon({
  name,
}: {
  name: "plus" | "edit" | "trash" | "x" | "download" | "eye";
}) {
  if (name === "plus") {
    return (
      <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M11.25 4.167 15.833 8.75m-10 5.417 1.25-4.584 6.875-6.875a1.768 1.768 0 0 1 2.5 2.5L9.583 12.083 5 13.333l.833.834Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4.167 5.833h11.666M8.333 8.333v5M11.667 8.333v5M5.833 5.833l.834 10h6.666l.834-10M8.333 5.833V4.167h3.334v1.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3.333v8.334m0 0 3.333-3.334M10 11.667 6.667 8.333M4.167 15h11.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2.5 10s2.5-4.583 7.5-4.583S17.5 10 17.5 10s-2.5 4.583-7.5 4.583S2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <span
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}

function optionsToText(
  inputType: string,
  options: SurveyQuestion["options"] | undefined,
) {
  if (!Array.isArray(options)) return "";

  if (inputType !== "repeater") {
    return options.map((option) => String(option)).join("\n");
  }

  return options
    .map((option) => {
      if (!option || typeof option !== "object" || Array.isArray(option)) {
        return "";
      }

      const key = String(option.key ?? "");
      const label = String(option.label ?? "");
      const type = String(option.type ?? "text");
      const choices = Array.isArray(option.options)
        ? option.options.map((choice) => String(choice)).join(", ")
        : "";

      return [key, label, type, choices].filter(Boolean).join("|");
    })
    .filter(Boolean)
    .join("\n");
}

function groupQuestionsBySection(questions: SurveyQuestion[]) {
  const grouped = new Map<string, SurveyQuestion[]>();

  questions.forEach((question) => {
    const section = question.section?.trim() || "General";
    grouped.set(section, [...(grouped.get(section) ?? []), question]);
  });

  return Array.from(grouped.entries()).map(([title, sectionQuestions]) => ({
    title,
    questions: sectionQuestions,
  }));
}

function optionLabels(options: SurveyQuestion["options"]) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => {
      if (typeof option === "string") {
        return option;
      }

      if (option && typeof option === "object") {
        return String(option.label ?? option.key ?? "");
      }

      return "";
    })
    .filter(Boolean);
}

function repeaterColumns(options: SurveyQuestion["options"]) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => {
      if (!option || typeof option !== "object" || Array.isArray(option)) {
        return null;
      }

      const key = String(option.key ?? "");
      const label = String(option.label ?? key);
      const type = String(option.type ?? "text");

      if (!key) {
        return null;
      }

      return { key, label, type };
    })
    .filter((column): column is { key: string; label: string; type: string } =>
      Boolean(column),
    );
}

function choiceHelpText(inputType: string) {
  if (["radio", "checkbox", "select"].includes(inputType)) {
    return "Enter one choice per line.";
  }

  if (inputType === "repeater") {
    return "Enter one column per line using: key | label | type | choices. Choices are comma-separated.";
  }

  return "";
}
