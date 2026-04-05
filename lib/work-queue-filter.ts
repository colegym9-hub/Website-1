import type { SupabaseClient } from "@supabase/supabase-js"
import {
  isNurtureReminderDue,
  isRecycleReminderDue,
  recycleOnFromIso,
  nurtureReminderKey,
  recycleReminderKey,
} from "@/lib/admin-reminders"
import {
  filterNurtureDueRowsForQueue,
  filterRecycleDueRowsForQueue,
  type RecycleQueueRow,
} from "@/lib/follow-up-gate"
import type { NurtureLeadRow } from "@/lib/nurture-send-one"

export type NurtureRowWithSchedule = NurtureLeadRow & {
  next_nurture_on?: string | null
  completed_at?: string | null
}

export async function loadDismissalKeySet(admin: SupabaseClient, leadIds: string[]): Promise<Set<string>> {
  if (leadIds.length === 0) return new Set()
  const { data, error } = await admin.from("admin_reminder_dismissals").select("reminder_key").in("lead_id", leadIds)
  if (error) {
    console.error("admin_reminder_dismissals", error.message)
    return new Set()
  }
  return new Set((data ?? []).map(r => r.reminder_key as string))
}

export function nurtureBellKey(row: NurtureRowWithSchedule, step: number): string {
  const on = row.next_nurture_on && /^\d{4}-\d{2}-\d{2}$/.test(row.next_nurture_on) ? row.next_nurture_on : "unscheduled"
  return nurtureReminderKey(row.id, step, on)
}

export function filterNurtureForBell(
  rows: NurtureRowWithSchedule[],
  dismissed: Set<string>,
  timeZone: string,
): NurtureRowWithSchedule[] {
  return rows.filter(row => {
    if (row.completed_at) return false
    const step = row.nurture_step ?? 0
    if (step < 1 || step > 3) return false
    if (!isNurtureReminderDue(row.next_nurture_on, timeZone)) return false
    const key = nurtureBellKey(row, step)
    if (dismissed.has(key)) return false
    return true
  })
}

export function recycleBellKey(row: RecycleQueueRow, timeZone: string): string {
  return recycleReminderKey(row.id, recycleOnFromIso(row.recycle_at!, timeZone))
}

export function filterRecycleForBell(
  rows: RecycleQueueRow[],
  dismissed: Set<string>,
  timeZone: string,
): RecycleQueueRow[] {
  return rows.filter(row => {
    if (!row.recycle_at) return false
    if (!isRecycleReminderDue(row.recycle_at, timeZone)) return false
    const key = recycleBellKey(row, timeZone)
    if (dismissed.has(key)) return false
    return true
  })
}

export async function buildBellNurtureList(
  admin: SupabaseClient,
  timeZone: string,
): Promise<NurtureRowWithSchedule[]> {
  const { data, error } = await admin
    .from("leads")
    .select(
      "id,name,email,service,lead_tier,lead_stage,nurture_step,created_at,raw_payload,next_nurture_on,completed_at",
    )
    .is("unsubscribed_at", null)
    .is("nurture_paused_at", null)
    .is("completed_at", null)
    .gt("nurture_step", 0)
    .order("created_at", { ascending: false })
    .limit(120)

  if (error) throw new Error(error.message)
  const filtered = await filterNurtureDueRowsForQueue(admin, (data ?? []) as NurtureRowWithSchedule[])
  const ids = filtered.map(r => r.id)
  const dismissed = await loadDismissalKeySet(admin, ids)
  return filterNurtureForBell(filtered, dismissed, timeZone)
}

export async function buildBellRecycleList(admin: SupabaseClient, timeZone: string): Promise<RecycleQueueRow[]> {
  const { data, error } = await admin
    .from("leads")
    .select("id,name,email,service,recycle_at,raw_payload")
    .not("recycle_at", "is", null)
    .is("unsubscribed_at", null)
    .is("completed_at", null)
    .limit(80)

  if (error) throw new Error(error.message)
  const filtered = await filterRecycleDueRowsForQueue(admin, (data ?? []) as RecycleQueueRow[])
  const ids = filtered.map(r => r.id)
  const dismissed = await loadDismissalKeySet(admin, ids)
  return filterRecycleForBell(filtered, dismissed, timeZone)
}
