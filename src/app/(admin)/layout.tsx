import { AppShell } from "@/components/layout/app-shell";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { navItemsForRole } from "@/lib/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(ADMIN_ROLES);

  return (
    <AppShell user={user} navItems={navItemsForRole(user.role)}>
      {children}
    </AppShell>
  );
}
