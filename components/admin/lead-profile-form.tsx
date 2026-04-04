"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Lead = Record<string, unknown> & { id: string }

const STAGES = [
  "contact_captured",
  "submitted",
  "engaged_warm",
  "hot_intent",
  "call_booked",
  "shoot_booked",
] as const

export function LeadProfileForm({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch("/api/admin/nurture-force", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
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
    const templateKey = window.prompt("Template key (e.g. md_email1, sr_day0):", "md_email1")
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

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => forceNurture()}
          className="px-3 py-1.5 rounded-md bg-[#1e3a3d] text-[#7fb8be] text-xs"
        >
          Send next nurture now
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => sendTest()}
          className="px-3 py-1.5 rounded-md border border-[#333] text-[#ccc] text-xs"
        >
          Send test
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => patch({ nurture_paused_at: new Date().toISOString() })}
          className="px-3 py-1.5 rounded-md border border-[#333] text-[#ccc] text-xs"
        >
          Pause nurture
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => patch({ nurture_paused_at: null })}
          className="px-3 py-1.5 rounded-md border border-[#333] text-[#ccc] text-xs"
        >
          Resume nurture
        </button>
      </div>

      <label className="block text-[#888] text-xs uppercase tracking-wider">Stage</label>
      <select
        defaultValue={String(lead.lead_stage ?? "submitted")}
        onChange={e => patch({ lead_stage: e.target.value })}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white"
      >
        {STAGES.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="block text-[#888] text-xs uppercase tracking-wider mt-2">Next nurture at (ISO or empty)</label>
      <input
        type="text"
        defaultValue={lead.next_nurture_at ? String(lead.next_nurture_at) : ""}
        onBlur={e => patch({ next_nurture_at: e.target.value.trim() || null })}
        placeholder="2026-04-10T15:30:00.000Z"
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs"
      />

      <label className="block text-[#888] text-xs uppercase tracking-wider">Nurture step (next cron index 0–3)</label>
      <input
        type="number"
        min={0}
        max={3}
        defaultValue={Number(lead.nurture_step ?? 0)}
        onBlur={e => patch({ nurture_step: Number(e.target.value) })}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white"
      />

      <label className="block text-[#888] text-xs uppercase tracking-wider">Recycle at</label>
      <input
        type="text"
        defaultValue={lead.recycle_at ? String(lead.recycle_at) : ""}
        onBlur={e => patch({ recycle_at: e.target.value.trim() || null })}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs"
      />

      <label className="block text-[#888] text-xs uppercase tracking-wider">Call booked at</label>
      <input
        type="text"
        defaultValue={lead.call_booked_at ? String(lead.call_booked_at) : ""}
        onBlur={e => patch({ call_booked_at: e.target.value.trim() || null })}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs"
      />

      <label className="block text-[#888] text-xs uppercase tracking-wider">Shoot booked at</label>
      <input
        type="text"
        defaultValue={lead.shoot_booked_at ? String(lead.shoot_booked_at) : ""}
        onBlur={e => patch({ shoot_booked_at: e.target.value.trim() || null })}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs"
      />

      {msg && <p className="text-xs text-[#7fb8be]">{msg}</p>}
    </div>
  )
}
