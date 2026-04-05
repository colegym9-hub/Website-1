import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isAdminEmail } from "@/lib/admin-auth"

/** After password (or any) sign-in, confirms session exists and email is on ADMIN_EMAIL_ALLOWLIST. */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ ok: false, reason: "misconfigured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ ok: false, reason: "no_session" }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    return NextResponse.json({ ok: false, reason: "not_allowlisted" }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
