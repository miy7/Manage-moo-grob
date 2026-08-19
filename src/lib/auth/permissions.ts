import { Role } from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

export type ManagedUser = { id: string; role: Role };

/** Roles an actor is allowed to assign when creating or editing a user. */
export function assignableRoles(actor: SessionUser): readonly Role[] {
  return actor.role === Role.OWNER ? [Role.OWNER, Role.MANAGER, Role.STAFF] : [Role.STAFF];
}

export function canAssignRole(actor: SessionUser, role: Role): boolean {
  return assignableRoles(actor).includes(role);
}

/** MANAGER may only manage STAFF; OWNER may manage anyone. */
export function canManageUser(actor: SessionUser, target: ManagedUser): boolean {
  if (actor.role === Role.OWNER) return true;
  if (actor.role !== Role.MANAGER) return false;
  return target.role === Role.STAFF;
}

export function canResetPassword(actor: SessionUser, target: ManagedUser): boolean {
  return actor.role === Role.OWNER && target.id !== actor.id;
}

export function assertCanManageUser(actor: SessionUser, target: ManagedUser): void {
  if (!canManageUser(actor, target)) {
    throw new AppError("คุณไม่มีสิทธิ์จัดการผู้ใช้รายนี้", "FORBIDDEN");
  }
}

export function assertCanAssignRole(actor: SessionUser, role: Role): void {
  if (!canAssignRole(actor, role)) {
    throw new AppError(`คุณไม่มีสิทธิ์กำหนดสิทธิ์ ${role}`, "FORBIDDEN");
  }
}
