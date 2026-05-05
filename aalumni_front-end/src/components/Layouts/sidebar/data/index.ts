import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "ALUMNI SYSTEM",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Analytics Hub",
            url: "/analytics",
          },
        ],
      },
      {
        title: "Alumni",
        icon: Icons.User,
        items: [
          {
            title: "Alumni Records",
            url: "/alumni",
          },
          {
            title: "Manage Users",
            url: "/users",
          },
          {
            title: "Profile Verification",
            url: "/verification",
          },
        ],
      },
      {
        title: "Communications",
        icon: Icons.Calendar,
        items: [
          {
            title: "Events and Announcements",
            url: "/admin/announcements",
          },
          {
            title: "Job Postings",
            url: "/jobs",
          },
          {
            title: "QR Registration",
            url: "/qr-registration",
          },
        ],
      },
      {
        title: "Tracer Study",
        icon: Icons.Table,
        items: [
          {
            title: "Survey Builder",
            url: "/gts/surveys",
          },
          {
            title: "Campaigns",
            url: "/gts/campaigns",
          },
          {
            title: "Responses",
            url: "/gts/responses",
          },
        ],
      },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      {
        title: "System Setup",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Academic Management",
            url: "/academic",
          },
          {
            title: "Audit Logs",
            url: "/audit-logs",
          },
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
