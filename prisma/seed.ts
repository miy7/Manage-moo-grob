import "dotenv/config";

import { Role } from "../src/generated/prisma/enums";
import { auth } from "../src/lib/auth/auth";
import { SETTING_KEYS } from "../src/lib/constants";
import { prisma } from "../src/lib/db/prisma";
import { getServerEnv } from "../src/lib/env";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const SEED_USERS: readonly SeedUser[] = [
  { name: "Owner", email: "owner@moogrob.local", password: "owner12345", role: Role.OWNER },
  { name: "Manager", email: "manager@moogrob.local", password: "manager12345", role: Role.MANAGER },
  { name: "Yim", email: "staff@moogrob.local", password: "staff12345", role: Role.STAFF },
];

async function seedUser(user: SeedUser): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    if (existing.role !== user.role) {
      await prisma.user.update({ where: { id: existing.id }, data: { role: user.role } });
    }
    return;
  }

  await auth.api.signUpEmail({
    body: { name: user.name, email: user.email, password: user.password },
  });
  await prisma.user.update({ where: { email: user.email }, data: { role: user.role } });
}

async function main(): Promise<void> {
  for (const user of SEED_USERS) {
    await seedUser(user);
  }

  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.pricePerUnit },
    update: {},
    create: {
      key: SETTING_KEYS.pricePerUnit,
      value: String(getServerEnv().PRICE_PER_UNIT),
    },
  });

  console.log(`Seeded ${SEED_USERS.length} users and base settings.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
