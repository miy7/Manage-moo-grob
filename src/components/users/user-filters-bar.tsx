"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { ROLES } from "@/lib/auth/roles";
import type { UserFilters } from "@/lib/validation/user";
import { inputClass } from "@/components/ui/modal";

export function UserFiltersBar({ filters }: { filters: UserFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => router.replace(`/users?${params.toString()}`));
  }

  return (
    <form
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        apply({ q: query.trim() });
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ค้นหาชื่อหรืออีเมล"
        aria-label="ค้นหาผู้ใช้"
        className={inputClass}
      />
      <select
        aria-label="กรองตามสิทธิ์"
        value={filters.role ?? ""}
        onChange={(event) => apply({ role: event.target.value })}
        className={inputClass}
      >
        <option value="">ทุกสิทธิ์</option>
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <select
        aria-label="กรองตามสถานะ"
        value={filters.status ?? ""}
        onChange={(event) => apply({ status: event.target.value })}
        className={inputClass}
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งานอยู่</option>
        <option value="inactive">ปิดใช้งาน</option>
      </select>
      <button type="submit" disabled={pending} className="sr-only">
        ค้นหา
      </button>
    </form>
  );
}
