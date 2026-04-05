"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

function passwordErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Wrong email or password."
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email in Supabase first (Authentication → Users), or disable “Confirm email” for this project while testing."
  }
  return message || "Sign-in failed."
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const denied = searchParams.get("denied") === "1"
  const sessionErr = searchParams.get("error") === "session"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return null
    return createBrowserClient(url, anon)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorDetail(null)
    const supabase = getSupabase()
    if (!supabase) {
      setErrorDetail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoading(false)
      setErrorDetail(passwordErrorMessage(error.message))
      return
    }

    const verify = await fetch("/api/admin/verify-access", {
      method: "POST",
      credentials: "include",
    })
    setLoading(false)

    if (verify.status === 200) {
      router.replace("/admin/leads")
      router.refresh()
      return
    }

    await supabase.auth.signOut()
    if (verify.status === 403) {
      setErrorDetail(
        "This email is not on the admin list. Add it to ADMIN_EMAIL_ALLOWLIST in your environment, redeploy, and try again.",
      )
      return
    }
    setErrorDetail("Could not verify access. Try again.")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-[#2a2a2a] rounded-xl p-8 bg-[#111]">
        <h1 className="font-heading text-xl text-white mb-1">Admin</h1>
        <p className="text-[#666] text-sm mb-6">Sign in with the email and password for your Supabase user.</p>

        {denied && (
          <p className="text-amber-200/90 text-xs mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 leading-relaxed">
            That account is not allowed for admin. Your email must appear in{" "}
            <code className="text-[#ccc]">ADMIN_EMAIL_ALLOWLIST</code> (same value as in your hosting env).
          </p>
        )}
        {sessionErr && (
          <p className="text-amber-200/90 text-xs mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50">
            Session could not be completed. Sign in below.
          </p>
        )}

        <form onSubmit={e => void onSubmit(e)} className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-widest text-[#555]">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              setErrorDetail(null)
            }}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555]"
            placeholder="you@domain.com"
          />
          <label className="text-[10px] uppercase tracking-widest text-[#555] mt-1">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setErrorDetail(null)
            }}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555]"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-lg bg-[var(--ac-accent)] text-[#0d2224] text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {errorDetail && <p className="text-amber-200/90 text-xs mt-4 leading-relaxed">{errorDetail}</p>}

        <p className="text-[#555] text-[11px] mt-6 leading-relaxed">
          User must exist in Supabase → Authentication → Users, with email/password enabled. New user: “Add user” and
          set a password, or invite flow. Your env <code className="text-[#777]">ADMIN_EMAIL_ALLOWLIST</code> must include
          that user’s email.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#666] text-sm">Loading…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
