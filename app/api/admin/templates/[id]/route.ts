import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sanitizeTemplateHtml } from "@/lib/email-template-db"
import { getAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const patchSchema = z
  .object({
    subject: z.string().optional(),
    body_html: z.string().optional(),
    body_plain: z.string().optional(),
    active: z.boolean().optional(),
  })
  .strict()

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await ctx.params
  const body = patchSchema.parse(await req.json())
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.subject !== undefined) update.subject = body.subject
  if (body.body_html !== undefined) update.body_html = sanitizeTemplateHtml(body.body_html)
  if (body.body_plain !== undefined) update.body_plain = body.body_plain
  if (body.active !== undefined) update.active = body.active

  const { error } = await admin.from("email_templates").update(update).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
