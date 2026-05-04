import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const AUTH_COOKIE = "norsu_admin_token";

export function normalizeAuthToken(token?: string | null) {
  if (!token) {
    return "";
  }

  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  try {
    return decodeURIComponent(unquoted);
  } catch {
    return unquoted;
  }
}

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

export function getBackendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

async function safeReadJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function buildLandingAuthUrl(params?: Record<string, string>) {
  const url = new URL("/", "http://localhost");
  url.searchParams.set("auth", "sign-in");

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}

export function getJobPostingImageUrl(filename?: string | null) {
  if (!filename) {
    return null;
  }

  return getBackendUrl(`/uploads/job_postings/${filename}`);
}

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = normalizeAuthToken(cookieStore.get(AUTH_COOKIE)?.value);

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const authHeader = await getAuthHeader();
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  Object.entries(authHeader).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(getBackendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await safeReadJson<{ error?: string; message?: string }>(response);
      message = body?.error || body?.message || message;
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  return (await safeReadJson<T>(response)) as T;
}

export async function apiFetchOrNull<T>(path: string, init: RequestInit = {}) {
  try {
    return await apiFetch<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      redirect(buildLandingAuthUrl());
    }

    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}

export async function publicApiFetchOrNull<T>(
  path: string,
  init: RequestInit = {},
) {
  try {
    const headers = new Headers(init.headers);

    headers.set("Accept", "application/json");

    const response = await fetch(getBackendUrl(path), {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await safeReadJson<T>(response)) as T;
  } catch {
    return null;
  }
}

export type AdminDashboardResponse = {
  stats: {
    totalAlumni: number;
    employed: number;
    unemployed: number;
    selfEmployed: number;
    totalUsers: number;
    pendingUsers: number;
    activeUsers: number;
    adminUsers: number;
    staffUsers: number;
    activeJobs: number;
    totalJobs: number;
    activeAnnouncements: number;
    totalSurveyResponses: number;
    surveyEmploymentRate: number;
    surveyAlignmentRate: number;
    employmentRate: number;
    alignmentRate: number;
  };
  registrationStates: Record<string, number>;
  employmentStatusChart: Array<{
    employmentStatus: string;
    total: number;
  }>;
  surveyAnalytics: {
    responseCount: number;
    answeredQuestionCount: number;
    employmentRate: number;
    courseAlignmentRate: number;
    curriculumRelevanceRate: number;
    presentlyEmployed: Array<{ label: string; total: number }>;
    presentEmploymentStatus: Array<{ label: string; total: number }>;
    placeOfWork: Array<{ label: string; total: number }>;
    firstJobRelatedToCourse: Array<{ label: string; total: number }>;
    curriculumRelevant: Array<{ label: string; total: number }>;
    salaryRanges: Array<{ label: string; total: number }>;
    competencies: Array<{ label: string; total: number }>;
    responsesByBatch: Array<{ label: string; total: number }>;
  };
  recentAnnouncements: Announcement[];
  recentAuditLogs: Array<{
    id: number;
    actionLabel: string;
    entityType: string;
    details: string;
    createdAt: string | null;
    performedBy: {
      fullName: string;
      email: string;
    };
  }>;
};

export type AdminFeature = {
  key: string;
  label: string;
  endpoint: string;
  methods: string[];
};

export type AdminFeaturesResponse = {
  features: AdminFeature[];
};

export type AdminNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: "info" | "success" | "warning" | "danger" | string;
  targetUrl: string | null;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
  readAt: string | null;
  actor: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type AdminNotificationsResponse = {
  items: AdminNotification[];
  unreadCount: number;
};

export type AdminNotificationCountResponse = {
  unreadCount: number;
};

export type AdminUser = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  schoolId: string | null;
  roles: string[];
  primaryRole: string;
  accountStatus: string;
  dateRegistered: string | null;
  lastLogin: string | null;
  lastActivity: string | null;
  emailVerifiedAt: string | null;
  hasAlumniRecord: boolean;
  alumni?: {
    id: number;
    studentNumber: string | null;
    fullName: string;
    emailAddress: string | null;
    college: string | null;
    course: string | null;
    degreeProgram: string | null;
    yearGraduated: number | null;
    employmentStatus: string | null;
    jobTitle: string | null;
    companyName: string | null;
    tracerStatus: string | null;
    lastTracerSubmissionAt: string | null;
    latestSurvey: {
      id: number;
      submittedAt: string | null;
      employmentStatus: string | null;
      presentlyEmployed: string | null;
      occupation: string | null;
      companyName: string | null;
      companyAddress: string | null;
      surveyTemplate: {
        id: number;
        title: string;
      } | null;
      campaign: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
};

export type VerificationResponse = {
  pending: AdminUser[];
  approved: AdminUser[];
  denied: AdminUser[];
  counts: {
    pending: number;
    approved: number;
    denied: number;
  };
};

export type Announcement = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  eventStartAt: string | null;
  location: string | null;
  joinUrl: string | null;
  isActive: boolean;
  datePosted: string | null;
  postedBy: {
    fullName: string;
  } | null;
};

export type JobPosting = {
  id: number;
  title: string;
  companyName: string;
  location: string | null;
  employmentType: string | null;
  industry: string | null;
  deadline: string | null;
  isActive: boolean;
  isExpired: boolean;
  datePosted: string | null;
  description?: string | null;
  requirements?: string | null;
  salaryRange?: string | null;
  relatedCourse?: string | null;
  contactEmail?: string | null;
  applicationLink?: string | null;
  imageFilename?: string | null;
  dateUpdated?: string | null;
};

export type College = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  departmentCount: number;
};

