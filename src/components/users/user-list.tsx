"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Role } from "@/generated/prisma/enums";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { setUserActiveAction } from "@/app/(admin)/users/actions";
import { Modal, primaryButtonClass, secondaryButtonClass } from "@/components/ui/modal";
import type { UserListItem } from "@/lib/users/user-service";

type Actor = { id: string; role: Role };

const DATE_FORMAT = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

function canManage(actor: Actor, target: UserListItem): boolean {
  if (actor.role === Role.OWNER) return true;
  return actor.role === Role.MANAGER && target.role === Role.STAFF;
}

export function UserList({
  users,
  actor,
  assignableRoles,
}: {
  users: readonly UserListItem[];
  actor: Actor;
  assignableRoles: readonly Role[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [confirming, setConfirming] = useState<UserListItem | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function toggleActive(user: UserListItem) {
    setPending(true);
    const result = await setUserActiveAction({ userId: user.id, active: !user.active });
    setPending(false);
    setConfirming(null);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    setMessage({
      tone: "ok",
      text: user.active ? "ปิดใช้งานผู้ใช้แล้ว" : "เปิดใช้งานผู้ใช้แล้ว",
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-stone-600">ทั้งหมด {users.length} บัญชี</p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-xl bg-amber-700 px-3 py-2 text-sm font-semibold text-white"
        >
          + เพิ่มผู้ใช้
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          ไม่พบผู้ใช้ตามเงื่อนไขที่เลือก
        </p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="rounded-xl border border-stone-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-stone-600">{user.email}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    สร้าง {DATE_FORMAT.format(user.createdAt)} · แก้ไข{" "}
                    {DATE_FORMAT.format(user.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium">
                    {user.role}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                  </span>
                </div>
              </div>

              {canManage(actor, user) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => setEditing(user)}
                  >
                    แก้ไข
                  </button>
                  {user.id === actor.id ? null : (
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => setConfirming(user)}
                    >
                      {user.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <CreateUserDialog
          assignableRoles={assignableRoles}
          onClose={() => setCreating(false)}
          onSuccess={() => {
            setCreating(false);
            setMessage({ tone: "ok", text: "สร้างผู้ใช้เรียบร้อย" });
            router.refresh();
          }}
        />
      ) : null}

      {editing ? (
        <EditUserDialog
          user={editing}
          actorId={actor.id}
          canResetPassword={actor.role === Role.OWNER && editing.id !== actor.id}
          assignableRoles={assignableRoles}
          onClose={() => setEditing(null)}
          onSuccess={(text) => {
            setEditing(null);
            setMessage({ tone: "ok", text });
            router.refresh();
          }}
        />
      ) : null}

      {confirming ? (
        <Modal
          title={confirming.active ? "ยืนยันปิดใช้งาน" : "ยืนยันเปิดใช้งาน"}
          onClose={() => setConfirming(null)}
        >
          <p className="mb-4 text-sm text-stone-700">
            {confirming.active
              ? `ปิดใช้งาน ${confirming.name}? ผู้ใช้จะถูกออกจากระบบและเข้าสู่ระบบไม่ได้อีก`
              : `เปิดใช้งาน ${confirming.name}? ผู้ใช้จะเข้าสู่ระบบได้ทันที`}
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => void toggleActive(confirming)}
            className={primaryButtonClass}
          >
            {pending ? "กำลังบันทึก..." : "ยืนยัน"}
          </button>
        </Modal>
      ) : null}
    </div>
  );
}
