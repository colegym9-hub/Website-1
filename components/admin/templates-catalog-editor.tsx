"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { catalogAnchorId } from "@/lib/email-template-catalog"
import { Button } from "@/components/ui/button"
import { PlainTemplateToolbar } from "@/components/admin/plain-template-toolbar"
import { Input } from "@/components/ui/input"

type CatalogItem = {
  service: string
  template_key: string
  label: string
  audience: string
  group: string
  templateDbId: string | null
  dbActive: boolean
  rawSubject: string
  rawPlain: string
  rawHtml: string
  /** Initial editor values (matches compose / getTemplateAuthoringPlain). */
  editorSubject: string
  editorBodyPlain: string
  suggestedPlain: string
  suggestedSubject: string
  suggestedRawHtml: string
  previewSubject: string
  previewHtml: string
  source: "db" | "repo"
}

function draftKey(it: Pick<CatalogItem, "service" | "template_key">) {
  return `${it.service}::${it.template_key}`
}

const GROUP_LABEL: Record<string, string> = {
  nurture: "Nurture sequence",
  recycle: "Recycle",
}

const SERVICE_LABEL: Record<string, string> = {
  "media-day": "Media Day",
  "senior-portraits": "Senior portraits",
  sportraits: "Sportraits",
}

function PlainBodyTextarea({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = ref.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = value.slice(0, start) + text + value.slice(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.focus()
        const p = start + text.length
        el.setSelectionRange(p, p)
      })
    },
    [value, onChange],
  )

  return (
    <div className="space-y-2">
      <PlainTemplateToolbar insertAtCursor={insertAtCursor} />
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={14}
        className="w-full resize-y rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-3 font-mono text-sm leading-relaxed text-[var(--ac-text)]"
        placeholder="Plain text. Blank line = new paragraph. Use Insert for merges, links, and buttons."
      />
    </div>
  )
}

