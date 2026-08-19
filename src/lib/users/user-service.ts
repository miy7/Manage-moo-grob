import { headers } from "next/headers";

import type { Prisma } from "@/generated/prisma/client";
import { AuditAction, Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import {
  assertCanAssignRole,
  assertCanManageUser,
  canResetPassword,
} from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import type {
  ChangeRoleInput,
  CreateUserInput,
  ResetPasswordInput,
  SetUserActiveInput,
  UpdateUserInput,
  UserFilters,
} from "@/lib/validation/user";

const USER_ENTITY = "User";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TxClient = Prisma.TransactionClient;

async function hashPassword(password: string): Promise<string> {
  const ctx = await auth.$context;
  return ctx.password.hash(password);
}

async function findManagedUser(tx: TxClient, userId: string): Promise<UserListItem> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new AppError("ไม่พบผู้ใช้รายนี้", "NOT_FOUND");
  return user;
}

/** The system must always keep at least one active OWNER. */
async function assertNotLastActiveOwner(tx: TxClient, target: UserListItem): Promise<void> {
  if (target.role !== Role.OWNER || !target.active) return;

  const otherActiveOwners = await tx.user.count({
    where: { role: Role.OWNER, active: true, id: { not: target.id } },
  });
  if (otherActiveOwners === 0) {
    throw new AppError("ต้องมีเจ้าของ (OWNER) ที่ใช้งานอยู่อย่างน้อย 1 คน", "CONFLICT");
  }
}

async function revokeSessions(tx: TxClient, userId: string): Promise<void> {
  await tx.session.deleteMany({ where: { userId } });
}

export async function listUsers(filters: UserFilters): Promise<UserListItem[]> {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.active = filters.status === "active";
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUser(actor: SessionUser, input: CreateUserInput): Promise<UserListItem> {
  assertCanAssignRole(actor, input.role);

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.user.findUnique({ where: { email: input.email } });
    if (duplicate) throw new AppError("อีเมลนี้ถูกใช้งานแล้ว", "CONFLICT");

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        emailVerified: false,
        role: input.role,
        active: input.active,
        accounts: {
          create: {
            providerId: "credential",
            accountId: input.email,
            password: passwordHash,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog(
      {
        userId: actor.id,
        action: AuditAction.USER_CREATE,
        entity: USER_ENTITY,
        entityId: user.id,
        newValue: { name: user.name, email: user.email, role: user.role, active: user.active },
      },
      tx,
    );

    return user;
  });
}

export async function updateUser(actor: SessionUser, input: UpdateUserInput): Promise<UserListItem> {
  return prisma.$transaction(async (tx) => {
    const target = await findManagedUser(tx, input.userId);
    if (target.id !== actor.id) assertCanManageUser(actor, target);

    const updated = await tx.user.update({
      where: { id: target.id },
      data: { name: input.name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog(
      {
        userId: actor.id,
        action: AuditAction.USER_UPDATE,
        entity: USER_ENTITY,
        entityId: target.id,
        oldValue: { name: target.name },
        newValue: { name: updated.name },
      },
      tx,
    );

    return updated;
  });
}

export async function changeUserRole(actor: SessionUser, input: ChangeRoleInput): Promise<void> {
  if (input.userId === actor.id) {
    throw new AppError("ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้", "FORBIDDEN");
  }
  assertCanAssignRole(actor, input.role);

  await prisma.$transaction(async (tx) => {
    const target = await findManagedUser(tx, input.userId);
    assertCanManageUser(actor, target);
    if (target.role === input.role) return;
    if (input.role !== Role.OWNER) await assertNotLastActiveOwner(tx, target);

    await tx.user.update({ where: { id: target.id }, data: { role: input.role } });
    await revokeSessions(tx, target.id);

    await createAuditLog(
      {
        userId: actor.id,
        action: AuditAction.ROLE_CHANGE,
        entity: USER_ENTITY,
        entityId: target.id,
        oldValue: { role: target.role },
        newValue: { role: input.role },
      },
      tx,
    );
  });
}

export async function setUserActive(actor: SessionUser, input: SetUserActiveInput): Promise<void> {
  if (input.userId === actor.id) {
    throw new AppError("ไม่สามารถเปลี่ยนสถานะการใช้งานของตัวเองได้", "FORBIDDEN");
  }

  await prisma.$transaction(async (tx) => {
    const target = await findManagedUser(tx, input.userId);
    assertCanManageUser(actor, target);
    if (target.active === input.active) return;
    if (!input.active) await assertNotLastActiveOwner(tx, target);

    await tx.user.update({ where: { id: target.id }, data: { active: input.active } });
    if (!input.active) await revokeSessions(tx, target.id);

    await createAuditLog(
      {
        userId: actor.id,
        action: input.active ? AuditAction.USER_ENABLE : AuditAction.USER_DISABLE,
        entity: USER_ENTITY,
        entityId: target.id,
        oldValue: { active: target.active },
        newValue: { active: input.active },
      },
      tx,
    );
  });
}

export async function resetUserPassword(
  actor: SessionUser,
  input: ResetPasswordInput,
): Promise<void> {
  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction(async (tx) => {
    const target = await findManagedUser(tx, input.userId);
    if (!canResetPassword(actor, target)) {
      throw new AppError("คุณไม่มีสิทธิ์ตั้งรหัสผ่านใหม่ให้ผู้ใช้รายนี้", "FORBIDDEN");
    }

    const account = await tx.account.findFirst({
      where: { userId: target.id, providerId: "credential" },
      select: { id: true },
    });

    if (account) {
      await tx.account.update({ where: { id: account.id }, data: { password: passwordHash } });
    } else {
      await tx.account.create({
        data: {
          userId: target.id,
          providerId: "credential",
          accountId: target.email,
          password: passwordHash,
        },
      });
    }

    await revokeSessions(tx, target.id);

    await createAuditLog(
      {
        userId: actor.id,
        action: AuditAction.PASSWORD_RESET,
        entity: USER_ENTITY,
        entityId: target.id,
        metadata: { email: target.email },
      },
      tx,
    );
  });
}

export async function updateOwnProfile(actor: SessionUser, name: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const target = await findManagedUser(tx, actor.id);
    await tx.user.update({ where: { id: actor.id }, data: { name } });

    await createAuditLog(
      {
        userId: actor.id,
        action: AuditAction.USER_UPDATE,
        entity: USER_ENTITY,
        entityId: actor.id,
        oldValue: { name: target.name },
        newValue: { name },
        metadata: { self: true },
      },
      tx,
    );
  });
}

export async function changeOwnPassword(
  actor: SessionUser,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    console.error("[changeOwnPassword]", error);
    throw new AppError("รหัสผ่านปัจจุบันไม่ถูกต้อง", "INVALID");
  }

  await createAuditLog({
    userId: actor.id,
    action: AuditAction.PASSWORD_CHANGE,
    entity: USER_ENTITY,
    entityId: actor.id,
    metadata: { self: true },
  });
}
