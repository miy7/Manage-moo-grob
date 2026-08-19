import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
  password: z.string().min(8, { message: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
