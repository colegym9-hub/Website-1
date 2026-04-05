import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { allWarmTierSeedRows } from "@/lib/warm-tier-email-seeds"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

/** Upserts warm-tier plain-text templates into email_templates (does not touch Day 0). */
export async function POST() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const rows = allWarmTierSeedRows()
  const now = new Date().toISOString()
  let upserted = 0

  for (const row of rows) {
    const { error } = await admin.from("email_templates").upsert(
      {
        service: row.service,
        template_key: row.template_key,
        subject: row.subject,
        body_plain: row.body_plain,
        body_html: "",
        active: true,
        updated_at: now,
      },
      { onConflict: "service,template_key" },
    )
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    upserted++
  }

  return NextResponse.json({ ok: true, upserted })
}
