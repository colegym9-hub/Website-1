import { signEngageToken } from "@/lib/engage-token"
import {
  EMAIL_REPLY_TO,
  firstNameFromFullName,
  MACKENZIE_SESSION_URL,
  MEDIA_DAY_BTS_YOUTUBE,
  PIXIESET_INQUIRY_URL,
  siteBase,
} from "@/lib/email-config"
import { signMagnetToken } from "@/lib/magnet-token"
import type { LeadTier } from "@/lib/lead-score"

export type NurtureMailCtx = {
  name: string
  leadId: string
  magnetToken: string
}

const SLA_LINE =
  "Cole typically replies within one business day (often sooner). If it’s urgent, reply to this email and say so."

function footer(leadId: string): string {
  const u = signEngageToken({ leadId, kind: "unsub" })
  const unsub = `${siteBase()}/api/unsub?k=${encodeURIComponent(u)}`
  return `
    <p style="margin:32px 0 0;color:#888;font-size:12px;line-height:1.5;">
      <a href="${unsub}" style="color:#666;">Unsubscribe</a> from these follow-ups.
    </p>
    <p style="margin:8px 0 0;color:#aaa;font-size:11px;">A.C Media · Binghamton, NY</p>
  `
}

function tracked(leadId: string, target: string): string {
  const k = signEngageToken({ leadId, kind: "link", target })
  return `${siteBase()}/api/l?k=${encodeURIComponent(k)}`
}

function prepUrl(ctx: NurtureMailCtx): string {
  return `${siteBase()}/resources/welcome-pack?l=${encodeURIComponent(ctx.leadId)}&t=${encodeURIComponent(ctx.magnetToken)}`
}

function workUrl(ctx: NurtureMailCtx): string {
  return tracked(ctx.leadId, "work")
}

function scheduleUrl(ctx: NurtureMailCtx): string {
  return tracked(ctx.leadId, "schedule")
}

function btsUrl(ctx: NurtureMailCtx): string {
  return tracked(ctx.leadId, "bts")
}

function mackenzieUrl(ctx: NurtureMailCtx): string {
  return tracked(ctx.leadId, "mackenzie")
}

function email3Urls(ctx: NurtureMailCtx): { yes: string; no: string } {
  return {
    yes: `${siteBase()}/api/engage/email3?k=${encodeURIComponent(signEngageToken({ leadId: ctx.leadId, kind: "email3", choice: "yes" }))}`,
    no: `${siteBase()}/api/engage/email3?k=${encodeURIComponent(signEngageToken({ leadId: ctx.leadId, kind: "email3", choice: "no" }))}`,
  }
}

function wrapBody(inner: string, ctx: NurtureMailCtx): string {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;color:#111;line-height:1.55;">
      ${inner}
      <p style="margin-top:28px;">— Cole<br/>A.C Media</p>
      ${footer(ctx.leadId)}
    </div>
  `.trim()
}

/** §4 Day 0 — Media Day warm + nurture tiers (calendar not primary). */
export function defaultMdDay0Warm(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const subject = `Got your inquiry, ${fn}. Here's what to expect.`
  const html = wrapBody(
    `
    <p>Hi ${fn},</p>
    <p>Thank you for reaching out about <strong>Media Day</strong>. ${SLA_LINE}</p>
    <p>Here’s a quick look at what shoot day actually feels like:</p>
    <p style="margin:20px 0;"><a href="${btsUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">Watch the behind the scenes</a></p>
    <p>And when you’re ready, the prep guide walks your athletes through what to expect:</p>
    <p style="margin:12px 0;"><a href="${prepUrl(ctx)}" style="color:#0d2224;font-weight:600;">Read the prep guide →</a></p>
    <p style="margin-top:20px;color:#444;">BTW — if you’d rather lock a quick inquiry call first, you can <a href="${scheduleUrl(ctx)}" style="color:#0d2224;">grab a time here</a>.</p>
  `,
    ctx,
  )
  return { subject, html, textPreview: "A look at what shoot day actually looks like." }
}

/** §4 Day 0 — Media Day hot (calendar-first). */
export function defaultMdDay0Hot(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const subject = `Got your inquiry, ${fn}. Here's what to expect.`
  const html = wrapBody(
    `
    <p>Hi ${fn},</p>
    <p>We’ve got your <strong>Media Day</strong> request. ${SLA_LINE}</p>
    <p style="margin:20px 0;"><a href="${scheduleUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">Grab a time — inquiry call</a></p>
    <p>Quick context while you’re here:</p>
    <ul style="padding-left:20px;color:#444;">
      <li><a href="${btsUrl(ctx)}">Behind the scenes on YouTube</a></li>
      <li><a href="${prepUrl(ctx)}">Prep guide for athletes</a></li>
    </ul>
  `,
    ctx,
  )
  return { subject, html, textPreview: "Let’s get you on the calendar." }
}

