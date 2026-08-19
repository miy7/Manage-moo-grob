import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();

export const auth = betterAuth({
  appName: "Moo Grob Por Daek Dai",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: Role.STAFF,
        input: false,
      },
      active: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        /** Disabled accounts must not be able to obtain a session. */
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });
          if (!user?.active) {
            throw new APIError("FORBIDDEN", { message: "บัญชีนี้ถูกปิดใช้งาน" });
          }
          return { data: session };
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
