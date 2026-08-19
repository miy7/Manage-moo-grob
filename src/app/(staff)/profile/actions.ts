"use server";

import { revalidatePath } from "next/cache";

import { requireActor } from "@/lib/auth/session";
import { AppError, runAction, type ActionResult } from "@/lib/errors";
import { changeOwnPassword, updateOwnProfile } from "@/lib/users/user-service";
import { changePasswordSchema, updateProfileSchema } from "@/lib/validation/user";

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  return runAction("updateProfile", async () => {
    const actor = await requireActor();
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", "INVALID");
    }

    await updateOwnProfile(actor, parsed.data.name);
    revalidatePath("/profile");
    return undefined;
  });
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  return runAction("changePassword", async () => {
    const actor = await requireActor();
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", "INVALID");
    }

    await changeOwnPassword(actor, parsed.data.currentPassword, parsed.data.newPassword);
    return undefined;
  });
}
