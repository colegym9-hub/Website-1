/**
 * Server-side lead scoring. Hot ≥ 70 → schedule_first; else warm_up.
 * Tweak thresholds in tierFromScore / weights as needed.
 */

export type LeadTier = "hot" | "warm" | "nurture"
export type CtaVariant = "schedule_first" | "warm_up"

const MD_SP_TIMELINE_ORDER = ["Next 2-3 weeks", "1-2 months out", "This season (3+ months)", "Still planning"] as const
const SR_SEASONS = ["Spring", "Summer", "Early Fall", "Late Fall", "Winter"] as const

/** Map MD/SP timeline label → 0–40 urgency */
export function urgencyFromMdSpTimeline(timeline: string): number {
  const i = MD_SP_TIMELINE_ORDER.indexOf(timeline as (typeof MD_SP_TIMELINE_ORDER)[number])
  if (i < 0) return 10
  return 40 - i * 10
}

/** Rough season urgency vs submission month (0–40). Next upcoming season window scores higher. */
export function urgencyFromSrSeason(timeline: string, now = new Date()): number {
  const month = now.getMonth() // 0–11
  const seasonIndex = SR_SEASONS.indexOf(timeline as (typeof SR_SEASONS)[number])
  if (seasonIndex < 0) return 12
  const seasonStartMonth = [2, 5, 7, 9, 11][seasonIndex] ?? 0
  let diff = seasonStartMonth - month
  if (diff < -3) diff += 12
  if (diff > 6) return 8
  if (diff <= 0) return 36
  return Math.max(8, 32 - diff * 4)
}

export function readinessPoints(readiness: string): number {
  if (readiness === "ready") return 22
  if (readiness === "comparing") return 12
  if (readiness === "exploring") return 4
  return 8
}

/** Package/frame tier rough intent (0–25) */
export function packageIntentPoints(service: string, packageIntent: number): number {
  if (packageIntent < 0) return 6
  if (service === "media-day") {
    return packageIntent >= 1 ? 18 : 12
  }
  if (service === "sportraits") {
    return [10, 14, 20][packageIntent] ?? 12
  }
  return [8, 14, 18, 22][packageIntent] ?? 10
}

export function enrichmentBonus(phone: string, notes: string, org?: string): number {
  let e = 0
  if (phone?.trim()) e += 5
  if (org?.trim()) e += 3
  const n = notes?.trim().length ?? 0
  if (n > 20) e += 5
  if (n > 120) e += 5
  return Math.min(e, 20)
}

export interface ScoreInput {
  service: string
  timeline: string
  readiness: string
  packageIntent: number
  phone: string
  notes: string
  org?: string
}

export function computeLeadScore(i: ScoreInput): number {
  let urgency = 0
  if (i.service === "senior-portraits") {
    urgency = urgencyFromSrSeason(i.timeline)
  } else {
    urgency = urgencyFromMdSpTimeline(i.timeline)
  }
  const intent = readinessPoints(i.readiness) + packageIntentPoints(i.service, i.packageIntent)
  const enrichment = enrichmentBonus(i.phone, i.notes, i.org)
  const intentCapped = Math.min(40, Math.round(intent * 0.55))
  return Math.min(100, urgency + intentCapped + enrichment)
}

export function tierFromScore(score: number): LeadTier {
  if (score >= 70) return "hot"
  if (score >= 45) return "warm"
  return "nurture"
}

export function ctaVariantFromTier(tier: LeadTier): CtaVariant {
  return tier === "hot" ? "schedule_first" : "warm_up"
}
