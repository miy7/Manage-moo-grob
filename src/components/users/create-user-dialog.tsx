"use client";

import { useState } from "react";

import type { Role } from "@/generated/prisma/enums";
import { createUserAction } from "@/app/(admin)/users/actions";
import { Modal, inputClass, primaryButtonClass } from "@/components/ui/modal";
import { createUserSchema } from "@/lib/validation/user";

export function CreateUserDialog({
  assignableRoles,
  onClose,
  onSuccess,
}: {
  assignableRoles: readonly Role[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(assignableRoles[assignableRoles.length - 1]);
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createUserSchema.safeParse({ name, email, password, role, active });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setPending(true);
    const result = await createUserAction(parsed.data);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <Modal title="เพิ่มผู้ใช้" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="new-name" className="mb-1 block text-sm font-medium">
            ชื่อ
          </label>
          <input
            id="new-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="new-email" className="mb-1 block text-sm font-medium">
            อีเมล
          </label>
          <input
            id="new-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium">
            รหัสผ่าน
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-stone-500">อย่างน้อย 8 ตัวอักษร มีตัวอักษรและตัวเลข</p>
        </div>
        <div>
          <label htmlFor="new-role" className="mb-1 block text-sm font-medium">
            สิทธิ์
          </label>
          <select
            id="new-role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className={inputClass}
          >
            {assignableRoles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4"
          />
          เปิดใช้งานบัญชีทันที
        </label>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "กำลังบันทึก..." : "สร้างผู้ใช้"}
        </button>
      </form>
    </Modal>
  );
}
