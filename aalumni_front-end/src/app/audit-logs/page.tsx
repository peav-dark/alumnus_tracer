import {
  EmptyState,
  FeatureHeader,
  MetricCard,
  Panel,
  formatDate,
} from "@/components/alumni-system/ui";
import { JQueryDataTable } from "@/components/alumni-system/jquery-data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminAuditLogs } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AuditLogsPage() {
  const response = await getAdminAuditLogs(50);
  const logs = response?.items ?? [];
  const actors = new Set(logs.map((log) => log.performedBy.email)).size;
  const entities = new Set(logs.map((log) => log.entityType)).size;
  const actionOptions = Array.from(new Set(logs.map((log) => log.actionLabel)))
    .sort()
    .map((action) => ({ label: action, value: action }));
  const entityOptions = Array.from(new Set(logs.map((log) => log.entityType)))
    .sort()
    .map((entity) => ({ label: entity, value: entity }));
  const actorOptions = Array.from(
    new Set(logs.map((log) => log.performedBy.fullName)),
  )
    .sort()
    .map((actor) => ({ label: actor, value: actor }));

  return (
    <>
      <FeatureHeader
        title="Audit Logs"
        description="Review admin actions, affected records, actor identities, and operational history."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Recent entries" value={logs.length} />
        <MetricCard label="Actors" value={actors} />
        <MetricCard label="Entity types" value={entities} />
      </div>

      {logs.length ? (
        <Panel title="Recent Activity">
          <JQueryDataTable
            order={[[4, "desc"]]}
            pageLength={10}
            filters={[
              {
                id: "action",
                label: "Action",
                column: 0,
                placeholder: "All actions",
                options: actionOptions,
              },
              {
                id: "entity",
                label: "Entity",
                column: 1,
                placeholder: "All entities",
                options: entityOptions,
              },
              {
                id: "actor",
                label: "Actor",
                column: 2,
                placeholder: "All actors",
                options: actorOptions,
              },
            ]}
          >
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:py-4">
                  <TableHead className="min-w-[220px] pl-5 sm:pl-7.5">
                    Action
                  </TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Performed by</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="pr-5 sm:pr-7.5">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="text-base">
                    <TableCell className="pl-5 sm:pl-7.5">
                      <div className="font-semibold text-dark dark:text-white">
                        {log.actionLabel}
                      </div>
                      <div className="text-sm font-medium text-dark-5">
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ""}
                    </TableCell>
                    <TableCell>
                      <div>{log.performedBy.fullName}</div>
                      <div className="text-sm font-medium text-dark-5">
                        {log.performedBy.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="line-clamp-2">{log.details}</p>
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-7.5">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </JQueryDataTable>
        </Panel>
      ) : (
        <EmptyState title="No audit logs loaded" />
      )}
    </>
  );
}
