import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { getAdminUser } from "@/lib/admin-auth"
import { sendNurtureForLead } from "@/lib/nurture-send-one"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const bodySchema = z.object({ leadId: z.string().uuid() })

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { leadId } = bodySchema.parse(await req.json())
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })

  const { data: lead, error } = await admin.from("leads").select("*").eq("id", leadId).maybeSingle()
  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const resend = new Resend(key)
  const result = await sendNurtureForLead(admin, resend, { forced: true }, lead)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, messageId: result.messageId })
}
