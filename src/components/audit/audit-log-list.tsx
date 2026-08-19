import type { AuditLogRow } from "@/lib/audit/audit-query";

const DATE_FORMAT = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "Asia/Bangkok",
});

export function AuditLogList({ logs }: { logs: readonly AuditLogRow[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        ไม่พบบันทึกตามเงื่อนไขที่เลือก
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li key={log.id} className="rounded-xl border border-stone-200 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold">
              {log.action}
            </span>
            <time dateTime={log.createdAt.toISOString()} className="text-xs text-stone-500">
              {DATE_FORMAT.format(log.createdAt)}
            </time>
          </div>
          <p className="mt-2 text-stone-700">
            {log.user ? `${log.user.name} (${log.user.email})` : "ระบบ"}
          </p>
          <p className="text-xs text-stone-500 break-all">
            {log.entity}
            {log.entityId ? ` · ${log.entityId}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
