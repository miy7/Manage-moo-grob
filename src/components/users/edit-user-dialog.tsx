"use client";

import { useState } from "react";

import type { Role } from "@/generated/prisma/enums";
import {
  changeUserRoleAction,
  resetUserPasswordAction,
  updateUserAction,
} from "@/app/(admin)/users/actions";
import { Modal, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/modal";
import type { UserListItem } from "@/lib/users/user-service";
import { passwordSchema, updateUserSchema } from "@/lib/validation/user";

export function EditUserDialog({
  user,
  actorId,
  canResetPassword,
  assignableRoles,
  onClose,
  onSuccess,
}: {
  user: UserListItem;
  actorId: string;
  canResetPassword: boolean;
  assignableRoles: readonly Role[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState("");
  const [confirmRole, setConfirmRole] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canChangeRole = user.id !== actorId && assignableRoles.includes(user.role);

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = updateUserSchema.safeParse({ userId: user.id, name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setPending(true);
    const result = await updateUserAction(parsed.data);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess("บันทึกข้อมูลผู้ใช้แล้ว");
  }

  async function applyRole() {
    setError(null);
    setPending(true);
    const result = await changeUserRoleAction({ userId: user.id, role });
    setPending(false);
    setConfirmRole(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess("เปลี่ยนสิทธิ์ผู้ใช้แล้ว");
  }

  async function applyReset() {
    setError(null);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setConfirmReset(false);
      setError(parsed.error.issues[0]?.message ?? "รหัสผ่านไม่ถูกต้อง");
      return;
    }

    setPending(true);
    const result = await resetUserPasswordAction({ userId: user.id, password: parsed.data });
    setPending(false);
    setConfirmReset(false);
    setPassword("");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess("ตั้งรหัสผ่านใหม่เรียบร้อย");
  }

  return (
    <Modal title={`แก้ไข ${user.name}`} onClose={onClose}>
      <div className="space-y-4">
        <form onSubmit={saveName} className="space-y-2" noValidate>
          <label htmlFor="edit-name" className="block text-sm font-medium">
            ชื่อ
          </label>
          <input
            id="edit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            required
          />
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            บันทึกชื่อ
          </button>
        </form>

        {canChangeRole ? (
          <div className="space-y-2 border-t border-stone-200 pt-3">
            <label htmlFor="edit-role" className="block text-sm font-medium">
              สิทธิ์
            </label>
            <select
              id="edit-role"
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
            <button
              type="button"
              disabled={pending || role === user.role}
              onClick={() => setConfirmRole(true)}
              className={secondaryButtonClass}
            >
              เปลี่ยนสิทธิ์
            </button>
            {confirmRole ? (
              <div className="rounded-lg bg-amber-50 p-3 text-sm">
                <p className="mb-2">
                  ยืนยันเปลี่ยนสิทธิ์ {user.name} เป็น {role}? ผู้ใช้จะถูกออกจากระบบ
                </p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void applyRole()}
                  className={primaryButtonClass}
                >
                  {pending ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {canResetPassword ? (
          <div className="space-y-2 border-t border-stone-200 pt-3">
            <label htmlFor="edit-password" className="block text-sm font-medium">
              ตั้งรหัสผ่านใหม่
            </label>
            <input
              id="edit-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              disabled={pending || password.length === 0}
              onClick={() => setConfirmReset(true)}
              className={secondaryButtonClass}
            >
              รีเซ็ตรหัสผ่าน
            </button>
            {confirmReset ? (
              <div className="rounded-lg bg-amber-50 p-3 text-sm">
                <p className="mb-2">ยืนยันตั้งรหัสผ่านใหม่ให้ {user.name}? ผู้ใช้จะถูกออกจากระบบ</p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void applyReset()}
                  className={primaryButtonClass}
                >
                  {pending ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
