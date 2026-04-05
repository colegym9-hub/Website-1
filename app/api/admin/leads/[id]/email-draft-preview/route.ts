import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUser } from "@/lib/admin-auth"
import {
  catalogAudienceForKey,
  isNurtureTemplateKey,
} from "@/lib/email-template-catalog"
import {
  compilePlainBodyToOutboundHtml,
  mergePlainSubjectLine,
  resolveEmailTemplate,
} from "@/lib/email-template-db"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { nurtureTemplateKeyAndAudience, type NurtureLeadRow } from "@/lib/nurture-send-one"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const bodySchema = z.object({
  subjectPlain: z.string(),
  bodyPlain: z.string(),
  templateKey: z.string().optional(),
  mode: z.enum(["nurture", "recycle"]).default("nurture"),
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: lead, error } = await admin
    .from("leads")
    .select("id,name,email,service,raw_payload,nurture_step,created_at,lead_tier,lead_stage")
    .eq("id", id)
    .maybeSingle()

  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const { subjectPlain, bodyPlain, templateKey: tkOpt, mode } = parsed.data
  const service = lead.service || "media-day"
  const row = lead as NurtureLeadRow
  const ctxMag = ctxWithMagnet(row.id, row.name)

  let templateKey = "recycle_checkin"
  let audience: "parent" | "senior" = "senior"

  if (mode === "recycle") {
    const raw = lead.raw_payload as { role?: string } | null
    audience = raw?.role === "parent" ? "parent" : "senior"
  } else {
    const { audience: aud, templateKey: def } = nurtureTemplateKeyAndAudience(row)
    audience = aud
    templateKey = tkOpt && isNurtureTemplateKey(service, tkOpt) ? tkOpt : def
    const ca = catalogAudienceForKey(service, templateKey)
    if (ca) audience = ca
  }

  if (bodyPlain.trim()) {
    let subject = mergePlainSubjectLine(subjectPlain, ctxMag)
    if (!subject) {
      const pack = await resolveEmailTemplate(admin, service, templateKey, ctxMag, audience)
      subject = pack.subject
    }
    const html = compilePlainBodyToOutboundHtml(bodyPlain, ctxMag)
    return NextResponse.json({ subject, html })
  }

  const pack = await resolveEmailTemplate(admin, service, templateKey, ctxMag, audience)
  const subject = mergePlainSubjectLine(subjectPlain, ctxMag) || pack.subject
  return NextResponse.json({ subject, html: pack.html })
}
