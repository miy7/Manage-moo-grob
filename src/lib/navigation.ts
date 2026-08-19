import { Role } from "@/generated/prisma/enums";

export type NavItem = { href: string; label: string };

const STAFF_NAV: readonly NavItem[] = [
  { href: "/pos", label: "ขายหน้าร้าน" },
  { href: "/orders", label: "ออเดอร์" },
];

const MANAGER_NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/pos", label: "ขายหน้าร้าน" },
  { href: "/orders", label: "ออเดอร์" },
  { href: "/products", label: "สินค้า" },
  { href: "/ingredients", label: "วัตถุดิบ" },
  { href: "/recipes", label: "สูตร" },
  { href: "/inventory", label: "สต็อก" },
  { href: "/costs", label: "ต้นทุน" },
  { href: "/reports", label: "รายงาน" },
];

const OWNER_NAV: readonly NavItem[] = [
  ...MANAGER_NAV,
  { href: "/users", label: "ผู้ใช้งาน" },
  { href: "/settings", label: "ตั้งค่า" },
  { href: "/audit-logs", label: "บันทึกระบบ" },
];

export function navItemsForRole(role: Role): readonly NavItem[] {
  if (role === Role.OWNER) return OWNER_NAV;
  if (role === Role.MANAGER) return MANAGER_NAV;
  return STAFF_NAV;
}
