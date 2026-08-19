import Link from "next/link";

import type { Role } from "@/generated/prisma/enums";
import { SignOutButton } from "@/components/layout/sign-out-button";

export type NavItem = { href: string; label: string };

type AppShellProps = {
  user: { name: string; role: Role };
  navItems: readonly NavItem[];
  children: React.ReactNode;
};

export function AppShell({ user, navItems, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-amber-800">หมูกรอบพ่อแดกได้</p>
            <p className="truncate text-xs text-stone-500">
              {user.name} · {user.role}
            </p>
          </div>
          <SignOutButton />
        </div>
        <nav className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
