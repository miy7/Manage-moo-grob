import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { defaultRouteForRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(defaultRouteForRole(user.role));

  return (
    <main className="flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-amber-800">หมูกรอบพ่อแดกได้</h1>
          <p className="mt-1 text-sm text-stone-500">ระบบบริหารจัดการร้าน</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
