"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { AdminHubStats } from "@/lib/admin-hub-stats"

export type LeadTableRow = {
  id: string
  created_at: string | null
  name: string
  email: string
  service: string | null
  lead_tier: string | null
  lead_stage: string | null
  nurture_step?: number | null
  next_nurture_at?: string | null
  unsubscribed_at?: string | null
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">{label}</p>
      <p className="mt-2 font-heading text-3xl text-[var(--ac-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--ac-text-muted)]">{hint}</p>
    </div>
  )
}

function stageBadge(stage: string | null) {
  const s = stage || "—"
  return (
    <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--ac-text-muted)]">
      {s.replace(/_/g, " ")}
    </span>
  )
}

function tierBadge(tier: string | null) {
  if (!tier) return <span className="text-[var(--ac-text-muted)]">—</span>
  return (
    <span className="inline-block rounded-md bg-[var(--ac-accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ac-accent)]">
      {tier}
    </span>
  )
}

export function AdminLeadsDashboard({
  leads,
  stats,
  schemaPartial,
}: {
  leads: LeadTableRow[]
  stats: AdminHubStats
  schemaPartial: boolean
}) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return leads
    return leads.filter(
      row =>
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        (row.service || "").toLowerCase().includes(needle),
    )
  }, [leads, q])

  const hotInSample = useMemo(() => leads.filter(l => l.lead_tier === "hot").length, [leads])

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={stats.totalLeads} hint="in pipeline" />
        <StatCard label="New (7d)" value={stats.inquiries7d} hint="recent inquiries" />
        <StatCard
          label="Call booked"
          value={stats.funnelSchemaOk ? stats.callBooked : "—"}
          hint={stats.funnelSchemaOk ? "timestamp set" : "run DB migration"}
        />
        <StatCard
          label="FU due"
          value={stats.funnelSchemaOk ? stats.followUpsDue + stats.recycleDue : "—"}
          hint={stats.funnelSchemaOk ? "nurture + recycle queue" : "run DB migration"}
        />
        <StatCard label="Hot (sample)" value={hotInSample} hint="in this table (max 200)" />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ac-text-muted)]" />
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search name, email, service…"
          className="h-11 border-[var(--ac-divider)] bg-[var(--ac-bg-2)] pl-10 text-[var(--ac-text)] placeholder:text-[var(--ac-text-muted)]"
        />
      </div>
      <p className="text-xs text-[var(--ac-text-muted)]">
        Click a name to open the lead profile · Use{" "}
        <strong className="font-medium text-[var(--ac-accent)]">Follow-ups</strong> to send nurture and recycle emails when
        you’re ready.
      </p>

      <div className="overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Stage</th>
                {!schemaPartial ? (
                  <>
                    <th className="px-4 py-3">Nurture</th>
                    <th className="px-4 py-3">Queue</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={schemaPartial ? 5 : 7}
                    className="px-4 py-12 text-center text-[var(--ac-text-muted)]"
                  >
                    No leads match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--ac-divider)] last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--ac-text-muted)]">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${row.id}`}
                        className="font-medium text-[var(--ac-text)] hover:text-[var(--ac-accent)] hover:underline"
                      >
                        {row.name}
                      </Link>
                      <div className="max-w-[220px] truncate text-xs text-[var(--ac-text-muted)]">{row.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.service || "—"}</td>
                    <td className="px-4 py-3">{tierBadge(row.lead_tier)}</td>
                    <td className="px-4 py-3">{stageBadge(row.lead_stage)}</td>
                    {!schemaPartial ? (
                      <>
                        <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.nurture_step ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--ac-text-muted)]">
                          {(row.nurture_step ?? 0) > 0 ? "Manual" : "—"}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
