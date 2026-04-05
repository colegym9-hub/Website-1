"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CalItem = {
  date: string
  kind: string
  leadId: string
  name: string
  title: string
  subtitle?: string
}

type Payload = {
  year: number
  month: number
  start: string
  end: string
  events: { date: string; items: CalItem[] }[]
}

const KIND_DOT: Record<string, string> = {
  nurture: "bg-teal-400",
  recycle: "bg-amber-400",
  call: "bg-sky-400",
  shoot: "bg-violet-400",
  completed: "bg-neutral-400",
}

function calendarSchemaHint(message: string): string | null {
  if (!/does not exist/i.test(message)) return null
  if (
    /next_nurture_on|completed_at|admin_reminder_dismissals/i.test(message)
  ) {
    return (
      "Apply the migration that adds calendar columns: open Supabase → SQL Editor, paste and run " +
      "`supabase/migrations/20260406180000_admin_calendar_reminders.sql`, or from this repo run " +
      "`npx supabase link` (once) then `npx supabase db push`."
    )
  }
  return null
}

export function AdminCalendarMonth() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<Payload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const r = await fetch(`/api/admin/calendar?year=${year}&month=${month}`)
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || "Failed")
      setData(j as Payload)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    void load()
  }, [load])

  const byDate = useMemo(() => {
    const m = new Map<string, CalItem[]>()
    for (const block of data?.events ?? []) {
      m.set(block.date, block.items)
    }
    return m
  }, [data])

  const label = useMemo(() => {
    return new Date(year, month - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" })
  }, [year, month])

  const gridDays = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const last = new Date(year, month, 0)
    const startPad = (first.getDay() + 6) % 7
    const daysInMonth = last.getDate()
    const cells: { ymd: string | null; inMonth: boolean }[] = []
    for (let i = 0; i < startPad; i++) cells.push({ ymd: null, inMonth: false })
    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      cells.push({ ymd, inMonth: true })
    }
    while (cells.length % 7 !== 0) cells.push({ ymd: null, inMonth: false })
    return cells
  }, [year, month])

  function prevMonth() {
    if (month <= 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month >= 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else setMonth(m => m + 1)
  }

  const errSchemaHint = err ? calendarSchemaHint(err) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="border-[var(--ac-divider)]" onClick={prevMonth}>
            ←
          </Button>
          <h2 className="min-w-[10rem] text-center font-heading text-lg text-[var(--ac-text)]">{label}</h2>
          <Button type="button" variant="outline" size="sm" className="border-[var(--ac-divider)]" onClick={nextMonth}>
            →
          </Button>
        </div>
        <Button type="button" variant="outline" size="sm" className="border-[var(--ac-divider)]" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {loading ? <p className="text-sm text-[var(--ac-text-muted)]">Loading…</p> : null}
      {err ? (
        <div className="rounded-lg border border-red-500/35 bg-red-500/10 p-3 text-sm">
          <p className="text-red-300">{err}</p>
          {errSchemaHint ? <p className="mt-2 text-[var(--ac-text-muted)] leading-relaxed">{errSchemaHint}</p> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((cell, i) => {
            if (!cell.ymd) {
              return <div key={`e-${i}`} className="min-h-[5.5rem] rounded-lg bg-transparent" />
            }
            const items = byDate.get(cell.ymd) ?? []
            return (
              <div
                key={cell.ymd}
                className={`flex min-h-[5.5rem] flex-col rounded-lg border border-[var(--ac-divider)] p-1.5 text-left ${
                  items.length ? "bg-[var(--ac-bg-2)]" : "bg-[var(--ac-bg)]"
                }`}
              >
                <span className="text-[11px] font-semibold text-[var(--ac-text-muted)]">
                  {Number(cell.ymd.slice(8, 10))}
                </span>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {items.slice(0, 4).map((it, j) => (
                    <span
                      key={`${it.leadId}-${j}`}
                      className={`size-1.5 rounded-full ${KIND_DOT[it.kind] ?? "bg-[var(--ac-accent)]"}`}
                      title={`${it.name}: ${it.title}`}
                    />
                  ))}
                  {items.length > 4 ? (
                    <span className="text-[9px] text-[var(--ac-text-muted)]">+{items.length - 4}</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {data?.events.length ? (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">This month</h3>
          <ul className="space-y-3">
            {data.events.map(block => (
              <li key={block.date} className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-4">
                <p className="text-sm font-medium text-[var(--ac-accent)]">
                  {new Date(block.date + "T12:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {block.items.map(it => (
                    <li key={`${it.leadId}-${it.kind}-${it.title}`} className="text-[var(--ac-text)]">
                      <Link href={`/admin/leads/${it.leadId}`} className="font-medium text-[var(--ac-accent)] hover:underline">
                        {it.name}
                      </Link>
                      <span className="text-[var(--ac-text-muted)]"> — {it.title}</span>
                      {it.subtitle ? (
                        <span className="mt-0.5 block text-xs text-[var(--ac-text-muted)]">{it.subtitle}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : !loading && !err ? (
        <p className="text-sm text-[var(--ac-text-muted)]">No calendar items this month. Set dates on lead records.</p>
      ) : null}
    </div>
  )
}
