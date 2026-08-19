import { z } from "zod";

import { Role } from "@/generated/prisma/enums";

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" })
  .max(80, { message: "ชื่อยาวเกินไป" });

const emailSchema = z
  .email({ message: "รูปแบบอีเมลไม่ถูกต้อง" })
  .transform((value) => value.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
  .max(72, { message: "รหัสผ่านยาวเกินไป" })
  .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
    message: "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข",
  });

export const roleSchema = z.enum(Role, { message: "สิทธิ์ผู้ใช้ไม่ถูกต้อง" });

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  active: z.boolean(),
});

export const updateUserSchema = z.object({
  userId: z.cuid({ message: "ผู้ใช้ไม่ถูกต้อง" }),
  name: nameSchema,
});

export const changeRoleSchema = z.object({
  userId: z.cuid({ message: "ผู้ใช้ไม่ถูกต้อง" }),
  role: roleSchema,
});

export const setUserActiveSchema = z.object({
  userId: z.cuid({ message: "ผู้ใช้ไม่ถูกต้อง" }),
  active: z.boolean(),
});

export const resetPasswordSchema = z.object({
  userId: z.cuid({ message: "ผู้ใช้ไม่ถูกต้อง" }),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "กรุณากรอกรหัสผ่านปัจจุบัน" }),
  newPassword: passwordSchema,
});

export const userFiltersSchema = z.object({
  role: roleSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  q: z.string().trim().max(80).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type SetUserActiveInput = z.infer<typeof setUserActiveSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
