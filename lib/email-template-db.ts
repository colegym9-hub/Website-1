import type { SupabaseClient } from "@supabase/supabase-js"
import DOMPurify from "isomorphic-dompurify"
import { firstNameFromFullName, siteBase } from "@/lib/email-config"
import { signEngageToken } from "@/lib/engage-token"
import { signMagnetToken } from "@/lib/magnet-token"
import { getDefaultTemplate, MERGE_TAG_URLS, type NurtureMailCtx } from "@/lib/nurture-mail"

function mergeTagMap(ctx: NurtureMailCtx): Record<string, string> {
  const fn = firstNameFromFullName(ctx.name)
  const prep = `${siteBase()}/resources/welcome-pack?l=${encodeURIComponent(ctx.leadId)}&t=${encodeURIComponent(ctx.magnetToken)}`
  const work = `${siteBase()}/work`
  const scheduleTrack = `${siteBase()}/api/l?k=${encodeURIComponent(signEngageToken({ leadId: ctx.leadId, kind: "link", target: "schedule" }))}`
  const unsub = `${siteBase()}/api/unsub?k=${encodeURIComponent(signEngageToken({ leadId: ctx.leadId, kind: "unsub" }))}`
  return {
    firstName: fn,
    name: ctx.name,
    prepUrl: prep,
    workUrl: work,
    scheduleUrl: scheduleTrack,
    pixiesetUrl: MERGE_TAG_URLS.pixiesetInquiry,
    btsUrl: MERGE_TAG_URLS.mediaDayBts,
    mackenzieUrl: MERGE_TAG_URLS.mackenzieSession,
    replyTo: MERGE_TAG_URLS.replyTo,
    siteUrl: siteBase(),
    unsubscribeUrl: unsub,
  }
}

export function applyMergeTagsToText(template: string, ctx: NurtureMailCtx): string {
  const map = mergeTagMap(ctx)
  let out = template
  for (const [k, v] of Object.entries(map)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}|\\{${k}\\}`, "gi")
    out = out.replace(re, v)
  }
  return out
}

export function sanitizeTemplateHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

export async function resolveEmailTemplate(
  admin: SupabaseClient | null,
  service: string,
  templateKey: string,
  ctx: NurtureMailCtx,
  audience: "parent" | "senior",
): Promise<{ subject: string; html: string; textPreview?: string }> {
  const fallback = getDefaultTemplate(templateKey, ctx, audience)
  const base = fallback ?? getDefaultTemplate("md_day0", ctx, audience)!

  if (!admin) {
    return { subject: base.subject, html: base.html, textPreview: base.textPreview }
  }

  const { data } = await admin
    .from("email_templates")
    .select("subject, body_html, active")
    .eq("service", service)
    .eq("template_key", templateKey)
    .eq("active", true)
    .maybeSingle()

  if (!data?.body_html?.trim()) {
    return { subject: base.subject, html: base.html, textPreview: base.textPreview }
  }

  const subject = applyMergeTagsToText(data.subject?.trim() || base.subject, ctx)
  const html = applyMergeTagsToText(sanitizeTemplateHtml(data.body_html), ctx)
  return { subject, html, textPreview: base.textPreview }
}

/** For admin test send: build ctx from sample data. */
export function previewCtx(leadId: string): NurtureMailCtx {
  return {
    leadId,
    name: "Alex Sample",
    magnetToken: signMagnetToken(leadId),
  }
}
