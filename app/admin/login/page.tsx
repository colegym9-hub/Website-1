"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

function friendlyAuthError(error: { message?: string; status?: number }): string {
  const msg = (error.message || "").toLowerCase()
  if (error.status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many login emails were sent recently. Wait 15–60 minutes, then try once. Supabase limits OTPs per hour per project — check Authentication → Rate limits in the Supabase dashboard if you need higher limits. You can also use “Continue with Google” below if that’s enabled."
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "That email address could not be used. Check spelling or try another allowlisted address."
  }
  return error.message || "Could not send the link. Check env vars and that your email is on the admin allowlist."
}

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const denied = searchParams.get("denied") === "1"
  const sessionErr = searchParams.get("error") === "session"

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [oauthLoading, setOauthLoading] = useState(false)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return null
    return createBrowserClient(url, anon)
  }

  async function signInWithGoogle() {
    setErrorDetail(null)
    const supabase = getSupabase()
    if (!supabase) {
      setErrorDetail("Missing Supabase environment variables.")
      return
    }
    setOauthLoading(true)
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    })
    setOauthLoading(false)
    if (error) {
      console.error(error)
      setErrorDetail(error.message || "Google sign-in could not start. Check that Google is enabled in Supabase → Authentication → Providers.")
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    setErrorDetail(null)
    setStatus("sending")
    const supabase = getSupabase()
    if (!supabase) {
      setErrorDetail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
      setStatus("error")
      return
    }
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${origin}/auth/callback` },
    })
    if (error) {
      console.error(error)
      setErrorDetail(friendlyAuthError(error))
      setStatus("error")
      return
    }
    setStatus("sent")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-[#2a2a2a] rounded-xl p-8 bg-[#111]">
        <h1 className="font-heading text-xl text-white mb-1">Admin</h1>
        <p className="text-[#666] text-sm mb-6">
          Sign in with Google, or use a magic link with an allowlisted email.
        </p>

        {denied && (
          <p className="text-amber-200/90 text-xs mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 leading-relaxed">
            That account’s email is not on the admin list. Use a Google account whose email matches{" "}
            <code className="text-[#ccc]">ADMIN_EMAIL_ALLOWLIST</code>, or ask whoever runs the site to add your
            address there.
          </p>
        )}
        {sessionErr && (
          <p className="text-amber-200/90 text-xs mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50">
            Login session could not be completed. Try again, or use a different sign-in method.
          </p>
        )}

        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          disabled={oauthLoading}
          className="w-full py-2.5 rounded-lg border border-[#444] bg-white text-[#111] text-sm font-medium hover:bg-[#f5f5f5] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {oauthLoading ? (
            "Redirecting…"
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#333]" />
          <span className="text-[10px] uppercase tracking-widest text-[#555]">or magic link</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>

        <form onSubmit={sendLink} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              if (status === "error") {
                setStatus("idle")
                setErrorDetail(null)
              }
            }}
            placeholder="you@domain.com"
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555]"
          />
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="py-2 rounded-lg bg-[var(--ac-accent)] text-[#0d2224] text-sm font-medium disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : status === "sent" ? "Link sent" : "Send link"}
          </button>
        </form>
        {status === "sent" && <p className="text-[#7fb8be] text-xs mt-4">Check your email for the login link.</p>}
        {status === "error" && errorDetail && (
          <p className="text-amber-200/90 text-xs mt-4 leading-relaxed">{errorDetail}</p>
        )}
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
