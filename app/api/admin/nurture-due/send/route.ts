import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { loadAutomationSendGate } from "@/lib/automation"
import { getAdminUser } from "@/lib/admin-auth"
import { nurtureSendBlockReason } from "@/lib/follow-up-gate"
import { sendNurtureForLead, type NurtureLeadRow } from "@/lib/nurture-send-one"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const bodySchema = z.object({
  leadId: z.string().uuid(),
  subject: z.string().optional(),
  html: z.string().optional(),
  subjectPlain: z.string().optional(),
  bodyPlain: z.string().optional(),
  templateKey: z.string().optional(),
  timeZone: z.string().optional(),
  nurtureGapDays: z.number().int().min(1).max(90).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const gate = await loadAutomationSendGate(admin)
  if (gate.paused) {
    return NextResponse.json({ error: "automation_paused" }, { status: 403 })
  }

  const { leadId, subject, html, subjectPlain, bodyPlain, templateKey, timeZone, nurtureGapDays } = parsed.data
  const { data: lead, error } = await admin.from("leads").select("*").eq("id", leadId).maybeSingle()
  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const row = lead as NurtureLeadRow & {
    next_nurture_at?: string | null
    unsubscribed_at?: string | null
    nurture_paused_at?: string | null
  }

  if (!gate.serviceEnabled(row.service || "media-day")) {
    return NextResponse.json({ error: "service_disabled" }, { status: 403 })
  }

  const block = nurtureSendBlockReason(row)
  if (block) return NextResponse.json({ error: block }, { status: 400 })

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })

  const resend = new Resend(key)
  const result = await sendNurtureForLead(
    admin,
    resend,
    {
      forced: false,
      ...(subject !== undefined ? { subject } : {}),
      ...(html !== undefined ? { html } : {}),
      ...(subjectPlain !== undefined ? { subjectPlain } : {}),
      ...(bodyPlain !== undefined ? { bodyPlain } : {}),
      ...(templateKey !== undefined ? { templateKey } : {}),
      ...(timeZone !== undefined ? { timeZone } : {}),
      ...(nurtureGapDays !== undefined ? { nurtureGapDays } : {}),
    },
    row,
  )
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, messageId: result.messageId })
}
