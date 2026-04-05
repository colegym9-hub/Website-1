import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import {
  approxResolvedToMergeTags,
  applyMergeTagsToText,
  mergeTagMap,
  previewCtx,
  sanitizeTemplateHtml,
  stripHtmlToPlain,
} from "@/lib/email-template-db"
import { compilePlainBodyToHtml, expandPlainMergeValues } from "@/lib/plain-email-compile"
import { EMAIL_TEMPLATE_CATALOG } from "@/lib/email-template-catalog"
import { getDefaultTemplate } from "@/lib/nurture-mail"
import { getWarmTierSeed } from "@/lib/warm-tier-email-seeds"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const PREVIEW_LEAD_ID = "00000000-0000-4000-8000-000000000001"

export const maxDuration = 30

export async function GET() {
  try {
    return await handleGet()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[catalog] unhandled error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function handleGet() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const ctx = previewCtx(PREVIEW_LEAD_ID)
  const entries = EMAIL_TEMPLATE_CATALOG.filter(e => e.group !== "day0")

  // Single bulk fetch instead of one query per template
  const services = [...new Set(entries.map(e => e.service))]
  const { data: allDbRows, error: dbError } = await admin
    .from("email_templates")
    .select("id, service, template_key, subject, body_html, body_plain, active")
    .in("service", services)

  if (dbError) {
    console.error("[catalog] db error:", dbError.message)
    return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 })
  }

  const rowMap = new Map(
    (allDbRows ?? []).map(r => [`${r.service}::${r.template_key}`, r]),
  )

  const tagMap = mergeTagMap(ctx)

  const items = entries.map(entry => {
    const dbRow = rowMap.get(`${entry.service}::${entry.template_key}`) ?? null

    const rawPlain = String(dbRow?.body_plain ?? "")
    const rawHtml = String(dbRow?.body_html ?? "")
    const rawSubject = String(dbRow?.subject ?? "")
    const hasDbBody = Boolean(rawPlain.trim() || rawHtml.trim())
    const hasDbOverride = hasDbBody && dbRow?.active !== false

    // Build preview HTML inline from pre-fetched data (no extra DB round-trip)
    const fallback = getDefaultTemplate(entry.template_key, ctx, entry.audience)
    const base = fallback ?? getDefaultTemplate("md_day0", ctx, entry.audience)!

    let previewSubject: string
    let previewHtml: string

    if (hasDbOverride) {
      if (rawPlain.trim()) {
        const expanded = expandPlainMergeValues(rawPlain.trim(), tagMap)
        previewHtml = sanitizeTemplateHtml(compilePlainBodyToHtml(expanded))
        previewSubject = applyMergeTagsToText(rawSubject.trim() || base.subject, ctx)
      } else if (rawHtml.trim()) {
        previewHtml = applyMergeTagsToText(sanitizeTemplateHtml(rawHtml), ctx)
        previewSubject = applyMergeTagsToText(rawSubject.trim() || base.subject, ctx)
      } else {
        previewHtml = base.html
        previewSubject = base.subject
      }
    } else {
      previewHtml = base.html
      previewSubject = base.subject
    }

    const seed = getWarmTierSeed(entry.service, entry.template_key)
    const needsStarter = !hasDbBody
    const suggestedPlain = needsStarter && seed ? seed.body_plain : ""
    const suggestedSubject =
      needsStarter && seed
        ? seed.subject
        : needsStarter
          ? approxResolvedToMergeTags(ctx, base.subject)
          : ""
    const suggestedRawHtml = needsStarter && !seed ? approxResolvedToMergeTags(ctx, base.html) : ""

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
  })

  return NextResponse.json({ items })
}

