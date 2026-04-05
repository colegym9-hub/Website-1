import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"
import {
  compilePlainBodyToOutboundHtml,
  mergePlainSubjectLine,
  resolveEmailTemplate,
  sanitizeTemplateHtml,
} from "@/lib/email-template-db"
import { insertLeadEvent } from "@/lib/lead-events"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import type { SupabaseClient } from "@supabase/supabase-js"

export type RecycleLeadRow = {
  id: string
  name: string
  email: string
  service: string | null
  raw_payload?: unknown
}

export async function sendRecycleForLead(
  admin: SupabaseClient,
  resend: Resend,
  lead: RecycleLeadRow,
  opts?: { subject?: string; html?: string; subjectPlain?: string; bodyPlain?: string },
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const service = lead.service || "media-day"
  const raw = lead.raw_payload as { role?: string } | null
  const audience = raw?.role === "parent" ? "parent" : "senior"
  const ctx = ctxWithMagnet(lead.id, lead.name)
  const pack = await resolveEmailTemplate(admin, service, "recycle_checkin", ctx, audience)

  const plainBody = opts?.bodyPlain
  const hasPlainBody = plainBody !== undefined && plainBody.trim().length > 0

  let subject: string
  let html: string
  let overridden: boolean

  if (hasPlainBody) {
    let subj = mergePlainSubjectLine(opts?.subjectPlain ?? "", ctx)
    if (!subj) subj = pack.subject
    subject = subj
    html = compilePlainBodyToOutboundHtml(plainBody!, ctx)
    overridden = true
  } else {
    subject = opts?.subject !== undefined ? opts.subject : pack.subject
    html = opts?.html !== undefined ? sanitizeTemplateHtml(opts.html) : pack.html
    overridden = opts?.subject !== undefined || opts?.html !== undefined
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

  await admin.from("leads").update({ recycle_at: null }).eq("id", lead.id)
  await insertLeadEvent(admin, lead.id, "recycle.sent", {
    messageId: r.data?.id ?? null,
    overridden,
  })

  return { ok: true, messageId: r.data?.id }
}
