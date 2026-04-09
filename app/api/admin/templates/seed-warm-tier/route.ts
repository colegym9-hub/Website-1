import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { allWarmTierSeedRows } from "@/lib/warm-tier-email-seeds"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

/** Seeds warm-tier plain-text templates into email_templates without overwriting existing content. */
export async function POST() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const rows = allWarmTierSeedRows()
  const now = new Date().toISOString()
  let upserted = 0

  for (const row of rows) {
    const { data: existing, error: selectError } = await admin
      .from("email_templates")
      .select("id, body_plain, body_html")
      .eq("service", row.service)
      .eq("template_key", row.template_key)
      .maybeSingle()

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 400 })
    }

    const hasContent = Boolean(existing?.body_plain?.trim() || existing?.body_html?.trim())
    if (hasContent) continue

    const payload = {
      subject: row.subject,
      body_plain: row.body_plain,
      body_html: "",
      active: true,
      updated_at: now,
    }

    if (existing?.id) {
      const { error } = await admin.from("email_templates").update(payload).eq("id", existing.id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    } else {
      const { error } = await admin.from("email_templates").insert({
        service: row.service,
        template_key: row.template_key,
        ...payload,
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    upserted++
  }

  return NextResponse.json({ ok: true, upserted })
}
