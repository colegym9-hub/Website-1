import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sanitizeTemplateHtml } from "@/lib/email-template-db"
import { getAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data, error } = await admin.from("email_templates").select("*").order("service").order("template_key")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ templates: data ?? [] })
}

const postSchema = z.object({
  service: z.string().min(1),
  template_key: z.string().min(1),
  subject: z.string(),
  body_html: z.string().optional().default(""),
  body_plain: z.string().optional().default(""),
  active: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = postSchema.parse(await req.json())
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data, error } = await admin
    .from("email_templates")
    .insert({
      service: body.service,
      template_key: body.template_key,
      subject: body.subject,
      body_plain: body.body_plain,
      body_html: body.body_html?.trim() ? sanitizeTemplateHtml(body.body_html) : "",
      active: body.active ?? true,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, id: data?.id })
}
