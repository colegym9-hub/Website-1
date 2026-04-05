import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import {
  compilePlainBodyToOutboundHtml,
  getTemplateAuthoringPlain,
  mergePlainSubjectLine,
  resolveEmailTemplate,
} from "@/lib/email-template-db"
import {
  catalogAudienceForKey,
  isNurtureTemplateKey,
  nurtureTemplateOptionsForService,
} from "@/lib/email-template-catalog"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { nurtureTemplateKeyAndAudience, type NurtureLeadRow } from "@/lib/nurture-send-one"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest, ctx: { params: Promise<{ leadId: string }> }) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { leadId } = await ctx.params
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: lead, error } = await admin
    .from("leads")
    .select(
      "id,name,email,service,lead_tier,lead_stage,nurture_step,created_at,raw_payload,next_nurture_at,unsubscribed_at,nurture_paused_at",
    )
    .eq("id", leadId)
    .maybeSingle()

  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const row = lead as NurtureLeadRow
  const { step, audience: leadAudience, templateKey: defaultKey } = nurtureTemplateKeyAndAudience(row)
  if (step < 1 || step > 3) {
    return NextResponse.json({ error: "No nurture step pending for this lead" }, { status: 400 })
  }

  const service = row.service || "media-day"
  const tkParam = req.nextUrl.searchParams.get("templateKey")?.trim()
  let templateKey = defaultKey
  if (tkParam) {
    if (!isNurtureTemplateKey(service, tkParam)) {
      return NextResponse.json({ error: "Invalid template key for this service" }, { status: 400 })
    }
    templateKey = tkParam
  }

  const catalogAud = catalogAudienceForKey(service, templateKey) ?? leadAudience
  const ctxMag = ctxWithMagnet(row.id, row.name)

  const authoring = await getTemplateAuthoringPlain(admin, service, templateKey, catalogAud)
  let subject: string
  let html: string
  if (authoring.bodyPlain.trim()) {
    let subj = mergePlainSubjectLine(authoring.subjectPlain, ctxMag)
    if (!subj) {
      const pack = await resolveEmailTemplate(admin, service, templateKey, ctxMag, catalogAud)
      subj = pack.subject
    }
    subject = subj
    html = compilePlainBodyToOutboundHtml(authoring.bodyPlain, ctxMag)
  } else {
    const pack = await resolveEmailTemplate(admin, service, templateKey, ctxMag, catalogAud)
    subject = pack.subject
    html = pack.html
  }

  const { data: tmpl } = await admin
    .from("email_templates")
    .select("id")
    .eq("service", service)
    .eq("template_key", templateKey)
    .eq("active", true)
    .maybeSingle()

  return NextResponse.json({
    leadId: row.id,
    name: row.name,
    email: row.email,
    service,
    step,
    audience: catalogAud,
    templateKey,
    templateOptions: nurtureTemplateOptionsForService(service),
    templateDbId: tmpl?.id ?? null,
    subjectPlain: authoring.subjectPlain,
    bodyPlain: authoring.bodyPlain,
    subject,
    html,
  })
}
