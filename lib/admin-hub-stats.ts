import type { SupabaseClient } from "@supabase/supabase-js"
import { filterNurtureDueRowsForQueue, filterRecycleDueRowsForQueue } from "@/lib/follow-up-gate"

export type AdminHubStats = {
  totalLeads: number
  inquiries7d: number
  callBooked: number
  followUpsDue: number
  recycleDue: number
  funnelSchemaOk: boolean
}

export async function getAdminHubStats(admin: SupabaseClient): Promise<AdminHubStats> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [{ count: totalLeads }, { count: inquiries7d }, cbRes] = await Promise.all([
    admin.from("leads").select("*", { count: "exact", head: true }),
    admin.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since),
    admin.from("leads").select("id", { count: "exact", head: true }).not("call_booked_at", "is", null),
  ])

  let callBooked = 0
  if (cbRes.error) {
    /* column may be missing before migration */
  } else {
    callBooked = cbRes.count ?? 0
  }

  let followUpsDue = 0
  let recycleDue = 0
  let funnelSchemaOk = true

  const nRes = await admin
    .from("leads")
    .select("id,name,email,service,lead_tier,lead_stage,nurture_step,next_nurture_at,created_at,raw_payload")
    .is("unsubscribed_at", null)
    .is("nurture_paused_at", null)
    .gt("nurture_step", 0)
    .limit(120)

  if (cbRes.error) {
    funnelSchemaOk = false
  }

  if (nRes.error) {
    funnelSchemaOk = false
  } else {
    const filtered = await filterNurtureDueRowsForQueue(admin, nRes.data ?? [])
    followUpsDue = filtered.length
  }

  const rRes = await admin
    .from("leads")
    .select("id,name,email,service,recycle_at")
    .not("recycle_at", "is", null)
    .is("unsubscribed_at", null)
    .limit(80)

  if (rRes.error) {
    funnelSchemaOk = false
  } else if (funnelSchemaOk) {
    const rf = await filterRecycleDueRowsForQueue(admin, rRes.data ?? [])
    recycleDue = rf.length
  }

  return {
    totalLeads: totalLeads ?? 0,
    inquiries7d: inquiries7d ?? 0,
    callBooked,
    followUpsDue,
    recycleDue,
    funnelSchemaOk,
  }
}
