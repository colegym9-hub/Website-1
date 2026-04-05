import { EMAIL_TEMPLATE_CATALOG } from "@/lib/email-template-catalog"

/** Human label for a template key; never show raw keys in admin UI. */
export function catalogLabelForTemplateKey(service: string, templateKey: string): string {
  const row = EMAIL_TEMPLATE_CATALOG.find(e => e.service === service && e.template_key === templateKey)
  return row?.label ?? "Email template"
}
