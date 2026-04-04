import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"
import { resolveEmailTemplate } from "@/lib/email-template-db"
import { getAdminUser } from "@/lib/admin-auth"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const bodySchema = z.object({
  leadId: z.string().uuid(),
  to: z.string().email(),
  templateKey: z.string().min(1),
  service: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = bodySchema.parse(await req.json())
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: lead } = await admin.from("leads").select("name").eq("id", body.leadId).maybeSingle()
  const name = lead?.name ?? "Test"

  const raw = await admin.from("leads").select("raw_payload").eq("id", body.leadId).maybeSingle()
  const role = (raw.data?.raw_payload as { role?: string } | null)?.role
  const audience = role === "parent" ? "parent" : "senior"

  const ctx = ctxWithMagnet(body.leadId, name)
  const pack = await resolveEmailTemplate(admin, body.service, body.templateKey, ctx, audience)

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })

  const resend = new Resend(key)
  const r = await resend.emails.send({
    from: EMAIL_FROM,
    to: body.to,
    replyTo: EMAIL_REPLY_TO,
    subject: `[TEST] ${pack.subject}`,
    html: pack.html,
  })

  if (r.error) return NextResponse.json({ error: String(r.error.message) }, { status: 400 })
  return NextResponse.json({ ok: true, id: r.data?.id })
}
