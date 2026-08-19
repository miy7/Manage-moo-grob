/** Error whose message is safe to display to the end user. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID" = "INVALID",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const GENERIC_ERROR = "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง";

/**
 * Runs a server action body and converts thrown errors into a safe result.
 * Internal details (stack traces, database errors) stay in the server log.
 */
export async function runAction<T>(
  name: string,
  body: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await body() };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message };
    }
    console.error(`[action:${name}]`, error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
