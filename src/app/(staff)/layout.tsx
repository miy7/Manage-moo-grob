import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { navItemsForRole } from "@/lib/navigation";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell user={user} navItems={navItemsForRole(user.role)}>
      {children}
    </AppShell>
  );
}
