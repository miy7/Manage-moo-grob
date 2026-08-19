"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProfileAction } from "@/app/(staff)/profile/actions";
import { inputClass, primaryButtonClass } from "@/components/ui/modal";
import { updateProfileSchema } from "@/lib/validation/user";

export function ProfileForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = updateProfileSchema.safeParse({ name });
    if (!parsed.success) {
      setMessage({ tone: "error", text: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
      return;
    }

    setPending(true);
    const result = await updateProfileAction(parsed.data);
    setPending(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    setMessage({ tone: "ok", text: "บันทึกชื่อเรียบร้อย" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-stone-200 p-4" noValidate>
      <h2 className="text-base font-semibold">แก้ไขชื่อ</h2>
      <label htmlFor="profile-name" className="block text-sm font-medium">
        ชื่อ
      </label>
      <input
        id="profile-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
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
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
