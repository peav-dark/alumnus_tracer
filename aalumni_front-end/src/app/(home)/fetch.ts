import { getAdminDashboard } from "@/lib/api";

export async function getOverviewData() {
  const dashboard = await getAdminDashboard();

  if (dashboard) {
    const { stats } = dashboard;

    return {
      alumni: {
        value: stats.totalAlumni,
        growthRate: null,
      },
      employment: {
        value: `${stats.employmentRate}%`,
        growthRate: null,
      },
      jobs: {
        value: stats.activeJobs,
        growthRate: null,
      },
      users: {
        value: stats.totalUsers,
        growthRate: null,
      },
    };
  }

  return {
    alumni: {
      value: 0,
      growthRate: null,
    },
    employment: {
      value: "0%",
      growthRate: null,
    },
    jobs: {
      value: 0,
      growthRate: null,
    },
    users: {
      value: 0,
      growthRate: null,
    },
  };
}

export async function getChatsData() {
  const dashboard = await getAdminDashboard();

  if (dashboard?.recentAuditLogs.length) {
    return dashboard.recentAuditLogs.slice(0, 5).map((log, index) => ({
      name: log.performedBy.fullName,
      isActive: index < 2,
      lastMessage: {
        content: `${log.actionLabel}: ${log.entityType}`,
        type: "text",
        timestamp: log.createdAt || new Date().toISOString(),
        isRead: true,
      },
      unreadCount: 0,
    }));
  }

  return [
    {
      name: "No API session",
      isActive: false,
      lastMessage: {
        content: "Sign in to load recent admin activity.",
        type: "text",
        timestamp: new Date().toISOString(),
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}
