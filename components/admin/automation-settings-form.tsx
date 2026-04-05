"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

const SERVICE_KEYS = ["media-day", "senior-portraits", "sportraits"] as const
const SERVICE_LABEL: Record<string, string> = {
  "media-day": "Media Day",
  "senior-portraits": "Senior portraits",
  sportraits: "Sportraits",
}

export function AutomationSettingsForm() {
  const [paused, setPaused] = useState(false)
  const [services, setServices] = useState<Record<string, boolean>>({})
  const [advancedJson, setAdvancedJson] = useState("{}")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    void fetch("/api/admin/automation")
      .then(r => r.json())
      .then(j => {
        setPaused(Boolean(j.global?.paused))
        const svc = (j.services ?? {}) as Record<string, boolean>
        setServices(svc)
        setAdvancedJson(JSON.stringify(svc, null, 2))
      })
      .catch(() => setMsg("Could not load settings"))
  }, [])

  const toggles = useMemo(() => {
    const out: Record<string, boolean> = {}
    for (const k of SERVICE_KEYS) {
      out[k] = services[k] !== false
    }
    return out
  }, [services])

  async function save() {
    setMsg(null)
    const servicesJson = showAdvanced ? advancedJson : JSON.stringify(toggles)
    const r = await fetch("/api/admin/automation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ globalPaused: paused, servicesJson }),
    })
    const j = await r.json().catch(() => ({}))
    setMsg(r.ok ? "Saved." : j.error || "Failed")
    if (r.ok && !showAdvanced) {
      try {
        setServices(JSON.parse(servicesJson) as Record<string, boolean>)
      } catch {
        /* ignore */
      }
    }
  }

  function setServiceEnabled(key: string, enabled: boolean) {
    setServices(prev => ({ ...prev, [key]: enabled }))
  }

  return (
    <div className="max-w-2xl space-y-8 text-sm text-[var(--ac-text)]">
      <section className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
        <h2 className="font-heading text-base text-[var(--ac-text)]">What runs without you</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-xs leading-relaxed text-[var(--ac-text-muted)]">
          <li>
            <strong className="text-[var(--ac-text)]">Day 0 email</strong> — Right after someone submits the booking
            form, they get the confirmation email for their funnel (Media Day, Senior, or Sportraits).
          </li>
          <li>
            <strong className="text-[var(--ac-text)]">Email to you</strong> — You get a notification at your admin email
            when a new inquiry arrives (same as today).
          </li>
          <li>
            <strong className="text-[var(--ac-text)]">Nurture emails 1–3</strong> — These do{" "}
            <em>not</em> send on a schedule. You send them from <strong>Follow-ups</strong> or the lead page when you’re
            ready.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
        <h2 className="font-heading text-base text-[var(--ac-text)]">Words to know</h2>
        <dl className="mt-3 space-y-3 text-xs leading-relaxed text-[var(--ac-text-muted)]">
          <div>
            <dt className="font-semibold text-[var(--ac-text)]">Recycle check-in</dt>
            <dd className="mt-1">
              An extra “still interested?” email for a lead you’ve marked with a recycle date. It’s optional and{" "}
              <strong className="text-[var(--ac-text)]">only sent when you click send</strong> in Follow-ups — nothing
              bulk-runs in the background.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ac-text)]">Pause automation</dt>
            <dd className="mt-1">
              Stops manual nurture/recycle sends from the admin panel and hides those leads from the work queue until
              you turn it back on. Day 0 is still controlled separately by the per-funnel toggles below when paused —
              see tooltip on pause.
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
        <h2 className="font-heading text-base text-[var(--ac-text)]">Safety switches</h2>
        <label className="flex cursor-pointer items-start gap-3 text-[var(--ac-text-muted)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={paused}
            onChange={e => setPaused(e.target.checked)}
          />
          <span>
            <span className="font-medium text-[var(--ac-text)]">Pause all manual sends</span>
            <span className="mt-1 block text-xs">
              Blocks nurture and recycle sends from the admin until unchecked. Use if you need to stop outreach
              immediately.
            </span>
          </span>
        </label>

        <div className="border-t border-[var(--ac-divider)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
            Which funnels are active
          </p>
          <p className="mt-1 text-xs text-[var(--ac-text-muted)]">
            When off, that funnel’s leads won’t appear in the follow-up queue and sends are blocked for that service.
          </p>
          <ul className="mt-4 space-y-3">
            {SERVICE_KEYS.map(key => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-3 text-[var(--ac-text)]">
                  <input
                    type="checkbox"
                    checked={toggles[key]}
                    onChange={e => setServiceEnabled(key, e.target.checked)}
                  />
                  <span>{SERVICE_LABEL[key]}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <details className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-bg-2)] p-4">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--ac-text-muted)]">
          Advanced — edit services as JSON
        </summary>
        <p className="mt-2 text-xs text-[var(--ac-text-muted)]">
          Same data as the checkboxes. Turn this on only if you need to copy/paste settings.
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-[var(--ac-text-muted)]">
          <input type="checkbox" checked={showAdvanced} onChange={e => setShowAdvanced(e.target.checked)} />
          Use JSON editor instead of checkboxes when saving
        </label>
        {showAdvanced ? (
          <textarea
            value={advancedJson}
            onChange={e => setAdvancedJson(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-3 font-mono text-xs text-[var(--ac-text)]"
          />
        ) : null}
      </details>

      <Button
        type="button"
        onClick={() => void save()}
        className="bg-[var(--ac-accent)] text-[#0d2224] hover:bg-[var(--ac-accent-hover)]"
      >
        Save settings
      </Button>
      {msg && <p className="text-xs text-[var(--ac-accent)]">{msg}</p>}
    </div>
  )
}
