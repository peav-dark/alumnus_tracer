import {
  getAdminAnnouncements,
  getAdminDashboard,
  getAdminJobs,
} from "@/lib/api";

export async function getTopProducts() {
  const jobs = await getAdminJobs(6);

  if (jobs?.items.length) {
    return jobs.items.map((job) => ({
      name: job.title,
      category: job.companyName,
      price: job.employmentType || "Open role",
      sold: job.deadline || "Open",
      profit: job.isActive && !job.isExpired ? "Active" : "Closed",
    }));
  }

  return [
    {
      name: "No API session",
      category: "Sign in as an admin",
      price: "Unavailable",
      sold: "Unavailable",
      profit: "Pending",
    },
  ];
}

export async function getInvoiceTableData() {
  const announcements = await getAdminAnnouncements(5);

  if (announcements?.items.length) {
    return announcements.items.map((announcement) => ({
      name: announcement.title,
      price: announcement.category || "Announcement",
      date: announcement.datePosted || new Date().toISOString(),
      status: announcement.isActive ? "Active" : "Inactive",
    }));
  }

  return [
    {
      name: "No announcements loaded",
      price: "Announcement",
      date: new Date().toISOString(),
      status: "Pending",
    },
  ];
}

export async function getTopChannels() {
  const dashboard = await getAdminDashboard();
  const surveyEmploymentStatus =
    dashboard?.surveyAnalytics.presentEmploymentStatus.length
      ? dashboard.surveyAnalytics.presentEmploymentStatus
      : dashboard?.surveyAnalytics.presentlyEmployed ?? [];

  if (surveyEmploymentStatus.length) {
    const total = surveyEmploymentStatus.reduce(
      (sum, row) => sum + row.total,
      0,
    );

    return surveyEmploymentStatus.map((row) => ({
      status: row.label,
      responses: row.total,
      conversion: total > 0 ? Number(((row.total / total) * 100).toFixed(1)) : 0,
      source: "Survey responses",
    }));
  }

  if (dashboard?.employmentStatusChart.length) {
    const total = dashboard.employmentStatusChart.reduce(
      (sum, row) => sum + row.total,
      0,
    );

    return dashboard.employmentStatusChart.map((row) => ({
      status: row.employmentStatus,
      responses: row.total,
      conversion: total > 0 ? Number(((row.total / total) * 100).toFixed(1)) : 0,
      source: "Alumni profiles",
    }));
  }

  return [
    {
      status: "No survey data",
      responses: 0,
      conversion: 0,
      source: "Survey responses",
    },
  ];
}
