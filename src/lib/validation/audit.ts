import { z } from "zod";

import { AuditAction } from "@/generated/prisma/enums";

export const auditLogFiltersSchema = z.object({
  action: z.enum(AuditAction).optional(),
  userId: z.cuid().optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;
