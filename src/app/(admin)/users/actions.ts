"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireActor } from "@/lib/auth/session";
import { AppError, runAction, type ActionResult } from "@/lib/errors";
import {
  changeUserRole,
  createUser,
  resetUserPassword,
  setUserActive,
  updateUser,
} from "@/lib/users/user-service";
import {
  changeRoleSchema,
  createUserSchema,
  resetPasswordSchema,
  setUserActiveSchema,
  updateUserSchema,
} from "@/lib/validation/user";
import type { z } from "zod";

function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", "INVALID");
  }
  return parsed.data;
}

export async function createUserAction(input: unknown): Promise<ActionResult> {
  return runAction("createUser", async () => {
    const actor = await requireActor(ADMIN_ROLES);
    await createUser(actor, parse(createUserSchema, input));
    revalidatePath("/users");
    return undefined;
  });
}

export async function updateUserAction(input: unknown): Promise<ActionResult> {
  return runAction("updateUser", async () => {
    const actor = await requireActor(ADMIN_ROLES);
    await updateUser(actor, parse(updateUserSchema, input));
    revalidatePath("/users");
    return undefined;
  });
}

export async function changeUserRoleAction(input: unknown): Promise<ActionResult> {
  return runAction("changeUserRole", async () => {
    const actor = await requireActor(ADMIN_ROLES);
    await changeUserRole(actor, parse(changeRoleSchema, input));
    revalidatePath("/users");
    return undefined;
  });
}

export async function setUserActiveAction(input: unknown): Promise<ActionResult> {
  return runAction("setUserActive", async () => {
    const actor = await requireActor(ADMIN_ROLES);
    await setUserActive(actor, parse(setUserActiveSchema, input));
    revalidatePath("/users");
    return undefined;
  });
}

export async function resetUserPasswordAction(input: unknown): Promise<ActionResult> {
  return runAction("resetUserPassword", async () => {
    const actor = await requireActor(ADMIN_ROLES);
    await resetUserPassword(actor, parse(resetPasswordSchema, input));
    revalidatePath("/users");
    return undefined;
  });
}
