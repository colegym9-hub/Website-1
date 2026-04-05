/** Admin-facing labels for pipeline slugs (DB values unchanged). */

export const STAGE_OPTIONS: { value: string; label: string; description: string }[] = [
  {
    value: "contact_captured",
    label: "Contact captured",
    description: "Minimal info saved (e.g. partial form); not a full inquiry yet.",
  },
  {
    value: "submitted",
    label: "Submitted",
    description: "They completed a booking or inquiry form — main funnel entry.",
  },
  {
    value: "engaged_warm",
    label: "Engaged (warm)",
    description: "In conversation or nurture; not hot yet.",
  },
  {
    value: "hot_intent",
    label: "Hot intent",
    description: "Strong buying signal — prioritize follow-up and scheduling.",
  },
  {
    value: "call_booked",
    label: "Call booked",
    description: "Consultation or discovery call is on the calendar.",
  },
  {
    value: "shoot_booked",
    label: "Shoot booked",
    description: "Session or media day is scheduled / confirmed.",
  },
]

export function stageLabel(value: string): string {
  return STAGE_OPTIONS.find(s => s.value === value)?.label ?? value.replace(/_/g, " ")
}
