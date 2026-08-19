import { UserFiltersBar } from "@/components/users/user-filters-bar";
import { UserList } from "@/components/users/user-list";
import { assignableRoles } from "@/lib/auth/permissions";
import { requireRouteAccess } from "@/lib/auth/session";
import { listUsers } from "@/lib/users/user-service";
import { userFiltersSchema } from "@/lib/validation/user";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireRouteAccess("/users");
  const params = await searchParams;

  const parsedFilters = userFiltersSchema.safeParse({
    role: firstValue(params.role),
    status: firstValue(params.status),
    q: firstValue(params.q),
  });
  const filters = parsedFilters.success ? parsedFilters.data : {};
  const users = await listUsers(filters);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">ผู้ใช้งาน</h1>
        <p className="text-sm text-stone-600">จัดการบัญชีพนักงาน สิทธิ์การใช้งาน และรหัสผ่าน</p>
      </div>

      <UserFiltersBar filters={filters} />
      <UserList users={users} actor={actor} assignableRoles={[...assignableRoles(actor)]} />
    </section>
  );
}
