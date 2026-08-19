import { requireRouteAccess } from "@/lib/auth/session";

export default async function PosPage() {
  const user = await requireRouteAccess("/pos");

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-bold">ขายหน้าร้าน</h1>
      <p className="text-sm text-stone-600">
        สวัสดี {user.name} — หน้าขาย (POS) จะเปิดใช้งานใน Phase 6
      </p>
    </section>
  );
}