/** §4 Day 0 — Senior (same for all tiers). */
export function defaultSrDay0(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const subject = `Got your inquiry, ${fn}. Here's what to expect.`
  const html = wrapBody(
    `
    <p>Hi ${fn},</p>
    <p>Thank you for your interest in <strong>Senior Portraits</strong>. ${SLA_LINE}</p>
    <p>Reply to this email with one thing you want out of the session — vibe, location, or the feeling you’re going for.</p>
    <p style="margin:16px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    <p><a href="${prepUrl(ctx)}" style="color:#0d2224;font-weight:600;">Read the prep guide →</a></p>
    <p style="margin-top:16px;color:#444;">Replying is the fastest way to keep the conversation moving.</p>
  `,
    ctx,
  )
  return { subject, html, textPreview: "Let's make something worth keeping." }
}

/** §4 Day 0 — Sportraits. */
export function defaultSpDay0(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const subject = `Got your inquiry, ${fn}. Here's what to expect.`
  const html = wrapBody(
    `
    <p>Hi ${fn},</p>
    <p>Thank you for your interest in <strong>Sportraits</strong>. ${SLA_LINE}</p>
    <p>Reply with one outcome you want from the session — we’ll build around that.</p>
    <p style="margin:16px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    <p><a href="${prepUrl(ctx)}" style="color:#0d2224;font-weight:600;">Read the prep guide →</a></p>
    <p style="margin-top:16px;color:#444;">Replying keeps things moving faster than playing phone tag.</p>
  `,
    ctx,
  )
  return { subject, html, textPreview: "Your sport. Your session. Let's build it." }
}

/** Hot path client email — schedule-first (non–Media Day). */
export function defaultClientEmailHotNonMd(ctx: NurtureMailCtx, serviceLabel: string): { subject: string; html: string } {
  const fn = firstNameFromFullName(ctx.name)
  const schedule = `${siteBase()}/schedule`
  const html = wrapBody(
    `
    <p>Hi ${fn},</p>
    <p>We've got your request for <strong>${serviceLabel}</strong>. ${SLA_LINE}</p>
    <p>If you want momentum on the calendar, you can book a quick call:</p>
    <p style="margin:20px 0;"><a href="${schedule}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">Book a quick call</a></p>
    <p style="color:#666;font-size:14px;">More work: <a href="https://instagram.com/a_c.media">instagram.com/a_c.media</a></p>
  `,
    ctx,
  )
  return { subject: `Your A.C Media booking request: ${serviceLabel}`, html }
}

// ── Cron bodies (§4) ─────────────────────────────────────────────────────────

export function defaultMdEmail1(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What your athletes actually walk away with.",
    textPreview: "It's not just photos.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Most people think Media Day is “everyone in a jersey.” The teams that win with it treat it like a system:</p>
      <ul style="padding-left:20px;color:#333;">
        <li>A standard shot that looks consistent across the roster</li>
        <li>A choice shot that lets personality show</li>
        <li>Groups that feel intentional, not rushed</li>
        <li>A team photo that actually reads on banners and social</li>
      </ul>
      <p>We run production so athletes aren’t standing around guessing what’s next.</p>
      <p style="margin:20px 0;"><a href="${prepUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">How to prep your athletes</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultMdEmail2(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "Most media day photos get ignored. Here's why mine don't.",
    textPreview: "It's not luck. Here's what's actually behind it.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Generic jersey portraits get scrolled past. The work we put in front of programs is built for <strong>5M+ view</strong> moments — lighting, direction, and a workflow that keeps the day moving.</p>
      <p>That’s the difference between “we took photos” and “our program actually looks the part.”</p>
      <p style="margin:20px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultMdEmail3(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const { yes, no } = email3Urls(ctx)
  return {
    subject: "Still thinking it over?",
    textPreview: "One quick question.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Quick check — is a media day still on the table for this season? <strong>Yes or no</strong> is totally fine.</p>
      <p style="margin:24px 0;">
        <a href="${yes}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;margin-right:8px;">Yes</a>
        <a href="${no}" style="display:inline-block;border:1px solid #ccc;color:#333;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;">No</a>
      </p>
    `,
      ctx,
    ),
  }
}

export function defaultSrEmail1Parent(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What your session actually feels like.",
    textPreview: "This isn't a school photo.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>For your senior, this isn’t about stiff poses — it’s collaborative. We build around who they are so the photos feel natural, not “posed for the yearbook.”</p>
      <p style="margin:20px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultSrEmail1Senior(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What your session actually feels like.",
    textPreview: "This isn't a school photo.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>This isn’t a school-photo line — it’s a session built around you. We collaborate on locations, outfits, and energy so the shots feel like <em>you</em>, not a template.</p>
      <p style="margin:20px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultSrEmail2(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What other seniors have said.",
    textPreview: "In their own words.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>“Cole made the whole thing easy — I didn’t feel awkward at all.” — <em>Dom W.</em></p>
      <p style="margin:12px 0;">“I didn’t expect them to look this good.” — <em>Jack N.</em></p>
      <p>If you have a question, reply — one line is enough.</p>
    `,
      ctx,
    ),
  }
}