export type Department = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  college: {
    id: number;
    name: string;
    code: string | null;
  } | null;
};

export type AcademicResponse = {
  colleges: College[];
  departments: Department[];
};

export type QrRegistrationBatch = {
  id: number;
  batchYear: number;
  isOpen: boolean;
  createdAt: string | null;
  registrationUrl: string;
};

export type QrRegistrationResponse = {
  items: QrRegistrationBatch[];
  meta: {
    total: number;
    open: number;
    defaultBatchYear: number;
    maxBatchYear: number;
  };
};

export type SurveyTemplate = {
  id: number;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | null;
  questionCount: number;
  campaignCount: number;
};

export type SurveyQuestion = {
  id: number;
  questionText: string;
  inputType: string;
  section: string;
  options: Array<string | Record<string, unknown>> | null;
  sortOrder: number;
  isActive: boolean;
};

export type SurveyQuestionsResponse = {
  survey: SurveyTemplate;
  items: SurveyQuestion[];
};

export type SurveyCampaign = {
  id: number;
  name: string;
  surveyTemplate: {
    id: number;
    title: string;
  };
  emailSubject: string;
  emailBody: string;
  targetGraduationYears: number[];
  targetCollege: string | null;
  targetCourse: string | null;
  expiryDays: number;
  status: string;
  createdBy: string | null;
  createdAt: string | null;
  sentAt: string | null;
  scheduledSendAt: string | null;
  invitations: {
    total: number;
    queued: number;
    sent: number;
    opened: number;
    completed: number;
    expired: number;
    failed: number;
  };
};

export type SurveyCampaignRecipient = {
  id: number;
  name: string;
  email: string | null;
  studentNumber: string | null;
  college: string | null;
  course: string | null;
  yearGraduated: number | null;
};

export type SurveyCampaignPreviewResponse = {
  count: number;
  items: SurveyCampaignRecipient[];
  message?: string;
};

export type GtsResponseAnswer = {
  key: string;
  section: string;
  questionText: string;
  inputType: string;
  options: Array<string | Record<string, unknown>> | null;
  numberKey: string | null;
  answer: string | string[] | Record<string, unknown>[];
};

export type GtsResponseSection = {
  title: string;
  items: GtsResponseAnswer[];
};

