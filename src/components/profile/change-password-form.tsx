"use client";

import { useState } from "react";

import { changePasswordAction } from "@/app/(staff)/profile/actions";
import { inputClass, primaryButtonClass } from "@/components/ui/modal";
import { changePasswordSchema } from "@/lib/validation/user";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      setMessage({ tone: "error", text: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
      return;
    }

    setPending(true);
    const result = await changePasswordAction(parsed.data);
    setPending(false);
    setCurrentPassword("");
    setNewPassword("");

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    setMessage({ tone: "ok", text: "เปลี่ยนรหัสผ่านเรียบร้อย" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-stone-200 p-4" noValidate>
      <h2 className="text-base font-semibold">เปลี่ยนรหัสผ่าน</h2>
      <label htmlFor="current-password" className="block text-sm font-medium">
        รหัสผ่านปัจจุบัน
      </label>
      <input
        id="current-password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        className={inputClass}
        required
      />
      <label htmlFor="new-password-profile" className="block text-sm font-medium">
        รหัสผ่านใหม่
      </label>
      <input
        id="new-password-profile"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        className={inputClass}
        required
      />
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
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
      </button>
    </form>
  );
}
