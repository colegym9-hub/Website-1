import { addDays } from "date-fns"
import type { LeadTier } from "@/lib/lead-score"

/** nurture_step: next cron email index to send (1, 2, 3). 0 = no cron pending. */
export type NurtureCronState = {
  nurture_step: number
  next_nurture_at: string | null
}

function atRoughMorningEt(base: Date, dayOffset: number): Date {
  const d = addDays(base, dayOffset)
  d.setUTCHours(15, 30, 0, 0)
  return d
}

/** After POST /api/book day-0 send, set cron queue from tier + service. */
export function initialNurtureCronState(args: {
  submittedAt: Date
  tier: LeadTier
}): NurtureCronState {
  const { submittedAt, tier } = args
  if (tier === "hot") {
    return {
      nurture_step: 3,
      next_nurture_at: atRoughMorningEt(submittedAt, 10).toISOString(),
    }
  }
  return {
    nurture_step: 1,
    next_nurture_at: atRoughMorningEt(submittedAt, 2).toISOString(),
  }
}

/** After cron sends a nurture email, advance step and next send time. */
export function advanceAfterNurtureSend(args: {
  tier: LeadTier
  currentStep: number
  submittedAt: Date
  sentAt: Date
}): NurtureCronState {
  const { tier, currentStep, submittedAt, sentAt } = args
  if (tier === "hot") {
    return { nurture_step: 0, next_nurture_at: null }
  }
  if (currentStep >= 3) {
    return { nurture_step: 0, next_nurture_at: null }
  }
  if (currentStep === 1) {
    const target = atRoughMorningEt(submittedAt, 5)
    const next = target > sentAt ? target : addDays(sentAt, 3)
    next.setUTCHours(15, 30, 0, 0)
    return { nurture_step: 2, next_nurture_at: next.toISOString() }
  }
  if (currentStep === 2) {
    const target = atRoughMorningEt(submittedAt, 10)
    const next = target > sentAt ? target : addDays(sentAt, 4)
    next.setUTCHours(15, 30, 0, 0)
    return { nurture_step: 3, next_nurture_at: next.toISOString() }
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