export type GtsResponseListItem = {
  id: number;
  respondent: {
    name: string;
    email: string | null;
    userId: number | null;
    institutionCode?: string | null;
    controlCode?: string | null;
  };
  surveyTemplate: {
    id: number;
    title: string;
  } | null;
  campaign: {
    id: number;
    name: string;
  } | null;
  sourceLabel: string;
  targetBatchYear: number | null;
  invitation: {
    id: number;
    status: string;
    sentAt: string | null;
    openedAt: string | null;
    completedAt: string | null;
    expiresAt: string | null;
  } | null;
  summary: {
    contactNumber: string;
    occupation: string;
    companyName: string;
    companyAddress: string;
  };
  submittedAt: string | null;
};

export type GtsResponseDetail = GtsResponseListItem & {
  answerSections: GtsResponseSection[];
};

export type GtsResponsesResponse = ListResponse<GtsResponseListItem> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GtsResponseResponse = {
  item: GtsResponseDetail;
};

export type AuditLog = {
  id: number;
  action: string;
  actionLabel: string;
  entityType: string;
  entityId: number | null;
  details: string;
  ipAddress: string | null;
  createdAt: string | null;
  performedBy: {
    id: number;
    fullName: string;
    email: string;
  };
};

export type ListResponse<T> = {
  items: T[];
  meta?: {
    total?: number;
    limit?: number;
  };
};

export const getAdminFeatures = cache(() =>
  apiFetchOrNull<AdminFeaturesResponse>("/api/admin/features"),
);

export const getAdminDashboard = cache(() =>
  apiFetchOrNull<AdminDashboardResponse>("/api/admin/dashboard"),
);

export const getAdminUsers = cache((limit = 25) =>
  apiFetchOrNull<ListResponse<AdminUser>>(`/api/admin/users?limit=${limit}`),
);

export const getAdminVerification = cache(() =>
  apiFetchOrNull<VerificationResponse>("/api/admin/verification"),
);

export const getAdminJobs = cache((limit = 10) =>
  apiFetchOrNull<ListResponse<JobPosting>>(`/api/admin/jobs?limit=${limit}`),
);

export const getAdminAnnouncements = cache((limit = 10) =>
  apiFetchOrNull<ListResponse<Announcement>>(
    `/api/admin/announcements?limit=${limit}`,
  ),
);

export const getPublicAnnouncements = cache((limit = 6) =>
  publicApiFetchOrNull<ListResponse<Announcement>>(
    `/api/public/announcements?limit=${limit}`,
  ),
);

export const getPublicAnnouncement = cache((id: number) =>
  publicApiFetchOrNull<{ item: Announcement }>(
    `/api/public/announcements/${id}`,
  ),
);

export const getPublicJobs = cache((limit = 6) =>
  publicApiFetchOrNull<ListResponse<JobPosting>>(
    `/api/public/jobs?limit=${limit}`,
  ),
);

export const getPublicJob = cache((id: number) =>
  publicApiFetchOrNull<{ item: JobPosting }>(`/api/public/jobs/${id}`),
);

export const getAdminAcademic = cache(() =>
  apiFetchOrNull<AcademicResponse>("/api/admin/academic"),
);

export const getAdminQrRegistration = cache(() =>
  apiFetchOrNull<QrRegistrationResponse>("/api/admin/qr-registration"),
);

export const getAdminGtsSurveys = cache(() =>
  apiFetchOrNull<ListResponse<SurveyTemplate>>("/api/admin/gts/surveys"),
);

export const getAdminGtsSurveyQuestions = cache((id: number) =>
  apiFetchOrNull<SurveyQuestionsResponse>(
    `/api/admin/gts/surveys/${id}/questions`,
  ),
);

export const getAdminGtsCampaigns = cache(() =>
  apiFetchOrNull<ListResponse<SurveyCampaign>>("/api/admin/gts/campaigns"),
);

export const getAdminGtsResponses = cache((query = "") =>
  apiFetchOrNull<GtsResponsesResponse>(
    `/api/admin/gts/responses${query ? `?${query}` : ""}`,
  ),
);

export const getAdminGtsResponse = cache((id: number) =>
  apiFetchOrNull<GtsResponseResponse>(`/api/admin/gts/responses/${id}`),
);

export const getAdminAuditLogs = cache((limit = 25) =>
  apiFetchOrNull<ListResponse<AuditLog>>(`/api/admin/audit-logs?limit=${limit}`),
);
