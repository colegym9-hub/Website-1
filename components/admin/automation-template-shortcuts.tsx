import Link from "next/link"
import { EMAIL_TEMPLATE_CATALOG, catalogAnchorId } from "@/lib/email-template-catalog"

const SERVICE_ORDER = ["media-day", "senior-portraits", "sportraits"] as const
const SERVICE_LABEL: Record<string, string> = {
  "media-day": "Media Day",
  "senior-portraits": "Senior",
  sportraits: "Sportraits",
}

export function AutomationTemplateShortcuts() {
  return (
    <div className="rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] p-5">
      <h2 className="font-heading text-base text-[var(--ac-text)]">Email templates</h2>
      <p className="mt-1 text-xs text-[var(--ac-text-muted)] leading-relaxed">
        Edit nurture and recycle copy (Day 0 confirmation sends automatically). Opens the Templates page at the right
        card.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {SERVICE_ORDER.map(svc => (
          <div key={svc}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ac-text-muted)]">
              {SERVICE_LABEL[svc]}
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {EMAIL_TEMPLATE_CATALOG.filter(e => e.service === svc && e.group !== "day0").map(e => (
                <li key={`${e.service}-${e.template_key}`}>
                  <Link
                    href={`/admin/templates#${catalogAnchorId(e.service, e.template_key)}`}
                    className="text-[var(--ac-accent)] hover:underline"
                  >
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
