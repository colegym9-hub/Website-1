"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isTerminalNurtureStage } from "@/lib/lead-stages"
import { nurtureSendBlockReason, recycleSendBlockReason } from "@/lib/follow-up-gate"
import { stageLabel } from "@/lib/stage-metadata"
import { templateKeyForCronStep } from "@/lib/nurture-schedule"
import { catalogLabelForTemplateKey } from "@/lib/template-labels"
import { LeadComposeModal } from "@/components/admin/lead-compose-modal"
import { Button } from "@/components/ui/button"

type LeadRow = {
  id: string
  name: string
  email: string
  service: string | null
  lead_tier: string | null
  lead_stage: string | null
  nurture_step: number | null
  created_at: string | null
  recycle_at: string | null
  next_nurture_at: string | null
  next_nurture_on?: string | null
  completed_at?: string | null
  nurture_paused_at: string | null
  unsubscribed_at: string | null
  raw_payload: unknown
}

type Ev = { id: string; type: string; payload: unknown; created_at: string | null }

const FUNNEL_LABELS: [string, string][] = [
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["org", "School / org"],
  ["service", "Service"],
  ["timeline", "Timeline"],
  ["readiness", "Readiness"],
  ["notes", "Notes"],
  ["vision", "Vision"],
  ["role", "Role (parent/senior)"],
  ["packageIntent", "Package interest"],
]

function formatVal(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  if (Array.isArray(v)) return v.join(", ")
  return JSON.stringify(v)
}

export function LeadDetailWorkspace({ lead, events }: { lead: LeadRow; events: Ev[] }) {
  const router = useRouter()
  const [compose, setCompose] = useState<"nurture" | "recycle" | null>(null)

  const raw = (lead.raw_payload ?? {}) as Record<string, unknown>

  const nurtureBlock = nurtureSendBlockReason({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    service: lead.service,
    lead_tier: lead.lead_tier,
    lead_stage: lead.lead_stage,
    nurture_step: lead.nurture_step,
    created_at: lead.created_at,
    raw_payload: lead.raw_payload,
    unsubscribed_at: lead.unsubscribed_at,
    nurture_paused_at: lead.nurture_paused_at,
  })
  const recycleBlock = recycleSendBlockReason({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    service: lead.service,
    recycle_at: lead.recycle_at,
    unsubscribed_at: lead.unsubscribed_at,
  })

  const audience = raw.role === "parent" ? "parent" : "senior"
  const step = lead.nurture_step ?? 0
  const nextTemplateKey =
    step >= 1 && step <= 3
      ? templateKeyForCronStep(lead.service || "media-day", step as 1 | 2 | 3, audience)
      : null

  const situation = useMemo(() => {
    const lines: string[] = []
    const st = lead.lead_stage || "submitted"
    lines.push(`Funnel: ${lead.service || "—"} · Tier: ${lead.lead_tier || "—"} · Stage: ${stageLabel(st)}`)
    if (lead.completed_at) lines.push("Marked completed — you can reopen from Lifecycle when they come back.")
    if (lead.unsubscribed_at) lines.push("This lead has unsubscribed — do not send marketing email.")
    else if (isTerminalNurtureStage(lead.lead_stage))
      lines.push("Stage is “won” intent (hot / call booked / shoot booked) — nurture sequence usually stops here.")
    else if (lead.nurture_paused_at) lines.push("Nurture is paused for this lead.")
    else if (step >= 1 && step <= 3) {
      const nm = nextTemplateKey
        ? catalogLabelForTemplateKey(lead.service || "media-day", nextTemplateKey)
        : ""
      lines.push(nm ? `Next manual nurture: Email ${step} — ${nm}.` : `Next manual nurture: Email ${step}.`)
    } else lines.push("No nurture step pending (0 or finished sequence).")
    if (lead.recycle_at)
      lines.push(`Recycle check-in: ${new Date(lead.recycle_at).toLocaleDateString(undefined, { dateStyle: "medium" })}.`)
    if (lead.next_nurture_on)
      lines.push(`Next nurture on calendar: ${lead.next_nurture_on}.`)
    return lines
  }, [lead, step, nextTemplateKey])

  const emailEvents = events.filter(
    e =>
      e.type === "email.sent" ||
      e.type === "nurture.sent" ||
      e.type === "recycle.sent",
  )

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
          Situation
        </h2>
        <ul className="space-y-2 text-sm text-[var(--ac-text-muted)]">
          {situation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {step >= 1 && step <= 3 && !nurtureBlock ? (
            <Button
              type="button"
              className="bg-[var(--ac-accent)] text-[#0d2224]"
              onClick={() => setCompose("nurture")}
            >
              Compose nurture · Email {step}
              {nextTemplateKey
                ? ` — ${catalogLabelForTemplateKey(lead.service || "media-day", nextTemplateKey)}`
                : ""}
            </Button>
          ) : step >= 1 && step <= 3 && nurtureBlock ? (
            <p className="text-xs text-amber-200/90">Nurture blocked: {nurtureBlock}</p>
          ) : null}
          {lead.recycle_at && !recycleBlock ? (
            <Button type="button" variant="outline" className="border-[var(--ac-divider)]" onClick={() => setCompose("recycle")}>
              Compose recycle check-in
            </Button>
          ) : lead.recycle_at && recycleBlock ? (
            <p className="text-xs text-amber-200/90">Recycle blocked: {recycleBlock}</p>
          ) : null}
          <Button type="button" variant="outline" className="border-[var(--ac-divider)]" asChild>
            <Link href={`/admin/nurture-queue?lead=${lead.id}`}>Open in follow-ups queue</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
          Funnel answers
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {FUNNEL_LABELS.map(([key, label]) => {
            const v = formatVal(raw[key])
            if (!v) return null
            return (
              <div key={key}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
                  {label}
                </dt>
                <dd className="mt-0.5 text-[var(--ac-text)]">{v}</dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
          Emails sent
        </h2>
        {emailEvents.length === 0 ? (
          <p className="text-sm text-[var(--ac-text-muted)]">No sent-email events logged yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--ac-divider)] overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] text-sm">
            {emailEvents.map(e => {
              const p = (e.payload ?? {}) as Record<string, unknown>
              return (
                <li key={e.id} className="px-4 py-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-[var(--ac-accent)]">{e.type}</span>
                    <span className="text-xs text-[var(--ac-text-muted)]">
                      {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ac-text-muted)]">
                    {p.templateKey
                      ? catalogLabelForTemplateKey(lead.service || "media-day", String(p.templateKey))
                      : String(p.template ?? "")}
                    {p.messageId ? ` · id ${String(p.messageId).slice(0, 12)}…` : ""}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <LeadComposeModal
        open={compose !== null}
        onOpenChange={v => !v && setCompose(null)}
        kind={compose ?? "nurture"}
        leadId={lead.id}
        onSent={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