export function TemplatesCatalogEditor() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [drafts, setDrafts] = useState<
    Record<string, { subject: string; bodyPlain: string; active: boolean }>
  >({})
  const [openPreview, setOpenPreview] = useState<Record<string, boolean>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [filterService, setFilterService] = useState<string>("all")
  const [filterGroup, setFilterGroup] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")

  const load = useCallback(async () => {
    setMsg(null)
    const r = await fetch("/api/admin/templates/catalog")
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      setMsg(j.error || "Failed to load catalog")
      setLoading(false)
      return
    }
    const list = (j.items ?? []) as CatalogItem[]
    setItems(list)
    const next: Record<string, { subject: string; bodyPlain: string; active: boolean }> = {}
    for (const it of list) {
      next[draftKey(it)] = {
        subject: it.editorSubject ?? it.rawSubject,
        bodyPlain: it.editorBodyPlain ?? it.rawPlain,
        active: it.dbActive,
      }
    }
    setDrafts(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(it => {
      if (filterService !== "all" && it.service !== filterService) return false
      if (filterGroup !== "all" && it.group !== filterGroup) return false
      if (filterSource !== "all" && it.source !== filterSource) return false
      if (!q) return true
      const d = drafts[draftKey(it)]
      const blob = [
        it.label,
        it.template_key,
        it.service,
        d?.subject,
        d?.bodyPlain,
        it.editorBodyPlain,
        it.suggestedPlain,
      ]
        .join(" ")
        .toLowerCase()
      return blob.includes(q)
    })
  }, [items, search, filterService, filterGroup, filterSource, drafts])

  useEffect(() => {
    if (!filteredItems.length || typeof window === "undefined") return
    const h = window.location.hash
    if (!h) return
    const id = h.slice(1)
    const exists = filteredItems.some(
      it => catalogAnchorId(it.service, it.template_key) === id,
    )
    if (!exists && items.some(it => catalogAnchorId(it.service, it.template_key) === id)) {
      setSearch("")
      setFilterService("all")
      setFilterGroup("all")
      setFilterSource("all")
    }
    requestAnimationFrame(() => {
      document.querySelector(h)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [filteredItems, items])

  const byService = useMemo(() => {
    const m = new Map<string, CatalogItem[]>()
    for (const it of filteredItems) {
      if (!m.has(it.service)) m.set(it.service, [])
      m.get(it.service)!.push(it)
    }
    return m
  }, [filteredItems])

  function setDraft(k: string, patch: Partial<{ subject: string; bodyPlain: string; active: boolean }>) {
    setDrafts(prev => ({ ...prev, [k]: { ...prev[k], ...patch } }))
  }

  async function seedWarmTier() {
    setSeeding(true)
    setMsg(null)
    try {
      const r = await fetch("/api/admin/templates/seed-warm-tier", { method: "POST" })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || "Seed failed")
      setMsg(`Loaded A.C Media default copy (${j.upserted} templates).`)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Seed failed")
    } finally {
      setSeeding(false)
    }
  }

  async function saveOne(it: CatalogItem) {
    const k = draftKey(it)
    const d = drafts[k]
    if (!d) return
    setSavingKey(k)
    setMsg(null)
    try {
      const payload = {
        subject: d.subject,
        body_plain: d.bodyPlain,
        body_html: "",
        active: d.active,
      }
      if (it.templateDbId) {
        const r = await fetch(`/api/admin/templates/${it.templateDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Save failed")
      } else {
        const r = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: it.service,
            template_key: it.template_key,
            ...payload,
          }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Create failed")
      }
      setMsg("Saved.")
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingKey(null)
    }
  }

  function applyStarter(it: CatalogItem) {
    const k = draftKey(it)
    if (it.suggestedPlain) {
      setDraft(k, { subject: it.suggestedSubject || it.rawSubject, bodyPlain: it.suggestedPlain })
      return
    }
    if (it.suggestedRawHtml) {
      setMsg("No plain-text starter for this key — load A.C defaults or paste plain text.")
    }
  }

  if (loading) return <p className="text-sm text-[var(--ac-text-muted)]">Loading templates…</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:max-w-md">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
            Search
          </label>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Label, key, subject, body…"
            className="border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">
              Service
            </label>
            <select
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
              className="rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
            >
              <option value="all">All</option>
              <option value="media-day">Media Day</option>
              <option value="senior-portraits">Senior portraits</option>
              <option value="sportraits">Sportraits</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">
              Group
            </label>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
            >
              <option value="all">All</option>
              <option value="nurture">Nurture</option>
              <option value="recycle">Recycle</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">
              Source
            </label>
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
            >
              <option value="all">All</option>
              <option value="db">Saved in database</option>
              <option value="repo">Not saved yet</option>
            </select>
          </div>
        </div>
        <Button
          type="button"
          disabled={seeding}
          className="bg-[var(--ac-accent)] text-[#0d2224]"
          onClick={() => void seedWarmTier()}
        >
          {seeding ? "Loading…" : "Load A.C Media default copy"}
        </Button>
      </div>

      <p className="text-xs text-[var(--ac-text-muted)]">
        Showing {filteredItems.length} of {items.length} templates (Day 0 confirmation emails are automatic and not
        edited here).
      </p>

      <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-4 text-sm text-[var(--ac-text-muted)]">
        <p className="font-medium text-[var(--ac-text)]">Plain-text email format</p>
        <p className="mt-2 text-xs leading-relaxed">
          Use <strong className="text-[var(--ac-accent)]">Insert → Merge field</strong> for {"{{firstName}}"}, {"{{prepUrl}}"}
          , etc. Use <strong className="text-[var(--ac-accent)]">Link</strong> or <strong className="text-[var(--ac-accent)]">Button</strong>{" "}
          for tracked URLs. Blank lines start a new paragraph.
        </p>
      </div>

      {msg && <p className="text-xs text-[var(--ac-accent)]">{msg}</p>}

      {Array.from(byService.entries()).map(([service, rows]) => (
        <section key={service} className="space-y-4">
          <h2 className="font-heading text-lg tracking-tight text-[var(--ac-text)]">
            {SERVICE_LABEL[service] ?? service}
          </h2>
          {(["nurture", "recycle"] as const).map(group => {
            const inGroup = rows.filter(r => r.group === group)
            if (!inGroup.length) return null
            return (
              <div key={group} className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
                  {GROUP_LABEL[group]}
                </p>
                <div className="space-y-4">
                  {inGroup.map(it => {
                    const k = draftKey(it)
                    const d = drafts[k] ?? {
                      subject: it.rawSubject,
                      bodyPlain: it.rawPlain,
                      active: it.dbActive,
                    }
                    const prevOpen = openPreview[k] ?? false
                    const legacyHtmlOnly = Boolean(it.rawHtml.trim()) && !it.rawPlain.trim()
                    return (
                      <article
                        key={k}
                        id={catalogAnchorId(it.service, it.template_key)}
                        className="scroll-mt-24 overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-bg-2)] shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--ac-divider)] bg-[var(--ac-surface)] px-4 py-3">
                          <div>
                            <h3 className="text-sm font-semibold text-[var(--ac-text)]">{it.label}</h3>
                            <p className="mt-0.5 font-mono text-[10px] text-[var(--ac-text-muted)]">
                              {it.service} / {it.template_key}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={
                                it.source === "db"
                                  ? "rounded-md bg-[var(--ac-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ac-accent)]"
                                  : "rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[var(--ac-text-muted)]"
                              }
                            >
                              {it.source === "db" ? "Saved" : "Not saved"}
                            </span>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--ac-text-muted)]">
                              <input
                                type="checkbox"
                                checked={d.active}
                                onChange={e => setDraft(k, { active: e.target.checked })}
                              />
                              Active
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          {legacyHtmlOnly ? (
                            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                              This template still has legacy HTML in the database. Save plain text below to switch to
                              the new format (HTML will be cleared).
                            </p>
                          ) : null}
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                              Subject line
                            </label>
                            <input
                              type="text"
                              value={d.subject}
                              onChange={e => setDraft(k, { subject: e.target.value })}
                              className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                              Email body (plain text)
                            </label>
                            <PlainBodyTextarea
                              value={d.bodyPlain}
                              onChange={v => setDraft(k, { bodyPlain: v })}
                            />
                          </div>
                          {!it.rawPlain.trim() && (it.suggestedPlain || it.suggestedRawHtml) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-[var(--ac-divider)] text-[var(--ac-text-muted)]"
                              onClick={() => applyStarter(it)}
                            >
                              Use suggested starter
                            </Button>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-[var(--ac-accent)] text-[#0d2224] hover:bg-[var(--ac-accent-hover)]"
                              disabled={savingKey === k}
                              onClick={() => void saveOne(it)}
                            >
                              {savingKey === k ? "Saving…" : it.templateDbId ? "Save changes" : "Save to database"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-[var(--ac-divider)] text-[var(--ac-text-muted)]"
                              onClick={() => setOpenPreview(p => ({ ...p, [k]: !prevOpen }))}
                            >
                              {prevOpen ? "Hide preview" : "Show preview"}
                            </Button>
                          </div>
                          {prevOpen ? (
                            <div className="rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-3">
                              <p className="mb-2 text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">
                                Preview (sample lead)
                              </p>
                              <p className="mb-2 text-xs font-medium text-[var(--ac-accent)]">{it.previewSubject}</p>
                              <div
                                className="max-h-64 overflow-auto rounded border border-[var(--ac-divider)] bg-white p-3 text-[11px] text-[#111]"
                                dangerouslySetInnerHTML={{ __html: it.previewHtml }}
                              />
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
