import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.url(),
  THUNDER_API_KEY: z.string().default(""),
  PROMPTPAY_ID: z.string().default(""),
  PROMPTPAY_TYPE: z.enum(["PHONE", "NATIONAL_ID", "EWALLET"]).default("PHONE"),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().default(""),
  LINE_TARGET_ID: z.string().default(""),
  PRICE_PER_UNIT: z.coerce.number().positive().default(80),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Parses and caches server-side environment variables. Never import from client components. */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${z.prettifyError(parsed.error)}`);
  }

  cached = parsed.data;
  return cached;
}
