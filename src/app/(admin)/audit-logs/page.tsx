import { AuditLogFiltersBar } from "@/components/audit/audit-log-filters-bar";
import { AuditLogList } from "@/components/audit/audit-log-list";
import { requireRouteAccess } from "@/lib/auth/session";
import { listAuditLogs, listAuditLogActors } from "@/lib/audit/audit-query";
import { auditLogFiltersSchema } from "@/lib/validation/audit";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

export default async function AuditLogsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRouteAccess("/audit-logs");
  const params = await searchParams;

  const parsed = auditLogFiltersSchema.safeParse({
    action: firstValue(params.action),
    userId: firstValue(params.userId),
    from: firstValue(params.from),
    to: firstValue(params.to),
  });
  const filters = parsed.success ? parsed.data : {};

  const [logs, actors] = await Promise.all([listAuditLogs(filters), listAuditLogActors()]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">บันทึกระบบ</h1>
        <p className="text-sm text-stone-600">ประวัติการเปลี่ยนแปลงข้อมูลสำคัญในระบบ</p>
      </div>

      <AuditLogFiltersBar filters={filters} actors={actors} />
      <AuditLogList logs={logs} />
    </section>
  );
}
