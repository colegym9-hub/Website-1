"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type NurtureItem = {
  kind: "nurture"
  leadId: string
  name: string
  email: string
  service: string | null
  step: number
  templateKey: string
  reminderKey: string
  nextNurtureOn: string | null
  label: string
  subtitle: string
}

type RecycleItem = {
  kind: "recycle"
  leadId: string
  name: string
  email: string
  service: string | null
  reminderKey: string
  label: string
  subtitle: string
}

type WorkQueuePayload = {
  nurture: NurtureItem[]
  recycle: RecycleItem[]
  nurtureTotal: number
  recycleTotal: number
  workTotal: number
  recentLeadsCount: number
  timeZone?: string
}

function browserTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  } catch {
    return "America/New_York"
  }
}

export function AdminWorkQueueBell() {
  const [data, setData] = useState<WorkQueuePayload | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [introDismissed, setIntroDismissed] = useState(() => {
    if (typeof window === "undefined") return true
    return sessionStorage.getItem("ac_admin_queue_intro") === "1"
  })
  const wrapRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const tz = encodeURIComponent(browserTz())
    const r = await fetch(`/api/admin/work-queue?tz=${tz}`)
    const j = (await r.json()) as WorkQueuePayload & { error?: string }
    if (r.ok) setData(j)
  }, [])

  useEffect(() => {
    let cancelled = false
    const tz = encodeURIComponent(browserTz())
    fetch(`/api/admin/work-queue?tz=${tz}`)
      .then(async response => {
        const payload = (await response.json()) as WorkQueuePayload & { error?: string }
        if (!cancelled && response.ok) {
          setData(payload)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => void load(), 60_000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    if (!menuOpen) return
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [menuOpen])

  function dismissIntro() {
    sessionStorage.setItem("ac_admin_queue_intro", "1")
    setIntroDismissed(true)
  }

  async function archiveReminder(leadId: string, reminderKey: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await fetch("/api/admin/reminders/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, reminderKey }),
    })
    void load()
  }

  const workTotal = data?.workTotal ?? 0
  const recent = data?.recentLeadsCount ?? 0
  const badge = workTotal + (recent > 0 ? 1 : 0)
  const introOpen = !introDismissed && !!data && (workTotal > 0 || recent > 0)

  return (
    <>
      <div className="relative flex items-center" ref={wrapRef}>
        <button
          suppressHydrationWarning
          type="button"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(o => !o)
            void load()
          }}
          className="relative rounded-lg p-2 text-[var(--ac-text-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--ac-text)]"
          aria-label="Work queue and notifications"
        >
          <Bell className="size-5" />
          {badge > 0 ? (
            <span className="absolute right-0.5 top-0.5 min-w-[1.1rem] rounded-full bg-[var(--ac-accent)] px-1 text-center text-[10px] font-bold leading-tight text-[#0d2224]">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </button>
        {menuOpen && data ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] py-2 shadow-xl">
            <p className="border-b border-[var(--ac-divider)] px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
              Due soon (your time zone)
            </p>
            <p className="px-3 pb-2 text-[10px] text-[var(--ac-text-muted)]">
              Reminders start 8h before 9:00 AM on the scheduled date. Archive hides until the next touchpoint.
            </p>
            <div className="max-h-[min(70vh,360px)] overflow-y-auto px-2 py-2 text-sm">
              {data.nurture.length === 0 && data.recycle.length === 0 ? (
                <p className="px-2 py-3 text-xs text-[var(--ac-text-muted)]">Nothing in the reminder window right now.</p>
              ) : null}
              {data.nurture.slice(0, 14).map(n => (
                <div key={n.reminderKey} className="group flex items-start gap-1 rounded-md hover:bg-white/[0.06]">
                  <Link
                    href={`/admin/nurture-queue?lead=${n.leadId}`}
                    onClick={() => setMenuOpen(false)}
                    className="min-w-0 flex-1 px-2 py-2 text-[var(--ac-text)]"
                  >
                    <span className="font-medium text-[var(--ac-accent)]">{n.name}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--ac-text)]">{n.label}</span>
                    <span className="mt-0.5 block text-[10px] text-[var(--ac-text-muted)]">{n.subtitle}</span>
                  </Link>
                  <button
                    type="button"
                    title="Archive reminder"
                    className="shrink-0 rounded p-2 text-[var(--ac-text-muted)] opacity-60 hover:bg-white/[0.08] hover:text-[var(--ac-text)] group-hover:opacity-100"
                    onClick={e => void archiveReminder(n.leadId, n.reminderKey, e)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {data.recycle.slice(0, 10).map(n => (
                <div key={n.reminderKey} className="group flex items-start gap-1 rounded-md hover:bg-white/[0.06]">
                  <Link
                    href={`/admin/nurture-queue?lead=${n.leadId}&tab=recycle`}
                    onClick={() => setMenuOpen(false)}
                    className="min-w-0 flex-1 px-2 py-2 text-[var(--ac-text)]"
                  >
                    <span className="font-medium text-[var(--ac-accent)]">{n.name}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--ac-text)]">{n.label}</span>
                    <span className="mt-0.5 block text-[10px] text-[var(--ac-text-muted)]">{n.subtitle}</span>
                  </Link>
                  <button
                    type="button"
                    title="Archive reminder"
                    className="shrink-0 rounded p-2 text-[var(--ac-text-muted)] opacity-60 hover:bg-white/[0.08] hover:text-[var(--ac-text)] group-hover:opacity-100"
                    onClick={e => void archiveReminder(n.leadId, n.reminderKey, e)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {recent > 0 ? (
              <div className="border-t border-[var(--ac-divider)] px-3 py-2 text-xs text-[var(--ac-text-muted)]">
                {recent} new lead{recent === 1 ? "" : "s"} in the last 48 hours —{" "}
                <Link href="/admin/leads" className="text-[var(--ac-accent)] hover:underline" onClick={() => setMenuOpen(false)}>
                  view leads
                </Link>
              </div>
            ) : null}
            <div className="border-t border-[var(--ac-divider)] px-2 py-2">
              <Link
                href="/admin/calendar"
                className="block rounded-md px-2 py-1.5 text-center text-xs font-medium text-[var(--ac-accent)] hover:bg-white/[0.06]"
                onClick={() => setMenuOpen(false)}
              >
                Open calendar
              </Link>
              <Link
                href="/admin/nurture-queue"
                className="block rounded-md px-2 py-1.5 text-center text-xs font-medium text-[var(--ac-accent)] hover:bg-white/[0.06]"
                onClick={() => setMenuOpen(false)}
              >
                Open follow-ups queue
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={introOpen} onOpenChange={v => (v ? undefined : dismissIntro())}>
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">You have work in the queue</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--ac-text-muted)]">
            {workTotal > 0 ? (
              <>
                <strong className="text-[var(--ac-text)]">{workTotal}</strong> reminder
                {workTotal === 1 ? " is" : "s are"} active (within 8 hours of a scheduled send day). Open Follow-ups or
                the Calendar to act.
              </>
            ) : (
              <>No reminder-window emails right now.</>
            )}{" "}
            {recent > 0 ? (
              <>
                {" "}
                There {recent === 1 ? "is" : "are"} <strong className="text-[var(--ac-text)]">{recent}</strong> new lead
                {recent === 1 ? "" : "s"} in the last 48 hours (you also get an email when someone inquires).
              </>
            ) : null}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => dismissIntro()}>
              Got it
            </Button>
            {workTotal > 0 ? (
              <Button type="button" className="bg-[var(--ac-accent)] text-[#0d2224]" asChild>
                <Link href="/admin/nurture-queue" onClick={() => dismissIntro()}>
                  Go to follow-ups
                </Link>
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
