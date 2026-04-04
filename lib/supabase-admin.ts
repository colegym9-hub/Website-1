import { createClient } from "@supabase/supabase-js"

let warnedAnonKey = false

function jwtPayloadRole(jwt: string): string | null {
  try {
    const part = jwt.split(".")[1]
    if (!part) return null
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4))
    const o = JSON.parse(Buffer.from(b64 + pad, "base64").toString("utf8")) as { role?: string }
    return o.role ?? null
  } catch {
    return null
  }
}

/** Server-only Supabase client with service role — bypasses RLS. Never import from client components. */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null

  if (!warnedAnonKey && jwtPayloadRole(key) === "anon") {
    warnedAnonKey = true
    console.error(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY looks like the anon key (role=anon). Use the service_role secret from Dashboard → Settings → API or inserts will hit RLS and fail.",
    )
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
