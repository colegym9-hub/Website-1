import type { SupabaseClient } from "@supabase/supabase-js"
import { loadAutomationSendGate } from "@/lib/automation"
import { isTerminalNurtureStage } from "@/lib/lead-stages"
import type { NurtureLeadRow } from "@/lib/nurture-send-one"

export async function filterNurtureDueRowsForQueue(
  admin: SupabaseClient,
  rows: NurtureLeadRow[],
): Promise<NurtureLeadRow[]> {
  const gate = await loadAutomationSendGate(admin)
  if (gate.paused) return []
  return rows.filter(r => {
    if (isTerminalNurtureStage(r.lead_stage)) return false
    if ((r.nurture_step ?? 0) < 1) return false
    return gate.serviceEnabled(r.service || "media-day")
  })
}

export type RecycleQueueRow = {
  id: string
  name: string
  email: string
  service: string | null
  recycle_at: string | null
  raw_payload?: unknown
}

export async function filterRecycleDueRowsForQueue(
  admin: SupabaseClient,
  rows: RecycleQueueRow[],
): Promise<RecycleQueueRow[]> {
  const gate = await loadAutomationSendGate(admin)
  if (gate.paused) return []
  return rows.filter(r => {
    if (!r.recycle_at) return false
    return gate.serviceEnabled(r.service || "media-day")
  })
}

/** Manual nurture from admin: no calendar “due” — only safety checks. */
export function nurtureSendBlockReason(lead: NurtureLeadRow & { unsubscribed_at?: string | null; nurture_paused_at?: string | null }): string | null {
  if (lead.unsubscribed_at) return "unsubscribed"
  if (lead.nurture_paused_at) return "nurture_paused"
  if ((lead.nurture_step ?? 0) < 1 || (lead.nurture_step ?? 0) > 3) return "invalid_step"
  if (isTerminalNurtureStage(lead.lead_stage)) return "terminal_stage"
  return null
}

export function recycleSendBlockReason(lead: RecycleQueueRow & { unsubscribed_at?: string | null }): string | null {
  if (lead.unsubscribed_at) return "unsubscribed"
  if (!lead.recycle_at) return "no_recycle"
  return null
}
