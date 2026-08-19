import { redirect } from "next/navigation";

import { defaultRouteForRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? defaultRouteForRole(user.role) : "/login");
}
