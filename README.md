# Moo Grob Por Daek Dai

ระบบบริหารจัดการร้านหมูกรอบ: ขาย (POS), ต้นทุน, สต็อก, กำไร, พนักงาน และรายงาน

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS 4
- PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`)
- Better Auth (email + password, role-based)
- Zod 4 validation
- pnpm

Timezone `Asia/Bangkok`, currency `THB`. เงินและปริมาณทั้งหมดใช้ `Decimal` ไม่ใช้ float

## Getting started

```bash
pnpm install
cp .env.example .env      # แล้วกรอกค่าให้ครบ
pnpm db:migrate           # สร้าง schema
pnpm db:seed              # สร้างผู้ใช้ตั้งต้นและค่า PRICE_PER_UNIT
pnpm dev
```

### Seed accounts (development only)

| Role    | Email                   | Password      |
| ------- | ----------------------- | ------------- |
| OWNER   | owner@moogrob.local     | owner12345    |
| MANAGER | manager@moogrob.local   | manager12345  |
| STAFF   | staff@moogrob.local     | staff12345    |

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Dev server                           |
| `pnpm build`     | Production build (runs `prisma generate`) |
| `pnpm lint`      | ESLint                               |
| `pnpm typecheck` | `tsc --noEmit`                       |
| `pnpm db:migrate`| Prisma migrate dev                   |
| `pnpm db:deploy` | Prisma migrate deploy                |
| `pnpm db:seed`   | Seed users + settings                |
| `pnpm db:studio` | Prisma Studio                        |

## Structure

```
prisma/            schema.prisma, migrations, seed.ts
src/app/(auth)/    /login
src/app/(staff)/   /pos, /orders
src/app/(admin)/   /dashboard, /products, /ingredients, ...
src/app/api/       route handlers (auth, payment, orders, ...)
src/components/    UI components (auth, layout, pos, ...)
src/lib/           business logic: auth, db, pricing, validation
```

Business logic อยู่ใน `src/lib` เท่านั้น — UI ไม่คำนวณราคาหรือสิทธิ์เอง

## Authorization

`src/lib/auth/roles.ts` เก็บ mapping ระหว่าง route กับ role และถูกบังคับใช้ฝั่ง server
(`requireUser`, `requireRole`, `requireRouteAccess`) ส่วน `src/proxy.ts` กันเฉพาะผู้ที่ยังไม่ล็อกอิน
การซ่อน UI ไม่ถือเป็นการป้องกันสิทธิ์
