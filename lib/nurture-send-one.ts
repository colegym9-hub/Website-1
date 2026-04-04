import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"
import { resolveEmailTemplate } from "@/lib/email-template-db"
import { insertLeadEvent } from "@/lib/lead-events"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { advanceAfterNurtureSend, templateKeyForCronStep } from "@/lib/nurture-schedule"
import type { LeadTier } from "@/lib/lead-score"
import type { SupabaseClient } from "@supabase/supabase-js"

/** Sends one nurture email for a lead (cron step or force). Returns message id or error string. */
export async function sendNurtureForLead(
  admin: SupabaseClient,
  resend: Resend,
  opts: { forced?: boolean },
  lead: {
    id: string
    name: string
    email: string
    service: string | null
    lead_tier: string | null
    lead_stage: string | null
    nurture_step: number | null
    created_at: string | null
    raw_payload: unknown
  },
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const tier = (lead.lead_tier || "warm") as LeadTier
  const step = (lead.nurture_step ?? 0) as 1 | 2 | 3
  if (step < 1 || step > 3) return { ok: false, error: "Invalid nurture_step" }

  const raw = lead.raw_payload as { role?: string } | null
  const audience = raw?.role === "parent" ? "parent" : "senior"
  const templateKey = templateKeyForCronStep(lead.service || "media-day", step, audience)
  const ctx = ctxWithMagnet(lead.id, lead.name)
  const pack = await resolveEmailTemplate(admin, lead.service || "media-day", templateKey, ctx, audience)

  const r = await resend.emails.send({
    from: EMAIL_FROM,
    to: lead.email,
    replyTo: EMAIL_REPLY_TO,
    subject: pack.subject,
    html: pack.html,
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

  await admin
    .from("leads")
    .update({
      nurture_step: nextState.nurture_step,
      next_nurture_at: nextState.next_nurture_at,
    })
    .eq("id", lead.id)

  await insertLeadEvent(admin, lead.id, "nurture.sent", {
    templateKey,
    step,
    forced: Boolean(opts.forced),
    messageId: r.data?.id ?? null,
  })

  return { ok: true, messageId: r.data?.id }
}
