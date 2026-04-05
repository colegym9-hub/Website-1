import type { LeadTier } from "@/lib/lead-score"

/** nurture_step: next manual nurture email index to send (1, 2, 3). 0 = none pending. */
export type NurtureCronState = {
  nurture_step: number
  next_nurture_at: string | null
}

/** After POST /api/book day-0 send: next nurture email is manual from admin (no scheduled next_nurture_at). */
export function initialNurtureCronState(args: {
  submittedAt: Date
  tier: LeadTier
}): NurtureCronState {
  const { tier } = args
  if (tier === "hot") {
    return { nurture_step: 3, next_nurture_at: null }
  }
  return { nurture_step: 1, next_nurture_at: null }
}

/** After admin sends a nurture email: advance step; no scheduled follow-up time. */
export function advanceAfterNurtureSend(args: {
  tier: LeadTier
  currentStep: number
  submittedAt: Date
  sentAt: Date
}): NurtureCronState {
  const { tier, currentStep } = args
  if (tier === "hot") {
    return { nurture_step: 0, next_nurture_at: null }
  }
  if (currentStep >= 3) {
    return { nurture_step: 0, next_nurture_at: null }
  }
  if (currentStep === 1) {
    return { nurture_step: 2, next_nurture_at: null }
  }
  if (currentStep === 2) {
    return { nurture_step: 3, next_nurture_at: null }
  }
  return { nurture_step: 0, next_nurture_at: null }
}

export function templateKeyForCronStep(service: string, step: 1 | 2 | 3, audience: "parent" | "senior"): string {
  if (service === "media-day") {
    return step === 1 ? "md_email1" : step === 2 ? "md_email2" : "md_email3"
  }
  if (service === "senior-portraits") {
    if (step === 1) return audience === "parent" ? "sr_email1_parent" : "sr_email1_senior"
    return step === 2 ? "sr_email2" : "sr_email3"
  }
  if (service === "sportraits") {
    return step === 1 ? "sp_email1" : step === 2 ? "sp_email2" : "sp_email3"
  }
  return "md_email1"
}

export function dayZeroTemplateKey(service: string, tier: LeadTier): string {
  if (service === "media-day" && tier === "hot") return "md_day0_hot"
  if (service === "media-day") return "md_day0"
  if (service === "senior-portraits") return "sr_day0"
  if (service === "sportraits") return "sp_day0"
  return "md_day0"
}
