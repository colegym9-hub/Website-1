"use client"

import { useEffect, useState } from "react"

export function AutomationSettingsForm() {
  const [paused, setPaused] = useState(false)
  const [servicesJson, setServicesJson] = useState("{}")
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    void fetch("/api/admin/automation")
      .then(r => r.json())
      .then(j => {
        setPaused(Boolean(j.global?.paused))
        setServicesJson(JSON.stringify(j.services ?? {}, null, 2))
      })
      .catch(() => setMsg("Could not load settings"))
  }, [])

  async function save() {
    setMsg(null)
    const r = await fetch("/api/admin/automation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ globalPaused: paused, servicesJson }),
    })
    const j = await r.json().catch(() => ({}))
    setMsg(r.ok ? "Saved." : j.error || "Failed")
  }

  return (
    <div className="max-w-xl space-y-4 text-sm">
      <label className="flex items-center gap-2 text-[#ccc] cursor-pointer">
        <input type="checkbox" checked={paused} onChange={e => setPaused(e.target.checked)} />
        Pause all automated nurture / recycle sends (cron respects this)
      </label>
      <div>
        <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Per-service enable (JSON)</p>
        <p className="text-[#666] text-xs mb-2">Example: {`{"media-day": true, "sportraits": false}`}</p>
        <textarea
          value={servicesJson}
          onChange={e => setServicesJson(e.target.value)}
          rows={6}
          className="w-full font-mono text-xs bg-[#111] border border-[#333] rounded-lg p-3 text-[#ccc]"
        />
      </div>
      <button type="button" onClick={() => save()} className="px-4 py-2 rounded-lg bg-[var(--ac-accent)] text-[#0d2224] text-sm font-medium">
        Save automation settings
      </button>
      {msg && <p className="text-xs text-[#7fb8be]">{msg}</p>}
    </div>
  )
}
