import { Resend } from "resend"
import { catalogAudienceForKey, isNurtureTemplateKey } from "@/lib/email-template-catalog"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"
import {
  compilePlainBodyToOutboundHtml,
  mergePlainSubjectLine,
  resolveEmailTemplate,
  sanitizeTemplateHtml,
} from "@/lib/email-template-db"
import { insertLeadEvent } from "@/lib/lead-events"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { addCalendarDaysYmd, todayYmdInTz } from "@/lib/admin-reminders"
import { advanceAfterNurtureSend, templateKeyForCronStep } from "@/lib/nurture-schedule"
import type { LeadTier } from "@/lib/lead-score"
import type { SupabaseClient } from "@supabase/supabase-js"

export type NurtureLeadRow = {
  id: string
  name: string
  email: string
  service: string | null
  lead_tier: string | null
  lead_stage: string | null
  nurture_step: number | null
  created_at: string | null
  raw_payload: unknown
}

export function nurtureTemplateKeyAndAudience(lead: NurtureLeadRow): {
  step: 1 | 2 | 3
  audience: "parent" | "senior"
  templateKey: string
  tier: LeadTier
} {
  const tier = (lead.lead_tier || "warm") as LeadTier
  const step = (lead.nurture_step ?? 0) as 1 | 2 | 3
  const raw = lead.raw_payload as { role?: string } | null
  const audience = raw?.role === "parent" ? "parent" : "senior"
  const templateKey = templateKeyForCronStep(lead.service || "media-day", step, audience)
  return { step, audience, templateKey, tier }
}

export type SendNurtureOpts = {
  forced?: boolean
  subject?: string
  html?: string
  /** Plain subject line (merge tokens); compiled with bodyPlain when sending. */
  subjectPlain?: string
  bodyPlain?: string
  /** Override which nurture template key to send (must match service catalog). */
  templateKey?: string
  /** IANA zone for scheduling the next email date after send. */
  timeZone?: string
  /** Calendar days after send to set next nurture (default 7). */
  nurtureGapDays?: number
}

/** Sends one nurture email for a lead (admin queue, force, or legacy). */
export async function sendNurtureForLead(
  admin: SupabaseClient,
  resend: Resend,
  opts: SendNurtureOpts,
  lead: NurtureLeadRow,
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const { step, audience: leadAudience, templateKey: defaultKey, tier } = nurtureTemplateKeyAndAudience(lead)
  if (step < 1 || step > 3) return { ok: false, error: "Invalid nurture_step" }

  const service = lead.service || "media-day"
  let templateKey = defaultKey
  if (opts.templateKey) {
    if (!isNurtureTemplateKey(service, opts.templateKey)) {
      return { ok: false, error: "Invalid template key for this service" }
    }
    templateKey = opts.templateKey
  }

  const catalogAud = catalogAudienceForKey(service, templateKey)
  const audience = catalogAud ?? leadAudience

  const ctx = ctxWithMagnet(lead.id, lead.name)
  const plainBody = opts.bodyPlain
  const hasPlainBody = plainBody !== undefined && plainBody.trim().length > 0

  let subject: string
  let html: string
  let overridden: boolean

  if (hasPlainBody) {
    let subj = mergePlainSubjectLine(opts.subjectPlain ?? "", ctx)
    if (!subj) {
      const pack = await resolveEmailTemplate(admin, service, templateKey, ctx, audience)
      subj = pack.subject
    }
    subject = subj
    html = compilePlainBodyToOutboundHtml(plainBody!, ctx)
    overridden = true
  } else if (opts.subject !== undefined || opts.html !== undefined) {
    const pack = await resolveEmailTemplate(admin, service, templateKey, ctx, audience)
    subject = opts.subject !== undefined ? opts.subject : pack.subject
    html = opts.html !== undefined ? sanitizeTemplateHtml(opts.html) : pack.html
    overridden = true
  } else {
    const pack = await resolveEmailTemplate(admin, service, templateKey, ctx, audience)
    subject = pack.subject
    html = pack.html
    overridden = false
  }

  const r = await resend.emails.send({
    from: EMAIL_FROM,
    to: lead.email,
    replyTo: EMAIL_REPLY_TO,
    subject,
    html,
    tags: [{ name: "lead_id", value: lead.id }],
  })

  if (r.error) return { ok: false, error: String(r.error.message || r.error) }

  const submittedAt = lead.created_at ? new Date(lead.created_at) : new Date()
  const nextState = advanceAfterNurtureSend({
    tier,
    currentStep: step,
    submittedAt,
    sentAt: new Date(),
  })

  const tz = opts.timeZone?.trim()
  const gap = opts.nurtureGapDays ?? 7
  let nextNurtureAt: string | null = null
  const patch: Record<string, unknown> = {
    nurture_step: nextState.nurture_step,
    next_nurture_at: nextState.next_nurture_at,
  }

  if (tz && nextState.nurture_step >= 1 && nextState.nurture_step <= 3) {
    const nextOn = addCalendarDaysYmd(todayYmdInTz(tz), gap)
    nextNurtureAt = `${nextOn}T12:00:00.000Z`
    patch.next_nurture_at = nextNurtureAt
    patch.next_nurture_on = nextOn
  } else if (nextState.nurture_step < 1 || nextState.nurture_step > 3) {
    patch.next_nurture_on = null
    patch.next_nurture_at = nextState.next_nurture_at
  }

  await admin.from("leads").update(patch).eq("id", lead.id)

  await insertLeadEvent(admin, lead.id, "nurture.sent", {
    templateKey,
    step,
    forced: Boolean(opts.forced),
    overridden,
    messageId: r.data?.id ?? null,
  })

  return { ok: true, messageId: r.data?.id }
}
