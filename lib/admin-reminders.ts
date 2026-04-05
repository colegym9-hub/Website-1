import { TZDate } from "@date-fns/tz"
import { addDays, format, subHours } from "date-fns"

/** Nominal “send this day” moment: 9:00 AM in the viewer’s time zone on the due date. */
const NOMINAL_SEND_HOUR = 9

export function nurtureReminderKey(leadId: string, step: number, nextNurtureOn: string): string {
  return `nurture:${leadId}:${step}:${nextNurtureOn}`
}

export function recycleReminderKey(leadId: string, recycleOnYmd: string): string {
  return `recycle:${leadId}:${recycleOnYmd}`
}

/** When notifications may start: 8 hours before nominal send on the due date. */
export function nurtureNotifyWindowStartUtc(nextNurtureOn: string, timeZone: string): Date {
  const [y, m, d] = nextNurtureOn.split("-").map(Number)
  if (!y || !m || !d) return new Date(0)
  const at9 = new TZDate(y, m - 1, d, NOMINAL_SEND_HOUR, 0, 0, timeZone)
  return subHours(at9, 8)
}

/**
 * If no date is set, treat as “always eligible” (legacy / needs scheduling).
 * Otherwise eligible when now >= (9am local on due date − 8h).
 */
export function isNurtureReminderDue(nextNurtureOn: string | null | undefined, timeZone: string, now = new Date()): boolean {
  if (!nextNurtureOn || !/^\d{4}-\d{2}-\d{2}$/.test(nextNurtureOn)) return true
  return now.getTime() >= nurtureNotifyWindowStartUtc(nextNurtureOn, timeZone).getTime()
}

/** Calendar date of recycle_at in the given IANA zone (YYYY-MM-DD). */
export function recycleOnFromIso(recycleAtIso: string, timeZone: string): string {
  return format(new TZDate(new Date(recycleAtIso), timeZone), "yyyy-MM-dd")
}

export function isRecycleReminderDue(recycleAtIso: string, timeZone: string, now = new Date()): boolean {
  const ymd = recycleOnFromIso(recycleAtIso, timeZone)
  return now.getTime() >= nurtureNotifyWindowStartUtc(ymd, timeZone).getTime()
}

/** Add N calendar days to a YYYY-MM-DD string (civil date, no TZ shift). */
export function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const base = new Date(Date.UTC(y, m - 1, d))
  const next = addDays(base, days)
  return format(next, "yyyy-MM-dd")
}

/** Today as YYYY-MM-DD in the given IANA time zone. */
export function todayYmdInTz(timeZone: string, now = new Date()): string {
  return format(new TZDate(now, timeZone), "yyyy-MM-dd")
}
