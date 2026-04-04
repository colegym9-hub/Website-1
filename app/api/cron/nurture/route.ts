import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"
import { resolveEmailTemplate } from "@/lib/email-template-db"
import { isAutomationPaused, isServiceAutomationEnabled } from "@/lib/automation"
import { insertLeadEvent } from "@/lib/lead-events"
import { isTerminalNurtureStage } from "@/lib/lead-stages"
import { ctxWithMagnet } from "@/lib/nurture-mail"
import { sendNurtureForLead } from "@/lib/nurture-send-one"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

function inEasternSendWindow(d = new Date()): boolean {
  const eastern = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const day = eastern.getDay()
  if (day === 0 || day === 6) return false
  const h = eastern.getHours()
  return h >= 9 && h <= 16
}

function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  const auth = req.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!inEasternSendWindow()) {
    return NextResponse.json({ ok: true, skipped: "outside_eastern_window" })
  }

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "No admin client" }, { status: 500 })

  if (await isAutomationPaused(admin)) {
    return NextResponse.json({ ok: true, skipped: "automation_paused" })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ ok: true, skipped: "no_resend" })

  const resend = new Resend(resendKey)
  const nowIso = new Date().toISOString()
  let sent = 0

  const { data: recycleRows } = await admin
    .from("leads")
    .select("id,name,email,service,created_at")
    .lte("recycle_at", nowIso)
    .is("unsubscribed_at", null)
    .limit(25)

  for (const row of recycleRows ?? []) {
    if (!(await isServiceAutomationEnabled(admin, row.service || "media-day"))) continue
    const ctx = ctxWithMagnet(row.id, row.name)
    const pack = await resolveEmailTemplate(admin, row.service || "media-day", "recycle_checkin", ctx, "senior")
    const r = await resend.emails.send({
      from: EMAIL_FROM,
      to: row.email,
      replyTo: EMAIL_REPLY_TO,
      subject: pack.subject,
      html: pack.html,
      tags: [{ name: "lead_id", value: row.id }],
    })
    if (!r.error) {
      sent++
      await admin.from("leads").update({ recycle_at: null }).eq("id", row.id)
      await insertLeadEvent(admin, row.id, "recycle.sent", { messageId: r.data?.id })
    }
  }

  const { data: due } = await admin
    .from("leads")
    .select("id,name,email,service,lead_tier,lead_stage,nurture_step,created_at,raw_payload")
    .lte("next_nurture_at", nowIso)
    .is("unsubscribed_at", null)
    .is("nurture_paused_at", null)
    .gt("nurture_step", 0)
    .limit(40)

  for (const row of due ?? []) {
    if (isTerminalNurtureStage(row.lead_stage)) continue
    if (!(await isServiceAutomationEnabled(admin, row.service || "media-day"))) continue

    const result = await sendNurtureForLead(admin, resend, {}, row)
    if (result.ok) sent++
    else console.error("nurture send", row.id, result.error)
  }

  return NextResponse.json({ ok: true, sent })
}
