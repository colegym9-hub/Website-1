import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase-server"

export function parseAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST || ""
  return raw
    .split(/[,;\s]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string): boolean {
  return parseAdminAllowlist().includes(email.trim().toLowerCase())
}

export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email || !isAdminEmail(user.email)) return null
    return user
  } catch {
    return null
  }
}

export async function requireAdminUser(): Promise<User> {
  const user = await getAdminUser()
  if (!user) redirect("/admin/login")
  return user
}
