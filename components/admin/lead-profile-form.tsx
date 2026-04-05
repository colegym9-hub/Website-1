"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { STAGE_OPTIONS } from "@/lib/stage-metadata"
import { templateKeyForCronStep } from "@/lib/nurture-schedule"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"
import { Button } from "@/components/ui/button"

type Lead = Record<string, unknown> & { id: string }

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return ""
  return String(iso).slice(0, 10)
}

function dateInputToNoonIso(ymd: string): string | null {
  const t = ymd.trim()
  if (!t) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null
  return `${t}T12:00:00.000Z`
}

export function LeadProfileForm({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const raw = (lead.raw_payload ?? {}) as { role?: string }
  const audience = raw.role === "parent" ? "parent" : "senior"
  const svc = String(lead.service || "media-day")
  const step = Number(lead.nurture_step ?? 0)
  let nextTemplateLabel = ""
  if (step >= 1 && step <= 3) {
    const key = templateKeyForCronStep(svc, step as 1 | 2 | 3, audience)
    nextTemplateLabel = catalogLabelForTemplateKey(svc, key)
  }

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMsg(j.error || "Save failed")
        return
      }
      setMsg("Saved.")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function forceNurture() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch("/api/admin/nurture-force", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, timeZone: tz, nurtureGapDays: 7 }),
      })
      const j = await r.json().catch(() => ({}))
      setMsg(r.ok ? "Nurture send triggered." : j.error || "Failed")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function sendTest() {
    const to = window.prompt("Send test to email address:")
    if (!to) return
    const templateKey = window.prompt("Template key (internal id — for tests only):", "md_email1")
    if (!templateKey) return
    const service = String(lead.service || "media-day")
    setSaving(true)
    try {
      const r = await fetch("/api/admin/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, to, templateKey, service }),
      })
      const j = await r.json().catch(() => ({}))
      setMsg(r.ok ? "Test sent." : j.error || "Failed")
    } finally {
      setSaving(false)
    }
  }

  const nextNurtureDateValue =
    lead.next_nurture_on != null && String(lead.next_nurture_on).length >= 10
      ? String(lead.next_nurture_on).slice(0, 10)
      : isoToDateInput(lead.next_nurture_at as string | undefined)

  return (
    <div className="space-y-5 text-sm text-[var(--ac-text)]">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={saving}
          className="bg-[var(--ac-accent)] text-[#0d2224] hover:bg-[var(--ac-accent-hover)]"
          onClick={() => void forceNurture()}
        >
          Send next nurture now
        </Button>
        <Button type="button" disabled={saving} variant="outline" className="border-[var(--ac-divider)]" onClick={() => void sendTest()}>
          Send test
        </Button>
        <Button
          type="button"
          disabled={saving}
          variant="outline"
          className="border-[var(--ac-divider)]"
          onClick={() => void patch({ nurture_paused_at: new Date().toISOString() })}
        >
          Pause nurture
        </Button>
        <Button
          type="button"
          disabled={saving}
          variant="outline"
          className="border-[var(--ac-divider)]"
          onClick={() => void patch({ nurture_paused_at: null })}
        >
          Resume nurture
        </Button>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg-2)] p-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={Boolean(lead.completed_at)}
          onChange={e => patch({ completed_at: e.target.checked ? new Date().toISOString() : null })}
        />
        <span>
          <span className="font-medium text-[var(--ac-text)]">Mark completed</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-[var(--ac-text-muted)]">
            Good job — they&apos;re wrapped up for now. Reopen anytime by unchecking (returning clients welcome later).
          </span>
        </span>
      </label>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">Stage</label>
        <select
          defaultValue={String(lead.lead_stage ?? "submitted")}
          onChange={e => patch({ lead_stage: e.target.value })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        >
          {STAGE_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--ac-text-muted)]">
          {STAGE_OPTIONS.find(s => s.value === String(lead.lead_stage ?? "submitted"))?.description ??
            "Where this lead sits in your pipeline."}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
          Next nurture send (date)
        </label>
        <input
          type="date"
          defaultValue={nextNurtureDateValue}
          onBlur={e => patch({ next_nurture_on: e.target.value.trim() || null })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        />
        <p className="mt-1 text-xs text-[var(--ac-text-muted)]">
          Shown on your admin calendar. Bell reminders start 8 hours before 9:00 AM on this day (your browser time zone).
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
          Nurture step (next email)
        </label>
        <input
          type="number"
          min={0}
          max={3}
          defaultValue={step}
          onBlur={e => patch({ nurture_step: Number(e.target.value) })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        />
        {step >= 1 && step <= 3 ? (
          <p className="mt-1 text-xs text-[var(--ac-text-muted)]">
            <span className="font-medium text-[var(--ac-accent)]">Email {step}</span>
            {nextTemplateLabel ? (
              <>
                <span className="text-[var(--ac-text-muted)]"> — </span>
                <span>{nextTemplateLabel}</span>
              </>
            ) : null}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[var(--ac-text-muted)]">No nurture email index pending (0 = none).</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
          Recycle check-in (date)
        </label>
        <input
          type="date"
          defaultValue={isoToDateInput(lead.recycle_at as string | undefined)}
          onBlur={e => patch({ recycle_at: dateInputToNoonIso(e.target.value) })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
          Call booked (date)
        </label>
        <input
          type="date"
          defaultValue={isoToDateInput(lead.call_booked_at as string | undefined)}
          onBlur={e => patch({ call_booked_at: dateInputToNoonIso(e.target.value) })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
          Shoot booked (date)
        </label>
        <input
          type="date"
          defaultValue={isoToDateInput(lead.shoot_booked_at as string | undefined)}
          onBlur={e => patch({ shoot_booked_at: dateInputToNoonIso(e.target.value) })}
          className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-[var(--ac-text)]"
        />
      </div>

      {msg && <p className="text-xs text-[var(--ac-accent)]">{msg}</p>}
    </div>
  )
}
