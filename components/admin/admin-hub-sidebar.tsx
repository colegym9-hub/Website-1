"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { BarChart3, CalendarDays, Inbox, LogOut, Mail, Sliders, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function HubNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "border-l-2 border-[var(--ac-accent)] bg-[var(--ac-accent-soft)] pl-[calc(0.75rem-2px)] text-[var(--ac-text)]"
          : "border-l-2 border-transparent text-[var(--ac-text-muted)] hover:bg-white/[0.04] hover:text-[var(--ac-text)]",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-90" />
      {label}
    </Link>
  )
}

function FollowUpsNavLink({ active }: { active: boolean }) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York")
        const r = await fetch(`/api/admin/nurture-due/count?tz=${tz}`)
        const j = (await r.json()) as { nurture?: number; recycle?: number }
        if (!cancelled) setTotal((j.nurture ?? 0) + (j.recycle ?? 0))
      } catch {
        if (!cancelled) setTotal(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Link
      href="/admin/nurture-queue"
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "border-l-2 border-[var(--ac-accent)] bg-[var(--ac-accent-soft)] pl-[calc(0.75rem-2px)] text-[var(--ac-text)]"
          : "border-l-2 border-transparent text-[var(--ac-text-muted)] hover:bg-white/[0.04] hover:text-[var(--ac-text)]",
      )}
    >
      <span className="flex items-center gap-3">
        <Inbox className="size-4 shrink-0 opacity-90" />
        Follow-ups
      </span>
      {total !== null && total > 0 ? (
        <span className="min-w-[1.35rem] rounded-full bg-[var(--ac-accent)]/25 px-1.5 py-0.5 text-center text-[10px] font-semibold text-[var(--ac-accent)]">
          {total > 99 ? "99+" : total}
        </span>
      ) : null}
    </Link>
  )
}

export function AdminHubSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const signOut = useCallback(async () => {
    setSigningOut(true)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && anon) {
      const supabase = createBrowserClient(url, anon)
      await supabase.auth.signOut()
    }
    router.replace("/admin/login")
    router.refresh()
    setSigningOut(false)
  }, [router])

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--ac-divider)] bg-[var(--ac-surface)] md:h-screen md:w-[240px] md:border-b-0 md:border-r">
      <div className="border-b border-[var(--ac-divider)] px-4 py-5 md:px-5">
        <p className="font-heading text-lg tracking-wide text-[var(--ac-text)]">A.C MEDIA</p>
        <p className="mt-0.5 text-xs text-[var(--ac-text-muted)]">Admin · Lead funnel</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
            Main
          </p>
          <div className="flex flex-col gap-0.5">
            <HubNavLink
              href="/admin/leads"
              label="Leads"
              icon={Users}
              active={pathname === "/admin/leads" || pathname.startsWith("/admin/leads/")}
            />
            <FollowUpsNavLink active={pathname.startsWith("/admin/nurture-queue")} />
            <HubNavLink
              href="/admin/calendar"
              label="Calendar"
              icon={CalendarDays}
              active={pathname.startsWith("/admin/calendar")}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
            Insights
          </p>
          <div className="flex flex-col gap-0.5">
            <HubNavLink href="/admin/summary" label="Summary" icon={BarChart3} active={pathname === "/admin/summary"} />
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
            Config
          </p>
          <div className="flex flex-col gap-0.5">
            <HubNavLink
              href="/admin/templates"
              label="Templates"
              icon={Mail}
              active={pathname === "/admin/templates"}
            />
            <HubNavLink
              href="/admin/settings"
              label="Automation"
              icon={Sliders}
              active={pathname === "/admin/settings"}
            />
          </div>
        </div>
      </nav>

      <div className="border-t border-[var(--ac-divider)] p-3">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-[var(--ac-text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--ac-text)] disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  )
}