export function defaultSrEmail3(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const { yes, no } = email3Urls(ctx)
  return {
    subject: "Still thinking it over?",
    textPreview: "One quick question.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Is a senior session still on your radar this year? <strong>Yes</strong> or <strong>No</strong> works.</p>
      <p style="margin:24px 0;">
        <a href="${yes}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;margin-right:8px;">Yes</a>
        <a href="${no}" style="display:inline-block;border:1px solid #ccc;color:#333;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;">No</a>
      </p>
    `,
      ctx,
    ),
  }
}

export function defaultSpEmail1(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What a Sportraits session actually is.",
    textPreview: "Think personalized media day. For one athlete.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Sportraits is basically a one-athlete production: cinematic lighting, intentional direction, and a workflow that makes you look like the version of yourself you want on film.</p>
      <p style="margin:20px 0;"><a href="${workUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See the work</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultSpEmail2(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: "What other athletes have said.",
    textPreview: "In their own words.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>“I didn’t expect them to look this cinematic.” — <em>Dom W.</em></p>
      <p style="margin:12px 0;">“Whole Thing package was worth it — senior + sport in one production.” — <em>Mackenzie</em></p>
      <p style="margin:20px 0;"><a href="${mackenzieUrl(ctx)}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:600;">See Mackenzie’s full session</a></p>
    `,
      ctx,
    ),
  }
}

export function defaultSpEmail3(ctx: NurtureMailCtx): { subject: string; html: string; textPreview: string } {
  const fn = firstNameFromFullName(ctx.name)
  const { yes, no } = email3Urls(ctx)
  return {
    subject: "Still thinking it over?",
    textPreview: "One quick question.",
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>Is a Sportraits session still something you’re considering? <strong>Yes</strong> or <strong>No</strong> is enough.</p>
      <p style="margin:24px 0;">
        <a href="${yes}" style="display:inline-block;background:#0d2224;color:#7fb8be;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;margin-right:8px;">Yes</a>
        <a href="${no}" style="display:inline-block;border:1px solid #ccc;color:#333;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:600;">No</a>
      </p>
    `,
      ctx,
    ),
  }
}

export function defaultRecycleEmail(ctx: NurtureMailCtx): { subject: string; html: string } {
  const fn = firstNameFromFullName(ctx.name)
  return {
    subject: `Still here if you need photography, ${fn}`,
    html: wrapBody(
      `
      <p>Hi ${fn},</p>
      <p>It’s been a little while since we last connected. If timing or priorities shifted, no worries.</p>
      <p>If you’re still thinking about a session or a media day, reply with what you’re considering — even one sentence helps.</p>
      <p style="margin:16px 0;"><a href="${scheduleUrl(ctx)}" style="color:#0d2224;font-weight:600;">Or grab a quick inquiry call →</a></p>
    `,
      ctx,
    ),
  }
}

export function getDefaultTemplate(
  templateKey: string,
  ctx: NurtureMailCtx,
  _audience: "parent" | "senior",
): { subject: string; html: string; textPreview?: string } | null {
  switch (templateKey) {
    case "md_day0":
      return defaultMdDay0Warm(ctx)
    case "md_day0_hot":
      return defaultMdDay0Hot(ctx)
    case "sr_day0":
      return defaultSrDay0(ctx)
    case "sp_day0":
      return defaultSpDay0(ctx)
    case "md_email1":
      return defaultMdEmail1(ctx)
    case "md_email2":
      return defaultMdEmail2(ctx)
    case "md_email3":
      return defaultMdEmail3(ctx)
    case "sr_email1_parent":
      return defaultSrEmail1Parent(ctx)
    case "sr_email1_senior":
      return defaultSrEmail1Senior(ctx)
    case "sr_email2":
      return defaultSrEmail2(ctx)
    case "sr_email3":
      return defaultSrEmail3(ctx)
    case "sp_email1":
      return defaultSpEmail1(ctx)
    case "sp_email2":
      return defaultSpEmail2(ctx)
    case "sp_email3":
      return defaultSpEmail3(ctx)
    case "recycle_checkin":
      return defaultRecycleEmail(ctx)
    default:
      return null
  }
}

export function buildDayZeroClientEmail(
  service: string,
  tier: LeadTier,
  ctx: NurtureMailCtx,
  serviceLabel: string,
): { subject: string; html: string; textPreview?: string } {
  if (tier === "hot" && service !== "media-day") {
    return defaultClientEmailHotNonMd(ctx, serviceLabel)
  }
  const key = service === "media-day" && tier === "hot" ? "md_day0_hot" : service === "media-day" ? "md_day0" : service === "senior-portraits" ? "sr_day0" : "sp_day0"
  const d = getDefaultTemplate(key, ctx, "senior")
  if (d) return d
  return defaultMdDay0Warm(ctx)
}

/** Re-export fixed URLs for admin preview / merge tags. */
export const MERGE_TAG_URLS = {
  pixiesetInquiry: PIXIESET_INQUIRY_URL,
  mediaDayBts: MEDIA_DAY_BTS_YOUTUBE,
  mackenzieSession: MACKENZIE_SESSION_URL,
  replyTo: EMAIL_REPLY_TO,
}

export function ctxWithMagnet(leadId: string, name: string): NurtureMailCtx {
  return { leadId, name, magnetToken: signMagnetToken(leadId) }
}
