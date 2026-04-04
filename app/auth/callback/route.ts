import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isAdminEmail } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/admin/leads"

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!code || !supabaseUrl || !supabaseAnon) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
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

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(new URL(`/admin/login?error=session`, request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    const login = new URL("/admin/login", request.url)
    login.searchParams.set("denied", "1")
    return NextResponse.redirect(login)
  }

  return NextResponse.redirect(new URL(next, request.url))
}
