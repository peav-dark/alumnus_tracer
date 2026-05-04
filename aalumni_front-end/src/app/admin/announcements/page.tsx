import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import {
  AnnouncementRowActions,
  CreateAnnouncementAction,
} from "@/components/alumni-system/announcement-actions";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminAnnouncements } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events and Announcements",
};

export default async function AdminAnnouncementsPage() {
  const response = await getAdminAnnouncements(50);
  const announcements = response?.items ?? [];
  const active = announcements.filter((item) => item.isActive).length;
  const categoryOptions = Array.from(
    new Set(announcements.map((announcement) => announcement.category || "General")),
  )
    .sort()
    .map((category) => ({ label: category, value: category }));
  const authorOptions = Array.from(
    new Set(
      announcements.map(
        (announcement) => announcement.postedBy?.fullName || "System",
      ),
    ),
  )
    .sort()
    .map((author) => ({ label: author, value: author }));

  return (
    <>
      <FeatureHeader
        title="Events and Announcements"
        description="Manage public events, alumni news, campus notices, scheduling details, and join links."
        actions={<CreateAnnouncementAction />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Loaded posts" value={announcements.length} />
        <MetricCard label="Active" value={active} />
        <MetricCard label="Inactive" value={announcements.length - active} />
      </div>

      {announcements.length ? (
        <Panel title="Events and Announcements Feed">
          <JQueryDataTable
            order={[[4, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "category",
                label: "Category",
                column: 1,
                placeholder: "All categories",
                options: categoryOptions,
              },
              {
                id: "author",
                label: "Posted By",
                column: 2,
                placeholder: "All authors",
                options: authorOptions,
              },
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
                  <TableHead className="min-w-[260px] pl-5 sm:pl-7.5">
                    Title
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Posted by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-7.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {announcement.title}
                      </div>
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm font-medium text-dark-5">
                        {announcement.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>{announcement.category || "General"}</TableCell>
                    <TableCell>{announcement.postedBy?.fullName || "System"}</TableCell>
                    <TableCell>
                      <StatusPill
                        status={announcement.isActive ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(announcement.eventStartAt || announcement.datePosted)}
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-7.5">
                      <AnnouncementRowActions announcement={announcement} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No announcements loaded" />
      )}
    </>
  );
}
