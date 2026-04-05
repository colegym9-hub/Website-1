"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"

type NurtureDueLead = {
  id: string
  name: string
  email: string
  service: string | null
  lead_tier: string | null
  lead_stage: string | null
  nurture_step: number | null
  next_nurture_at: string | null
}

type RecycleDueLead = {
  id: string
  name: string
  email: string
  service: string | null
  recycle_at: string | null
}

type PreviewNurture = {
  leadId: string
  name: string
  email: string
  service: string
  step: number
  audience: string
  templateKey: string
  templateOptions?: { template_key: string; label: string }[]
  templateDbId: string | null
  subjectPlain: string
  bodyPlain: string
  subject: string
  html: string
}

type PreviewRecycle = {
  leadId: string
  name: string
  email: string
  service: string
  templateKey: string
  templateDbId: string | null
  subjectPlain: string
  bodyPlain: string
  subject: string
  html: string
}

export function FollowUpsQueue() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState("nurture")
  const [nurtureLeads, setNurtureLeads] = useState<NurtureDueLead[]>([])
  const [recycleLeads, setRecycleLeads] = useState<RecycleDueLead[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalKind, setModalKind] = useState<"nurture" | "recycle">("nurture")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewNurture, setPreviewNurture] = useState<PreviewNurture | null>(null)
  const [previewRecycle, setPreviewRecycle] = useState<PreviewRecycle | null>(null)
  const [subjectPlain, setSubjectPlain] = useState("")
  const [bodyPlain, setBodyPlain] = useState("")
  const [mergedSubject, setMergedSubject] = useState("")
  const [mergedHtml, setMergedHtml] = useState("")
  const [nurtureTemplateKey, setNurtureTemplateKey] = useState("")
  const [nurtureTemplateOptions, setNurtureTemplateOptions] = useState<{ template_key: string; label: string }[]>([])
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [savingTpl, setSavingTpl] = useState(false)
  const [newKeyOpen, setNewKeyOpen] = useState(false)
  const [newTemplateKey, setNewTemplateKey] = useState("")
  const openedFromQuery = useRef<string>("")

  const loadNurture = useCallback(async () => {
    const r = await fetch("/api/admin/nurture-due")
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || "Failed to load nurture queue")
    setNurtureLeads(j.leads ?? [])
  }, [])

  const loadRecycle = useCallback(async () => {
    const r = await fetch("/api/admin/recycle-due")
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || "Failed to load recycle queue")
    setRecycleLeads(j.leads ?? [])
  }, [])

  const refresh = useCallback(async () => {
    setListError(null)
    setLoadingList(true)
    try {
      await Promise.all([loadNurture(), loadRecycle()])
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoadingList(false)
    }
  }, [loadNurture, loadRecycle])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const activeLeadId = previewNurture?.leadId ?? previewRecycle?.leadId ?? ""

  useEffect(() => {
    if (!modalOpen || !activeLeadId || previewLoading) return
    const t = setTimeout(() => {
      void fetch(`/api/admin/leads/${activeLeadId}/email-draft-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectPlain,
          bodyPlain,
          templateKey: modalKind === "nurture" ? nurtureTemplateKey : undefined,
          mode: modalKind === "nurture" ? "nurture" : "recycle",
        }),
      })
        .then(async r => {
          const j = await r.json().catch(() => ({}))
          if (!r.ok) return
          if (typeof j.subject === "string" && typeof j.html === "string") {
            setMergedSubject(j.subject)
            setMergedHtml(j.html)
          }
        })
        .catch(() => {})
    }, 450)
    return () => clearTimeout(t)
  }, [
    subjectPlain,
    bodyPlain,
    nurtureTemplateKey,
    activeLeadId,
    modalOpen,
    previewLoading,
    modalKind,
  ])

  function refetchNurturePreview(leadId: string, tk?: string) {
    setPreviewLoading(true)
    setActionMsg(null)
    const path = tk
      ? `/api/admin/nurture-due/${leadId}/preview?templateKey=${encodeURIComponent(tk)}`
      : `/api/admin/nurture-due/${leadId}/preview`
    void fetch(path)
      .then(async r => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Preview failed")
        const p = j as PreviewNurture
        setPreviewNurture(p)
        setSubjectPlain(p.subjectPlain)
        setBodyPlain(p.bodyPlain)
        setMergedSubject(p.subject)
        setMergedHtml(p.html)
        setNurtureTemplateKey(p.templateKey)
        setNurtureTemplateOptions(p.templateOptions ?? [])
      })
      .catch(e => setActionMsg(e instanceof Error ? e.message : "Preview failed"))
      .finally(() => setPreviewLoading(false))
  }

  function openNurtureModal(leadId: string) {
    setModalKind("nurture")
    setActionMsg(null)
    setPreviewNurture(null)
    setPreviewRecycle(null)
    setModalOpen(true)
    refetchNurturePreview(leadId)
  }

  function openRecycleModal(leadId: string) {
    setModalKind("recycle")
    setActionMsg(null)
    setPreviewNurture(null)
    setPreviewRecycle(null)
    setModalOpen(true)
    setPreviewLoading(true)
    void fetch(`/api/admin/recycle-due/${leadId}/preview`)
      .then(async r => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Preview failed")
        const p = j as PreviewRecycle
        setPreviewRecycle(p)
        setSubjectPlain(p.subjectPlain)
        setBodyPlain(p.bodyPlain)
        setMergedSubject(p.subject)
        setMergedHtml(p.html)
      })
      .catch(e => setActionMsg(e instanceof Error ? e.message : "Preview failed"))
      .finally(() => setPreviewLoading(false))
  }

  useEffect(() => {
    const lead = searchParams.get("lead")
    const tabParam = searchParams.get("tab")
    if (tabParam === "recycle") setTab("recycle")
    if (!lead || !/^[0-9a-f-]{36}$/i.test(lead)) return
    const k = `${lead}:${tabParam || "nurture"}`
    if (openedFromQuery.current === k) return
    openedFromQuery.current = k
    if (tabParam === "recycle") openRecycleModal(lead)
    else openNurtureModal(lead)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const service = previewNurture?.service ?? previewRecycle?.service ?? "media-day"
  const templateDbId = previewNurture?.templateDbId ?? previewRecycle?.templateDbId ?? null
  const effectiveTemplateKey =
    modalKind === "nurture" ? nurtureTemplateKey : (previewRecycle?.templateKey ?? "")

  async function handleSend() {
    const leadId = previewNurture?.leadId ?? previewRecycle?.leadId
    if (!leadId) return
    setSending(true)
    setActionMsg(null)
    try {
      const url = modalKind === "nurture" ? "/api/admin/nurture-due/send" : "/api/admin/recycle-due/send"
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const payload: {
        leadId: string
        subjectPlain: string
        bodyPlain: string
        templateKey?: string
        timeZone?: string
        nurtureGapDays?: number
      } = {
        leadId,
        subjectPlain,
        bodyPlain,
      }
      if (modalKind === "nurture") {
        payload.templateKey = nurtureTemplateKey
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
      setModalOpen(false)
      await refresh()
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Send failed")
    } finally {
      setSending(false)
    }
  }

  async function saveTemplateToCurrent() {
    if (!effectiveTemplateKey) return
    setSavingTpl(true)
    setActionMsg(null)
    try {
      if (templateDbId) {
        const r = await fetch(`/api/admin/templates/${templateDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subjectPlain,
            body_plain: bodyPlain,
            body_html: "",
          }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Save failed")
        setActionMsg("Saved to current template.")
      } else {
        const r = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service,
            template_key: effectiveTemplateKey,
            subject: subjectPlain,
            body_plain: bodyPlain,
            body_html: "",
            active: true,
          }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || "Save failed")
        setActionMsg("Created DB template row for this key.")
        if (previewNurture) setPreviewNurture({ ...previewNurture, templateDbId: j.id ?? previewNurture.templateDbId })
        if (previewRecycle) setPreviewRecycle({ ...previewRecycle, templateDbId: j.id ?? previewRecycle.templateDbId })
      }
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingTpl(false)
    }
  }

  async function saveAsNewTemplate() {
    const key = newTemplateKey.trim()
    if (!/^[a-z0-9_]+$/.test(key)) {
      setActionMsg("Use a template key like md_email1_variant (lowercase, numbers, underscores).")
      return
    }
    setSavingTpl(true)
    setActionMsg(null)
    try {
      const r = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          template_key: key,
          subject: subjectPlain,
          body_plain: bodyPlain,
          body_html: "",
          active: true,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || "Save failed")
      setNewKeyOpen(false)
      setNewTemplateKey("")
      setActionMsg(
        `Saved as new key "${key}". Nurture still uses "${effectiveTemplateKey}" until you copy content there or change code.`,
      )
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingTpl(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-[var(--ac-text-muted)]">
          Leads waiting for the next nurture email (steps 1–3) or a recycle check-in you scheduled. Nothing sends on a
          calendar — you open, edit, and send when you’re ready. Day 0 still goes out automatically on inquiry.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-[var(--ac-text)] sm:w-auto"
          onClick={() => void refresh()}
        >
          Refresh
        </Button>
      </div>

      {listError && <p className="text-sm text-red-400">{listError}</p>}
      {loadingList && <p className="text-sm text-[var(--ac-text-muted)]">Loading…</p>}

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList variant="line" className="w-full rounded-none border-b border-[var(--ac-divider)] bg-transparent p-0 sm:w-auto">
          <TabsTrigger
            value="nurture"
            className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
          >
            Nurture ({nurtureLeads.length})
          </TabsTrigger>
          <TabsTrigger
            value="recycle"
            className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
          >
            Recycle ({recycleLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nurture" className="mt-4">
          {nurtureLeads.length === 0 && !loadingList ? (
            <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-[var(--ac-accent)]/20 text-[var(--ac-accent)]">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="mt-5 font-medium text-[var(--ac-text)]">No nurture emails waiting.</p>
              <p className="mt-2 text-sm text-[var(--ac-text-muted)]">
                When a new inquiry comes in, step 1 appears here after Day 0 sends.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)]">
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full text-sm">
                  <thead className="border-b border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                    <tr>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Step</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {nurtureLeads.map(row => (
                      <tr key={row.id} className="border-b border-[var(--ac-divider)] last:border-0 hover:bg-white/[0.03]">
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--ac-text-muted)]">Manual send</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/leads/${row.id}`}
                            className="font-medium text-[var(--ac-text)] hover:text-[var(--ac-accent)] hover:underline"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3 text-[var(--ac-text-muted)]">{row.email}</td>
                        <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.service || "—"}</td>
                        <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.lead_tier || "—"}</td>
                        <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.nurture_step ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-[var(--ac-text)]"
                            onClick={() => openNurtureModal(row.id)}
                          >
                            Compose
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recycle" className="mt-4">
          {recycleLeads.length === 0 && !loadingList ? (
            <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-[var(--ac-accent)]/20 text-[var(--ac-accent)]">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="mt-5 font-medium text-[var(--ac-text)]">No recycle check-ins in the queue.</p>
              <p className="mt-2 text-sm text-[var(--ac-text-muted)]">
                Leads you flag with a recycle date appear here until you send the check-in.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)]">
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-sm">
                  <thead className="border-b border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                    <tr>
                      <th className="px-4 py-3">Recycle date</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recycleLeads.map(row => (
                      <tr key={row.id} className="border-b border-[var(--ac-divider)] last:border-0 hover:bg-white/[0.03]">
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--ac-text-muted)]">
                          {row.recycle_at ? new Date(row.recycle_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/leads/${row.id}`}
                            className="font-medium text-[var(--ac-text)] hover:text-[var(--ac-accent)] hover:underline"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3 text-[var(--ac-text-muted)]">{row.email}</td>
                        <td className="px-4 py-3 text-[var(--ac-text-muted)]">{row.service || "—"}</td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-[var(--ac-divider)] bg-[var(--ac-bg-2)] text-[var(--ac-text)]"
                            onClick={() => openRecycleModal(row.id)}
                          >
                            Compose
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">
              {modalKind === "nurture" ? "Nurture email" : "Recycle check-in"}
            </DialogTitle>
            <DialogDescription className="text-[var(--ac-text-muted)]">
              {(previewNurture || previewRecycle) && (
                <>
                  To: {(previewNurture || previewRecycle)!.email} ·{" "}
                  <span className="text-[var(--ac-accent)]">
                    {catalogLabelForTemplateKey(service, effectiveTemplateKey)}
                  </span>
                  {previewNurture ? ` · Email ${previewNurture.step}` : null}
                  <span className="mt-1 block text-xs">
                    Plain text with merge tokens; preview updates as you type. Sent mail is HTML compiled on the server.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <p className="text-sm text-[var(--ac-text-muted)]">Loading preview…</p>
          ) : (
            <Tabs defaultValue="edit" className="gap-3">
              <TabsList
                variant="line"
                className="w-full rounded-none border-b border-[var(--ac-divider)] bg-transparent p-0"
              >
                <TabsTrigger
                  value="edit"
                  className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
                >
                  Edit (plain)
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-none text-[var(--ac-text-muted)] data-active:border-b-2 data-active:border-[var(--ac-accent)] data-active:text-[var(--ac-text)]"
                >
                  Preview (merged)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-0 space-y-3">
                {modalKind === "nurture" && previewNurture && nurtureTemplateOptions.length > 0 ? (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-[var(--ac-text-muted)]">
                      Template
                    </label>
                    <select
                      value={nurtureTemplateKey}
                      onChange={e => refetchNurturePreview(previewNurture.leadId, e.target.value)}
                      className="w-full rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-3 py-2 text-sm text-[var(--ac-text)]"
                    >
                      {nurtureTemplateOptions.map(opt => (
                        <option key={opt.template_key} value={opt.template_key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                  Subject
                </label>
                <Input
                  value={subjectPlain}
                  onChange={e => setSubjectPlain(e.target.value)}
                  className="border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
                />
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                  Body (plain)
                </label>
                <textarea
                  value={bodyPlain}
                  onChange={e => setBodyPlain(e.target.value)}
                  rows={14}
                  className="min-h-[200px] w-full resize-y rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-3 text-sm leading-relaxed text-[var(--ac-text)]"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0 space-y-2">
                <p className="text-xs text-[var(--ac-text-muted)]">Subject: {mergedSubject}</p>
                <div
                  className="max-h-[360px] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900 shadow-inner [&_a]:text-teal-700 [&_p]:text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: mergedHtml }}
                />
              </TabsContent>
            </Tabs>
          )}

          {actionMsg && <p className="text-sm text-[var(--ac-accent)]">{actionMsg}</p>}

          <DialogFooter className="flex-col gap-2 border-t border-[var(--ac-divider)] bg-transparent pt-4 sm:flex-col">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                className="w-full bg-[var(--ac-accent)] text-[#0d2224] hover:bg-[var(--ac-accent-hover)] sm:w-auto"
                disabled={sending || previewLoading || !(previewNurture || previewRecycle)}
                onClick={() => void handleSend()}
              >
                {sending ? "Sending…" : "Send email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--ac-divider)] bg-transparent sm:w-auto"
                disabled={savingTpl || previewLoading || !(previewNurture || previewRecycle)}
                onClick={() => void saveTemplateToCurrent()}
              >
                Save to current template
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--ac-divider)] bg-transparent sm:w-auto"
                disabled={savingTpl || previewLoading || !(previewNurture || previewRecycle)}
                onClick={() => {
                  setNewKeyOpen(true)
                  setNewTemplateKey("")
                }}
              >
                Save as new template key…
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">New template key</DialogTitle>
            <DialogDescription className="text-[var(--ac-text-muted)]">
              New keys are stored in the library only. Nurture steps still resolve fixed keys (e.g. md_email1) unless you
              copy content there.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. md_email1_winter"
            value={newTemplateKey}
            onChange={e => setNewTemplateKey(e.target.value)}
            className="border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
          />
          <DialogFooter className="border-t border-[var(--ac-divider)] bg-transparent pt-4">
            <Button type="button" variant="outline" className="border-[var(--ac-divider)]" onClick={() => setNewKeyOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[var(--ac-accent)] text-[#0d2224]"
              disabled={savingTpl}
              onClick={() => void saveAsNewTemplate()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
