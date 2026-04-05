"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailSlashCommandMenu } from "@/components/admin/email-slash-command-menu"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"

type NurturePreview = {
  step: number
  templateKey: string
  templateOptions?: { template_key: string; label: string }[]
  subjectPlain: string
  bodyPlain: string
  subject: string
  html: string
}

type RecyclePreview = {
  templateKey: string
  subjectPlain: string
  bodyPlain: string
  subject: string
  html: string
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: "nurture" | "recycle"
  leadId: string
  onSent: () => void
}

export function LeadComposeModal({ open, onOpenChange, kind, leadId, onSent }: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(false)
  const [subjectPlain, setSubjectPlain] = useState("")
  const [bodyPlain, setBodyPlain] = useState("")
  const [templateKey, setTemplateKey] = useState("")
  const [service, setService] = useState("media-day")
  const [templateOptions, setTemplateOptions] = useState<{ template_key: string; label: string }[]>([])
  const [renderedSubject, setRenderedSubject] = useState("")
  const [renderedHtml, setRenderedHtml] = useState("")
  const [step, setStep] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [slashOpen, setSlashOpen] = useState(false)

  function insertAtCursor(text: string) {
    const el = bodyRef.current
    if (!el) {
      setBodyPlain(p => p + text)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = bodyPlain.slice(0, start) + text + bodyPlain.slice(end)
    setBodyPlain(next)
    requestAnimationFrame(() => {
      el.focus()
      const p = start + text.length
      el.setSelectionRange(p, p)
    })
  }

  function loadPreview(tk?: string) {
    if (!leadId) return
    setLoading(true)
    setErr(null)
    const path =
      kind === "nurture"
        ? `/api/admin/nurture-due/${leadId}/preview${tk ? `?templateKey=${encodeURIComponent(tk)}` : ""}`
        : `/api/admin/recycle-due/${leadId}/preview`
    void fetch(path)
      .then(async r => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Preview failed")
        if (kind === "nurture") {
          const p = j as NurturePreview & { service?: string }
          setStep(p.step)
          setTemplateKey(p.templateKey)
          setTemplateOptions(p.templateOptions ?? [])
          if (p.service) setService(String(p.service))
          setSubjectPlain(p.subjectPlain)
          setBodyPlain(p.bodyPlain)
          setRenderedSubject(p.subject)
          setRenderedHtml(p.html)
        } else {
          const p = j as RecyclePreview & { service?: string }
          setTemplateKey(p.templateKey)
          if (p.service) setService(String(p.service))
          setSubjectPlain(p.subjectPlain)
          setBodyPlain(p.bodyPlain)
          setRenderedSubject(p.subject)
          setRenderedHtml(p.html)
        }
      })
      .catch(e => setErr(e instanceof Error ? e.message : "Preview failed"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open || !leadId) return
    loadPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on open/lead/kind only
  }, [open, kind, leadId])

  function onTemplateKeyChange(next: string) {
    setTemplateKey(next)
    loadPreview(next)
  }

  useEffect(() => {
    if (!open || !leadId || loading) return
    const t = setTimeout(() => {
      void fetch(`/api/admin/leads/${leadId}/email-draft-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectPlain,
          bodyPlain,
          templateKey: kind === "nurture" ? templateKey : undefined,
          mode: kind === "nurture" ? "nurture" : "recycle",
        }),
      })
        .then(async r => {
          const j = await r.json().catch(() => ({}))
          if (!r.ok) return
          if (typeof j.subject === "string" && typeof j.html === "string") {
            setRenderedSubject(j.subject)
            setRenderedHtml(j.html)
          }
        })
        .catch(() => {})
    }, 450)
    return () => clearTimeout(t)
  }, [subjectPlain, bodyPlain, templateKey, leadId, open, loading, kind])

  async function send() {
    setSending(true)
    setErr(null)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const url = kind === "nurture" ? "/api/admin/nurture-due/send" : "/api/admin/recycle-due/send"
      const payload: Record<string, string | number> = { leadId, subjectPlain, bodyPlain }
      if (kind === "nurture") {
        payload.templateKey = templateKey
        payload.timeZone = tz
        payload.nurtureGapDays = 7
      }
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || "Send failed")
      onOpenChange(false)
      onSent()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Send failed")
    } finally {
      setSending(false)
    }
  }

  const selectedNurtureLabel =
    kind === "nurture"
      ? (templateOptions.find(o => o.template_key === templateKey)?.label ??
        catalogLabelForTemplateKey(service, templateKey))
      : catalogLabelForTemplateKey(service, "recycle_checkin")

  const meta =
    kind === "nurture" && step != null
      ? `Email ${step} — ${selectedNurtureLabel}`
      : kind === "recycle"
        ? selectedNurtureLabel
        : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[var(--ac-text)]">
            {kind === "nurture" ? "Send nurture email" : "Send recycle check-in"}
          </DialogTitle>
          <DialogDescription className="text-[var(--ac-text-muted)]">
            {meta ? <span className="text-sm font-medium text-[var(--ac-accent)]">{meta}</span> : null}
            <span className="mt-1 block text-xs">
              Type <kbd className="rounded bg-[var(--ac-bg-2)] px-1">/</kbd> at the start of a line or after a space to
              open inserts (merge fields, links, buttons). Preview uses a light background like an inbox.
            </span>
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-[var(--ac-text-muted)]">Loading…</p>
        ) : (
          <Tabs defaultValue="edit" className="gap-3">
            <TabsList variant="line" className="w-full rounded-none border-b border-[var(--ac-divider)] bg-transparent p-0">
              <TabsTrigger
                value="edit"
                className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
              >
                Edit (plain text)
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
              >
                Preview (merged)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-0 space-y-3">
              {kind === "nurture" && templateOptions.length > 0 ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[var(--ac-text-muted)]">
                    Template
                  </label>
                  <select
                    value={templateKey}
                    onChange={e => onTemplateKeyChange(e.target.value)}
                    className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
                  >
                    {templateOptions.map(opt => (
                      <option key={opt.template_key} value={opt.template_key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <label className="block text-xs font-semibold uppercase text-[var(--ac-text-muted)]">Subject</label>
              <Input
                value={subjectPlain}
                onChange={e => setSubjectPlain(e.target.value)}
                className="border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="block text-xs font-semibold uppercase text-[var(--ac-text-muted)]">Body (plain)</label>
                <EmailSlashCommandMenu
                  insertAtCursor={insertAtCursor}
                  disabled={loading}
                  open={slashOpen}
                  onOpenChange={setSlashOpen}
                />
              </div>
              <textarea
                ref={bodyRef}
                value={bodyPlain}
                onChange={e => setBodyPlain(e.target.value)}
                onKeyDown={e => {
                  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return
                  const el = e.currentTarget
                  const start = el.selectionStart
                  const prev = start > 0 ? bodyPlain[start - 1] : ""
                  if (start === 0 || prev === "\n" || prev === " " || prev === "\t") {
                    e.preventDefault()
                    setSlashOpen(true)
                  }
                }}
                rows={14}
                className="w-full resize-y rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-3 text-sm leading-relaxed text-[var(--ac-text)]"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0 space-y-2">
              <p className="text-xs text-[var(--ac-text-muted)]">Subject: {renderedSubject}</p>
              <div
                className="max-h-[360px] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900 shadow-inner [&_a]:text-teal-700 [&_p]:text-neutral-800"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </TabsContent>
          </Tabs>
        )}
        {err && <p className="text-sm text-red-400">{err}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[var(--ac-accent)] text-[#0d2224]"
            disabled={sending || loading}
            onClick={() => void send()}
          >
            {sending ? "Sending…" : "Send with Resend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
