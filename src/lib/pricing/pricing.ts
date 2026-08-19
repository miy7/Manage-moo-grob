import { Prisma } from "@/generated/prisma/client";
import { SETTING_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env";

export const MONEY_DECIMALS = 2;
export const QUANTITY_DECIMALS = 4;

/**
 * Default selling price per unit ("ขีด"), used when no Setting row and no
 * product-level price is available. Single source of truth for the base price.
 */
export function getDefaultPricePerUnit(): Prisma.Decimal {
  return new Prisma.Decimal(getServerEnv().PRICE_PER_UNIT);
}

/** Reads the configured price per unit from the database, falling back to env. */
export async function getPricePerUnit(): Promise<Prisma.Decimal> {
  const setting = await prisma.setting.findUnique({
    where: { key: SETTING_KEYS.pricePerUnit },
  });

  if (!setting) return getDefaultPricePerUnit();

  const value = new Prisma.Decimal(setting.value);
  return value.isFinite() && value.greaterThan(0) ? value : getDefaultPricePerUnit();
}

/** Rounds money to 2 decimals, half-up, as used for THB amounts. */
export function roundMoney(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(MONEY_DECIMALS, Prisma.Decimal.ROUND_HALF_UP);
}

/** Server-side line total: unitPrice x quantity, rounded to satang. */
export function calculateSubtotal(
  unitPrice: Prisma.Decimal,
  quantity: Prisma.Decimal,
): Prisma.Decimal {
  return roundMoney(unitPrice.mul(quantity));
}

export function formatTHB(value: Prisma.Decimal | number | string): string {
  const amount = new Prisma.Decimal(value).toDecimalPlaces(MONEY_DECIMALS).toNumber();
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}
