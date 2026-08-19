import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireRouteAccess("/profile");

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">โปรไฟล์</h1>
        <p className="text-sm text-stone-600">ข้อมูลบัญชีของคุณ</p>
      </div>

      <dl className="grid grid-cols-1 gap-2 rounded-xl border border-stone-200 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">อีเมล</dt>
          <dd className="font-medium break-all">{user.email}</dd>
        </div>
        <div>
          <dt className="text-stone-500">สิทธิ์</dt>
          <dd className="font-medium">{user.role}</dd>
        </div>
        <div>
          <dt className="text-stone-500">สถานะบัญชี</dt>
          <dd className="font-medium">{user.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</dd>
        </div>
      </dl>

      <ProfileForm name={user.name} />
      <ChangePasswordForm />
    </section>
  );
}
