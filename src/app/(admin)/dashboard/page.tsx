import { requireRouteAccess } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireRouteAccess("/dashboard");

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-bold">แดชบอร์ด</h1>
      <p className="text-sm text-stone-600">
        สวัสดี {user.name} — ตัวเลขยอดขาย ต้นทุน และกำไร จะเปิดใช้งานใน Phase 9
      </p>
    </section>
  );
}
