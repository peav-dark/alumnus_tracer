import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
  formatDate,
} from "@/components/alumni-system/ui";
import {
  CreateUserAction,
  UserCrudActions,
} from "@/components/alumni-system/user-actions";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUsers } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users",
};

export default async function UsersPage() {
  const response = await getAdminUsers(50);
  const users = response?.items ?? [];
  const active = users.filter((user) => user.accountStatus === "active").length;
  const pending = users.filter((user) => user.accountStatus === "pending").length;
  const linked = users.filter((user) => user.hasAlumniRecord).length;

  return (
    <>
      <FeatureHeader
        title="Manage Users"
        description="Review alumni, staff, and admin accounts from the NORSU Alumni Tracker user registry."
        actions={<CreateUserAction />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Loaded users" value={users.length} />
        <MetricCard label="Active accounts" value={active} />
        <MetricCard label="Pending accounts" value={pending} />
        <MetricCard label="Linked alumni" value={linked} />
      </div>

      {users.length ? (
        <Panel title="User Registry">
          <JQueryDataTable
            order={[[4, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "role",
                label: "Role",
                column: 1,
                match: "exact",
                placeholder: "All roles",
                options: [
                  { label: "Admin", value: "admin" },
                  { label: "Staff", value: "staff" },
                  { label: "Alumni", value: "alumni" },
                ],
              },
              {
                id: "status",
                label: "Status",
                column: 2,
                match: "exact",
                placeholder: "All statuses",
                options: [
                  { label: "Active", value: "active" },
                  { label: "Pending", value: "pending" },
                  { label: "Inactive", value: "inactive" },
                ],
              },
              {
                id: "record",
                label: "Alumni Record",
                column: 3,
                match: "exact",
                placeholder: "All records",
                options: [
                  { label: "Linked", value: "Linked" },
                  { label: "Missing", value: "Missing" },
                ],
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[220px] pl-5 sm:pl-7.5">
                    User
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alumni record</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="pr-5 text-right sm:pr-7.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {user.fullName}
                      </div>
                      <div className="text-sm font-medium text-dark-5">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.primaryRole}</TableCell>
                    <TableCell>
                      <StatusPill status={user.accountStatus} />
                    </TableCell>
                    <TableCell>{user.hasAlumniRecord ? "Linked" : "Missing"}</TableCell>
                    <TableCell>
                      {formatDate(user.dateRegistered)}
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-7.5">
                      <UserCrudActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No users loaded" />
      )}
    </>
  );
}
