import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") return null;
  return session;
}

