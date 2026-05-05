import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  StatusPill,
} from "@/components/alumni-system/ui";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  CreateCollegeAction,
  CreateDepartmentAction,
  CollegeRowActions,
  DepartmentRowActions,
} from "@/components/alumni-system/academic-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminAcademic } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Management",
};

export default async function AcademicPage() {
  const academic = await getAdminAcademic();
  const colleges = academic?.colleges ?? [];
  const departments = academic?.departments ?? [];
  const activeDepartments = departments.filter((dept) => dept.isActive).length;
  const collegeOptions = Array.from(
    new Set(departments.map((department) => department.college?.code || "Unassigned")),
  )
    .sort()
    .map((college) => ({ label: college, value: college }));

  return (
    <>
      <FeatureHeader
        title="Academic Management"
        description="Maintain college and department references used by registrations, profiles, analytics, and campaign targeting."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Colleges" value={colleges.length} />
        <MetricCard label="Departments" value={departments.length} />
        <MetricCard label="Active departments" value={activeDepartments} />
      </div>

      {academic ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* ── COLLEGES ── */}
          <Panel
            title="Colleges"
            action={<CreateCollegeAction />}
          >
            <JQueryDataTable
              pageLength={10}
              compactFilters
              compactFilterGridTemplate="minmax(160px,1.35fr) minmax(132px,1fr) 112px 88px"
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
                    <TableHead className="pl-5 sm:pl-7.5">College</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 sm:pr-7.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id} className="text-base">
                      <TableCell className="pl-5 sm:pl-7.5">
                        <div className="font-semibold text-dark dark:text-white">
                          {college.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-dark-5">
                          {college.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell>{college.code || "N/A"}</TableCell>
                      <TableCell>{college.departmentCount}</TableCell>
                      <TableCell>
                        <StatusPill status={college.isActive ? "Active" : "Inactive"} />
                      </TableCell>
                      <TableCell className="pr-5 sm:pr-7.5">
                        <CollegeRowActions college={college} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </JQueryDataTable>
          </Panel>

          {/* ── DEPARTMENTS ── */}
          <Panel
            title="Departments"
            action={<CreateDepartmentAction colleges={colleges} />}
          >
            <JQueryDataTable
              pageLength={10}
              filters={[
                {
                  id: "college",
                  label: "College",
                  column: 1,
                  placeholder: "All colleges",
                  options: collegeOptions,
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
                    <TableHead className="pl-5 sm:pl-7.5">Department</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 sm:pr-7.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id} className="text-base">
                      <TableCell className="pl-5 sm:pl-7.5">
                        <div className="font-semibold text-dark dark:text-white">
                          {department.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-dark-5">
                          {department.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell>{department.college?.code || "Unassigned"}</TableCell>
                      <TableCell>{department.code || "N/A"}</TableCell>
                      <TableCell>
                        <StatusPill
                          status={department.isActive ? "Active" : "Inactive"}
                        />
                      </TableCell>
                      <TableCell className="pr-5 sm:pr-7.5">
                        <DepartmentRowActions
                          department={department}
                          colleges={colleges}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </JQueryDataTable>
          </Panel>
        </div>
      ) : (
        <EmptyState title="Academic references unavailable" />
      )}
    </>
  );
}
