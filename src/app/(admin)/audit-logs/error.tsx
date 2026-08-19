"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">ไม่สามารถโหลดบันทึกระบบได้</p>
      <p>กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาให้แจ้งผู้ดูแลระบบ</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white"
      >
        ลองใหม่
      </button>
    </div>
  );
}
