import type { AuditAction } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

type JsonObject = Record<string, unknown>;

type AuditLogInput = {
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  oldValue?: JsonObject | null;
  newValue?: JsonObject | null;
  metadata?: JsonObject | null;
};

const SENSITIVE_KEYS = ["password", "newpassword", "currentpassword", "token", "secret", "hash"];

function isSensitive(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive));
}

/** Drops password/secret-like keys so they can never reach the audit trail. */
export function sanitizeAuditValue(value: JsonObject | null | undefined): Prisma.InputJsonValue | undefined {
  if (!value) return undefined;

  const clean: JsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isSensitive(key)) continue;
    clean[key] = entry instanceof Date ? entry.toISOString() : entry;
  }
  return clean as Prisma.InputJsonValue;
}

type AuditClient = Pick<typeof prisma, "auditLog">;

/** Single entry point for audit logging; pass `tx` to join an open transaction. */
export async function createAuditLog(input: AuditLogInput, tx: AuditClient = prisma): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      oldValue: sanitizeAuditValue(input.oldValue),
      newValue: sanitizeAuditValue(input.newValue),
      metadata: sanitizeAuditValue(input.metadata),
    },
  });
}
