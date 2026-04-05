import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import {
  approxResolvedToMergeTags,
  applyMergeTagsToText,
  previewCtx,
  resolveEmailTemplate,
  stripHtmlToPlain,
} from "@/lib/email-template-db"
import { EMAIL_TEMPLATE_CATALOG } from "@/lib/email-template-catalog"
import { ensureWarmTierSeedsInDatabase, getWarmTierSeed } from "@/lib/warm-tier-email-seeds"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const PREVIEW_LEAD_ID = "00000000-0000-4000-8000-000000000001"

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  await ensureWarmTierSeedsInDatabase(admin)

  const ctx = previewCtx(PREVIEW_LEAD_ID)

  const entries = EMAIL_TEMPLATE_CATALOG.filter(e => e.group !== "day0")

  const items = await Promise.all(
    entries.map(async entry => {
      const { data: dbRow } = await admin
        .from("email_templates")
        .select("id, subject, body_html, body_plain, active")
        .eq("service", entry.service)
        .eq("template_key", entry.template_key)
        .maybeSingle()

      const rawPlain = String(dbRow?.body_plain ?? "")
      const rawHtml = String(dbRow?.body_html ?? "")
      const rawSubject = String(dbRow?.subject ?? "")
      const hasDbBody = Boolean(rawPlain.trim() || rawHtml.trim())
      const hasDbOverride = hasDbBody && dbRow?.active !== false

      const pack = await resolveEmailTemplate(admin, entry.service, entry.template_key, ctx, entry.audience)

      const previewSubject = hasDbOverride
        ? applyMergeTagsToText(rawSubject.trim() || pack.subject, ctx)
        : pack.subject
      const previewHtml = pack.html

      const seed = getWarmTierSeed(entry.service, entry.template_key)
      const needsStarter = !hasDbBody
      const suggestedPlain = needsStarter && seed ? seed.body_plain : ""
      const suggestedSubject =
        needsStarter && seed ? seed.subject : needsStarter ? approxResolvedToMergeTags(ctx, pack.subject) : ""

      const suggestedRawHtml = needsStarter && !seed ? approxResolvedToMergeTags(ctx, pack.html) : ""

      /** Same authoring text compose uses: DB plain → strip legacy HTML → seed / code fallbacks. */
      const editorBodyPlain =
        rawPlain.trim() ||
        (rawHtml.trim() ? stripHtmlToPlain(rawHtml) : "") ||
        suggestedPlain ||
        (suggestedRawHtml.trim() ? stripHtmlToPlain(suggestedRawHtml) : "")

      const editorSubject = rawSubject.trim() || suggestedSubject || ""

      return {
        ...entry,
        templateDbId: dbRow?.id ?? null,
        dbActive: dbRow?.active ?? true,
        rawSubject,
        rawPlain,
        rawHtml,
        editorSubject,
        editorBodyPlain,
        suggestedPlain,
        suggestedSubject,
        suggestedRawHtml,
        previewSubject,
        previewHtml,
        source: hasDbOverride ? ("db" as const) : ("repo" as const),
      }
    }),
  )

  return NextResponse.json({ items })
}
