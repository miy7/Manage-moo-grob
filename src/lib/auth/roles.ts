import { Role } from "@/generated/prisma/enums";

export const ROLES = [Role.OWNER, Role.MANAGER, Role.STAFF] as const;

export const ADMIN_ROLES: readonly Role[] = [Role.OWNER, Role.MANAGER];

/** Landing route after login, per role. */
export function defaultRouteForRole(role: Role): string {
  return role === Role.STAFF ? "/pos" : "/dashboard";
}

/** Route prefixes each role is allowed to access. Enforced on the server. */
const ROUTE_PERMISSIONS: Record<string, readonly Role[]> = {
  "/pos": ROLES,
  "/orders": ROLES,
  "/profile": ROLES,
  "/dashboard": ADMIN_ROLES,
  "/products": ADMIN_ROLES,
  "/ingredients": ADMIN_ROLES,
  "/recipes": ADMIN_ROLES,
  "/inventory": ADMIN_ROLES,
  "/costs": ADMIN_ROLES,
  "/reports": ADMIN_ROLES,
  "/users": [Role.OWNER],
  "/settings": [Role.OWNER],
  "/audit-logs": [Role.OWNER],
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  const entry = Object.entries(ROUTE_PERMISSIONS)
    .filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (!entry) return true;
  return entry[1].includes(role);
}

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}
