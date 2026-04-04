import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { count: inquiries7d } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since)

  const { count: callBooked } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .not("call_booked_at", "is", null)

  const { count: yesClicks } = await admin
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "email3.yes")

  const { count: noClicks } = await admin
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "email3.no")

  return NextResponse.json({
    inquiriesLast7Days: inquiries7d ?? 0,
    leadsWithCallBooked: callBooked ?? 0,
    email3YesClicks: yesClicks ?? 0,
    email3NoClicks: noClicks ?? 0,
  })
}
