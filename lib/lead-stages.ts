/** Single vocabulary for lead_stage (plan: unify magnet_engaged → engaged_warm in DB). */

export const LEAD_STAGES = [
  "contact_captured",
  "submitted",
  "engaged_warm",
  "hot_intent",
  "call_booked",
  "shoot_booked",
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]

const TERMINAL_FOR_NURTURE: Set<string> = new Set(["hot_intent", "call_booked", "shoot_booked"])

export function isTerminalNurtureStage(stage: string | null | undefined): boolean {
  if (!stage) return false
  return TERMINAL_FOR_NURTURE.has(stage)
}
