import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { canAccessRoute } from "@/lib/auth/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

function toRole(value: unknown): Role {
  return value === Role.OWNER || value === Role.MANAGER ? value : Role.STAFF;
}

/** Returns the current user, or null when unauthenticated. Server-only. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toRole((user as { role?: unknown }).role),
    active: (user as { active?: boolean }).active ?? true,
  };
}

/** Requires an authenticated, active user; redirects to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.active) redirect("/login");
  return user;
}

/** Requires an authenticated user allowed to access `pathname`. */
export async function requireRouteAccess(pathname: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccessRoute(user.role, pathname)) redirect("/pos");
  return user;
}

/** Requires the user to hold one of `roles`; redirects otherwise. */
export async function requireRole(roles: readonly Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/pos");
  return user;
}
