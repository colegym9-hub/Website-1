/**
 * Every email template the funnel can resolve (repo defaults + optional DB overrides).
 * Used by admin Templates to list/edit the full set.
 */
export type CatalogAudience = "parent" | "senior"

export type EmailTemplateCatalogEntry = {
  service: string
  template_key: string
  label: string
  audience: CatalogAudience
  /** Short group for UI sections */
  group: "day0" | "nurture" | "recycle"
}

export const EMAIL_TEMPLATE_CATALOG: EmailTemplateCatalogEntry[] = [
  { service: "media-day", template_key: "md_day0", label: "Media Day — Day 0 (warm)", audience: "senior", group: "day0" },
  { service: "media-day", template_key: "md_day0_hot", label: "Media Day — Day 0 (hot)", audience: "senior", group: "day0" },
  { service: "media-day", template_key: "md_email1", label: "Media Day — Nurture 1", audience: "senior", group: "nurture" },
  { service: "media-day", template_key: "md_email2", label: "Media Day — Nurture 2", audience: "senior", group: "nurture" },
  { service: "media-day", template_key: "md_email3", label: "Media Day — Nurture 3", audience: "senior", group: "nurture" },
  { service: "media-day", template_key: "recycle_checkin", label: "Media Day — Recycle check-in", audience: "senior", group: "recycle" },

  { service: "senior-portraits", template_key: "sr_day0", label: "Senior — Day 0", audience: "senior", group: "day0" },
  { service: "senior-portraits", template_key: "sr_email1_parent", label: "Senior — Nurture 1 (parent)", audience: "parent", group: "nurture" },
  { service: "senior-portraits", template_key: "sr_email1_senior", label: "Senior — Nurture 1 (senior)", audience: "senior", group: "nurture" },
  { service: "senior-portraits", template_key: "sr_email2", label: "Senior — Nurture 2", audience: "senior", group: "nurture" },
  { service: "senior-portraits", template_key: "sr_email3", label: "Senior — Nurture 3", audience: "senior", group: "nurture" },
  { service: "senior-portraits", template_key: "recycle_checkin", label: "Senior — Recycle check-in", audience: "senior", group: "recycle" },

  { service: "sportraits", template_key: "sp_day0", label: "Sportraits — Day 0", audience: "senior", group: "day0" },
  { service: "sportraits", template_key: "sp_email1", label: "Sportraits — Nurture 1", audience: "senior", group: "nurture" },
  { service: "sportraits", template_key: "sp_email2", label: "Sportraits — Nurture 2", audience: "senior", group: "nurture" },
  { service: "sportraits", template_key: "sp_email3", label: "Sportraits — Nurture 3", audience: "senior", group: "nurture" },
  { service: "sportraits", template_key: "recycle_checkin", label: "Sportraits — Recycle check-in", audience: "senior", group: "recycle" },
]

export function catalogAnchorId(service: string, template_key: string): string {
  return `tpl-${service.replace(/[^a-z0-9]/gi, "-")}-${template_key}`
}

export function catalogAudienceForKey(service: string, templateKey: string): "parent" | "senior" | null {
  const e = EMAIL_TEMPLATE_CATALOG.find(x => x.service === service && x.template_key === templateKey)
  return e?.audience ?? null
}

/** Nurture template keys available for a service (compose picker). */
export function nurtureTemplateOptionsForService(service: string): { template_key: string; label: string }[] {
  return EMAIL_TEMPLATE_CATALOG.filter(e => e.service === service && e.group === "nurture").map(e => ({
    template_key: e.template_key,
    label: e.label,
  }))
}

export function isNurtureTemplateKey(service: string, templateKey: string): boolean {
  return EMAIL_TEMPLATE_CATALOG.some(
    e => e.service === service && e.template_key === templateKey && e.group === "nurture",
  )
}

export function isRecycleTemplateKey(service: string, templateKey: string): boolean {
  return EMAIL_TEMPLATE_CATALOG.some(
    e => e.service === service && e.template_key === templateKey && e.group === "recycle",
  )
}
