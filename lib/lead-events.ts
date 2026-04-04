import type { SupabaseClient } from "@supabase/supabase-js"

export type LeadEventType =
  | "email.sent"
  | "link.clicked"
  | "link.magnet"
  | "email3.yes"
  | "email3.no"
  | "nurture.sent"
  | "recycle.sent"
  | "unsubscribed"
  | "schedule.clicked"

export async function insertLeadEvent(
  admin: SupabaseClient,
  leadId: string,
  type: LeadEventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await admin.from("lead_events").insert({
    lead_id: leadId,
    type,
    payload,
  })
  if (error) console.error("insertLeadEvent", type, error.message)
}
