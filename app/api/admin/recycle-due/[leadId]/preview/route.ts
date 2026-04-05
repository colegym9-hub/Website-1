import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import {
  compilePlainBodyToOutboundHtml,
  getTemplateAuthoringPlain,
  mergePlainSubjectLine,
  resolveEmailTemplate,
} from "@/lib/email-template-db"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ leadId: string }> }) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { leadId } = await ctx.params
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: lead, error } = await admin
    .from("leads")
    .select("id,name,email,service,recycle_at,unsubscribed_at,raw_payload")
    .eq("id", leadId)
    .maybeSingle()

  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const service = lead.service || "media-day"
  const raw = lead.raw_payload as { role?: string } | null
  const audience = raw?.role === "parent" ? "parent" : "senior"
  const ctxMag = ctxWithMagnet(lead.id, lead.name)
  const authoring = await getTemplateAuthoringPlain(admin, service, "recycle_checkin", audience)
  let subject: string
  let html: string
  if (authoring.bodyPlain.trim()) {
    let subj = mergePlainSubjectLine(authoring.subjectPlain, ctxMag)
    if (!subj) {
      const pack = await resolveEmailTemplate(admin, service, "recycle_checkin", ctxMag, audience)
      subj = pack.subject
    }
    subject = subj
    html = compilePlainBodyToOutboundHtml(authoring.bodyPlain, ctxMag)
  } else {
    const pack = await resolveEmailTemplate(admin, service, "recycle_checkin", ctxMag, audience)
    subject = pack.subject
    html = pack.html
  }

  const { data: tmpl } = await admin
    .from("email_templates")
    .select("id")
    .eq("service", service)
    .eq("template_key", "recycle_checkin")
    .eq("active", true)
    .maybeSingle()

  return NextResponse.json({
    leadId: lead.id,
    name: lead.name,
    email: lead.email,
    service,
    templateKey: "recycle_checkin",
    templateDbId: tmpl?.id ?? null,
    subjectPlain: authoring.subjectPlain,
    bodyPlain: authoring.bodyPlain,
    subject,
    html,
  })
}
