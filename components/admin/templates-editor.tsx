"use client"

import { useCallback, useEffect, useState } from "react"

type Row = {
  id: string
  service: string
  template_key: string
  subject: string
  body_html: string
  active: boolean
  updated_at: string | null
}

export function TemplatesEditor() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [newRow, setNewRow] = useState({ service: "media-day", template_key: "", subject: "", body_html: "" })

  const reloadTemplates = useCallback(async () => {
    const r = await fetch("/api/admin/templates")
    const j = await r.json()
    setRows(j.templates ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await reloadTemplates()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [reloadTemplates])

  async function savePatch(id: string, patch: Partial<Row>) {
    setMsg(null)
    const r = await fetch(`/api/admin/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) setMsg(j.error || "Save failed")
    else {
      setMsg("Saved.")
      void reloadTemplates()
    }
  }

  async function createTemplate() {
    setMsg(null)
    const r = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: newRow.service,
        template_key: newRow.template_key,
        subject: newRow.subject,
        body_html: newRow.body_html,
      }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) setMsg(j.error || "Create failed")
    else {
      setMsg("Created.")
      setNewRow({ service: "media-day", template_key: "", subject: "", body_html: "" })
      void reloadTemplates()
    }
  }

  if (loading) return <p className="text-[#666] text-sm">Loading…</p>

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#555] mb-4">Existing templates (DB overrides repo defaults)</h2>
        <p className="text-[#666] text-xs mb-4">
          Merge tags: {"{{firstName}}"}, {"{{prepUrl}}"}, {"{{workUrl}}"}, {"{{scheduleUrl}}"}, {"{{unsubscribeUrl}}"}, {"{{pixiesetUrl}}"},{" "}
          {"{{btsUrl}}"}, {"{{mackenzieUrl}}"}
        </p>
        <div className="space-y-6">
          {rows.length === 0 && <p className="text-[#666] text-sm">No DB rows yet — defaults from code apply.</p>}
          {rows.map(row => (
            <div key={row.id} className="border border-[#2a2a2a] rounded-lg p-4 bg-[#111] space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <span className="text-[var(--ac-accent)] text-sm font-medium">
                  {row.service} / {row.template_key}
                </span>
                <label className="flex items-center gap-2 text-xs text-[#888]">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={e => savePatch(row.id, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <input
                type="text"
                defaultValue={row.subject}
                onBlur={e => savePatch(row.id, { subject: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white"
              />
              <textarea
                defaultValue={row.body_html}
                onBlur={e => savePatch(row.id, { body_html: e.target.value })}
                rows={8}
                className="w-full font-mono text-xs bg-[#0a0a0a] border border-[#333] rounded p-3 text-[#ccc]"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#555] mb-4">Add override</h2>
        <div className="grid gap-3 max-w-2xl">
          <input
            placeholder="service (e.g. media-day)"
            value={newRow.service}
            onChange={e => setNewRow(p => ({ ...p, service: e.target.value }))}
            className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="template_key (e.g. md_email1)"
            value={newRow.template_key}
            onChange={e => setNewRow(p => ({ ...p, template_key: e.target.value }))}
            className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="subject"
            value={newRow.subject}
            onChange={e => setNewRow(p => ({ ...p, subject: e.target.value }))}
            className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white"
          />
          <textarea
            placeholder="HTML body"
            value={newRow.body_html}
            onChange={e => setNewRow(p => ({ ...p, body_html: e.target.value }))}
            rows={6}
            className="font-mono text-xs bg-[#111] border border-[#333] rounded p-3 text-[#ccc]"
          />
          <button
            type="button"
            onClick={() => createTemplate()}
            className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-white text-sm w-fit"
          >
            Create template row
          </button>
        </div>
      </div>

      {msg && <p className="text-xs text-[#7fb8be]">{msg}</p>}
    </div>
  )
}
