import type { SupabaseClient } from "@supabase/supabase-js"
import DOMPurify from "isomorphic-dompurify"
import { firstNameFromFullName, siteBase } from "@/lib/email-config"
import { signEngageToken } from "@/lib/engage-token"
import { signMagnetToken } from "@/lib/magnet-token"
import { compilePlainBodyToHtml, expandPlainMergeValues } from "@/lib/plain-email-compile"
import { getDefaultTemplate, MERGE_TAG_URLS, type NurtureMailCtx } from "@/lib/nurture-mail"
import { getWarmTierSeed } from "@/lib/warm-tier-email-seeds"

export function mergeTagMap(ctx: NurtureMailCtx): Record<string, string> {
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

/** Rough HTML → plain for authoring when only body_html exists in DB. */
export function stripHtmlToPlain(html: string): string {
  let t = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  t = t.replace(/<br\s*\/?>/gi, "\n")
  t = t.replace(/<\/p>/gi, "\n\n")
  t = t.replace(/<\/div>/gi, "\n")
  t = t.replace(/<[^>]+>/g, "")
  t = t.replace(/&nbsp;/g, " ")
  t = t.replace(/&amp;/g, "&")
  t = t.replace(/&lt;/g, "<")
  t = t.replace(/&gt;/g, ">")
  return t.replace(/\n{3,}/g, "\n\n").trim()
}

export function mergePlainSubjectLine(subjectPlain: string, ctx: NurtureMailCtx): string {
  const map = mergeTagMap(ctx)
  const s = subjectPlain.trim()
  if (!s) return ""
  return applyMergeTagsToText(expandPlainMergeValues(s, map), ctx)
}

export function compilePlainBodyToOutboundHtml(bodyPlain: string, ctx: NurtureMailCtx): string {
  const map = mergeTagMap(ctx)
  return sanitizeTemplateHtml(compilePlainBodyToHtml(expandPlainMergeValues(bodyPlain.trim(), map)))
}

/**
 * Subject + body lines stored as plain (merge tokens). Used for admin compose → Resend HTML.
 */
export async function getTemplateAuthoringPlain(
  admin: SupabaseClient | null,
  service: string,
  templateKey: string,
  audience: "parent" | "senior",
): Promise<{ subjectPlain: string; bodyPlain: string }> {
  if (admin) {
    const { data } = await admin
      .from("email_templates")
      .select("subject, body_plain, body_html")
      .eq("service", service)
      .eq("template_key", templateKey)
      .maybeSingle()

    if (data?.body_plain?.trim()) {
      return { subjectPlain: data.subject?.trim() || "", bodyPlain: data.body_plain.trim() }
    }
    if (data?.body_html?.trim()) {
      return {
        subjectPlain: data.subject?.trim() || "",
        bodyPlain: stripHtmlToPlain(data.body_html),
      }
    }
  }

  const seed = getWarmTierSeed(service, templateKey)
  if (seed) return { subjectPlain: seed.subject, bodyPlain: seed.body_plain }

  const ctx = previewCtx("00000000-0000-4000-8000-000000000001")
  const pack = await resolveEmailTemplate(admin, service, templateKey, ctx, audience)
  return {
    subjectPlain: approxResolvedToMergeTags(ctx, pack.subject),
    bodyPlain: stripHtmlToPlain(pack.html),
  }
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
    .select("subject, body_html, body_plain, active")
    .eq("service", service)
    .eq("template_key", templateKey)
    .eq("active", true)
    .maybeSingle()

  if (!data) {
    return { subject: base.subject, html: base.html, textPreview: base.textPreview }
  }

  const map = mergeTagMap(ctx)
  const subjectFromRow = (s: string) => applyMergeTagsToText(expandPlainMergeValues(s, map), ctx)

  if (data.body_plain?.trim()) {
    const expanded = expandPlainMergeValues(data.body_plain.trim(), map)
    const html = sanitizeTemplateHtml(compilePlainBodyToHtml(expanded))
    return {
      subject: subjectFromRow(data.subject?.trim() || base.subject),
      html,
      textPreview: base.textPreview,
    }
  }

  if (data.body_html?.trim()) {
    return {
      subject: subjectFromRow(data.subject?.trim() || base.subject),
      html: applyMergeTagsToText(sanitizeTemplateHtml(data.body_html), ctx),
      textPreview: base.textPreview,
    }
  }

  return { subject: base.subject, html: base.html, textPreview: base.textPreview }
}

/** For admin test send: build ctx from sample data. */
export function previewCtx(leadId: string): NurtureMailCtx {
  return {
    leadId,
    name: "Alex Sample",
    magnetToken: signMagnetToken(leadId),
  }
}

/**
 * Best-effort: replace resolved preview values with merge tags so DB rows stay portable.
 * Used when seeding an editor from code defaults (avoid storing sample-only signed URLs).
 */
export function approxResolvedToMergeTags(ctx: NurtureMailCtx, text: string): string {
  const map = mergeTagMap(ctx)
  let out = text
  const entries = Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  for (const [k, v] of entries) {
    if (v.length < 12) continue
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out.replace(new RegExp(esc, "g"), `{{${k}}}`)
  }
  if (ctx.name.length >= 3) {
    out = out.split(ctx.name).join("{{name}}")
  }
  const fn = firstNameFromFullName(ctx.name)
  if (fn.length >= 2) {
    out = out.split(fn).join("{{firstName}}")
  }
  return out
}
