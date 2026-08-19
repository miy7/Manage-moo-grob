"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { AuditAction } from "@/generated/prisma/enums";
import { inputClass } from "@/components/ui/modal";
import type { AuditActor } from "@/lib/audit/audit-query";
import type { AuditLogFilters } from "@/lib/validation/audit";

export function AuditLogFiltersBar({
  filters,
  actors,
}: {
  filters: AuditLogFilters;
  actors: readonly AuditActor[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function apply(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`/audit-logs?${params.toString()}`));
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
      <select
        aria-label="กรองตามการกระทำ"
        value={filters.action ?? ""}
        onChange={(event) => apply("action", event.target.value)}
        className={inputClass}
      >
        <option value="">ทุกการกระทำ</option>
        {Object.values(AuditAction).map((action) => (
          <option key={action} value={action}>
            {action}
          </option>
        ))}
      </select>
      <select
        aria-label="กรองตามผู้ใช้"
        value={filters.userId ?? ""}
        onChange={(event) => apply("userId", event.target.value)}
        className={inputClass}
      >
        <option value="">ทุกผู้ใช้</option>
        {actors.map((actor) => (
          <option key={actor.id} value={actor.id}>
            {actor.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        aria-label="ตั้งแต่วันที่"
        value={filters.from ?? ""}
        onChange={(event) => apply("from", event.target.value)}
        className={inputClass}
      />
      <input
        type="date"
        aria-label="ถึงวันที่"
        value={filters.to ?? ""}
        onChange={(event) => apply("to", event.target.value)}
        className={inputClass}
      />
    </div>
  );
}
