import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { canAccessRoute, hasAnyRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

/**
 * Returns the current user, re-read from the database so that role and active
 * status can never be stale (or forged) relative to the session payload.
 * Returns null when unauthenticated or the account has been disabled.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user || !user.active) return null;
  return user;
}

/** Requires an authenticated, active user; redirects to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
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
  if (!hasAnyRole(user.role, roles)) redirect("/pos");
  return user;
}

/**
 * Same checks as `requireUser`, but for server actions and route handlers:
 * throws instead of redirecting so the caller can return a safe error.
 */
export async function requireActor(roles?: readonly Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("กรุณาเข้าสู่ระบบ", "UNAUTHORIZED");
  if (roles && !hasAnyRole(user.role, roles)) {
    throw new AppError("คุณไม่มีสิทธิ์ทำรายการนี้", "FORBIDDEN");
  }
  return user;
}
