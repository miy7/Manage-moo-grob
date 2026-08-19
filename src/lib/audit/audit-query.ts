import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import type { AuditLogFilters } from "@/lib/validation/audit";

const PAGE_SIZE = 100;

export type AuditLogRow = {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  createdAt: Date;
  user: { id: string; name: string; email: string } | null;
};

export type AuditActor = { id: string; name: string };

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogRow[]> {
  const where: Prisma.AuditLogWhereInput = {};
  if (filters.action) where.action = filters.action;
  if (filters.userId) where.userId = filters.userId;

  if (filters.from || filters.to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.from) createdAt.gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to) createdAt.lte = new Date(`${filters.to}T23:59:59.999Z`);
    where.createdAt = createdAt;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function listAuditLogActors(): Promise<AuditActor[]> {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
