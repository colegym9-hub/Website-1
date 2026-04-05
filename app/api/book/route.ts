import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO, siteBase } from "@/lib/email-config"
import { signEngageToken } from "@/lib/engage-token"
import { resolveEmailTemplate } from "@/lib/email-template-db"
import { insertLeadEvent } from "@/lib/lead-events"
import {
  computeLeadScore,
  ctaVariantFromTier,
  tierFromScore,
  type CtaVariant,
  type LeadTier,
} from "@/lib/lead-score"
import { buildDayZeroClientEmail, ctxWithMagnet } from "@/lib/nurture-mail"
import { initialNurtureCronState } from "@/lib/nurture-schedule"
import { signMagnetToken } from "@/lib/magnet-token"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const incomingSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    partialLeadId: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    org: z.string().optional().default(""),
    location: z.string().optional().default(""),
    service: z.string().optional().default(""),
    timeline: z.string().optional().default(""),
    package: z.string().optional().default(""),
    packageName: z.string().optional().default(""),
    packageIntent: z.number().optional().default(-1),
    teamSize: z.number().optional(),
    rosterSize: z.number().optional(),
    sport: z.string().optional().default(""),
    shootType: z.string().optional().default(""),
    seniorStyle: z.string().optional().default(""),
    sessionType: z.string().optional().default(""),
    sports: z.array(z.string()).optional(),
    vision: z.string().optional().default(""),
    vibes: z.array(z.string()).optional(),
    moodboard: z.string().optional().default(""),
    readiness: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    role: z.string().optional().default(""),
  })
  .passthrough()

type Incoming = z.infer<typeof incomingSchema>

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(s: string) {
  return UUID_RE.test(s.trim())
}

function jsonbSafePayload(raw: unknown): Record<string, unknown> | null {
  try {
    const s = JSON.stringify(raw)
    if (s.length > 2_000_000) return { _truncated: true }
    return JSON.parse(s) as Record<string, unknown>
  } catch {
    return null
  }
}

function clampIntScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function toTeamSizeColumn(v: unknown): number | null {
  if (v == null) return null
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return null
  return Math.round(n)
}

async function insertLeadsWithFallbacks(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  fullRow: Record<string, unknown>,
): Promise<{ id: string | null; lastError: { message: string; code?: string } | null }> {
  const minimal: Record<string, unknown> = {
    name: fullRow.name,
    email: fullRow.email,
    phone: fullRow.phone ?? "",
    org: fullRow.org ?? "",
    location: fullRow.location ?? "",
    service: fullRow.service ?? "",
    timeline: fullRow.timeline ?? "",
    package_name: fullRow.package_name ?? "",
    team_size: fullRow.team_size ?? null,
    detail_sport_program: fullRow.detail_sport_program ?? "",
    detail_session_style: fullRow.detail_session_style ?? "",
    notes_extras: fullRow.notes_extras ?? "",
    lead_stage: "submitted",
  }
  const variants = [fullRow, { ...fullRow, raw_payload: null }, minimal]

  let lastError: { message: string; code?: string } | null = null
  for (const row of variants) {
    const { data, error } = await admin.from("leads").insert(row).select("id").maybeSingle()
    if (!error && data?.id) return { id: data.id, lastError: null }
    if (error) {
      lastError = { message: error.message, code: error.code }
      console.error("Supabase leads insert attempt failed:", error.code, error.message, error.details, error.hint)
    }
  }
  return { id: null, lastError }
}

function normalizeBooking(i: Incoming) {
  const pkg = i.packageName || i.package || ""
  const teamSize = i.teamSize ?? i.rosterSize
  const service = i.service

  let shootRow = ""
  let seniorRow = ""
  if (service === "media-day") {
    shootRow = i.shootType || i.sport
  } else if (service === "sportraits") {
    shootRow = i.shootType || (i.sports?.length ? i.sports.join(", ") : i.sport)
  } else if (service === "senior-portraits") {
    seniorRow = [i.sessionType || i.seniorStyle, ...(i.vibes?.length ? i.vibes : [])].filter(Boolean).join(" · ")
  } else {
    shootRow = i.shootType || i.sport
    seniorRow = i.seniorStyle || i.sessionType
  }

  const extras = [i.vision && `Vision: ${i.vision}`, i.moodboard && `Mood: ${i.moodboard}`].filter(Boolean).join(" | ")

  return {
    name: i.name,
    email: i.email,
    phone: i.phone,
    org: i.org,
    location: i.location,
    service: i.service,
    timeline: i.timeline,
    package: pkg,
    teamSize,
    shootRow,
    seniorRow,
    extras,
    readiness: i.readiness,
    notes: i.notes,
    packageIntent: i.packageIntent,
    role: i.role,
  }
}

function serviceLabel(s: string) {
  if (s === "media-day") return "Media Day"
  if (s === "senior-portraits") return "Senior Portraits"
  if (s === "sportraits") return "Sportraits"
  return s || "N/A"
}

function row(label: string, value: string | number | undefined) {
  if (!value && value !== 0) return ""
  return `<tr>
    <td style="padding:8px 0;color:#666;width:150px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;"><strong>${value}</strong></td>
  </tr>`
}

function coleEmailHtml(
  d: ReturnType<typeof normalizeBooking>,
  score: number,
  tier: LeadTier,
  cta: CtaVariant,
  leadId: string | null,
) {
  const adminLeadUrl = leadId ? `${siteBase()}/admin/leads/${leadId}` : ""
  return `
      <div style="font-family:sans-serif;max-width:600px;color:#111;">
        <h2 style="margin:0 0 24px;">New Booking Inquiry</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row("Lead score", String(score))}
          ${row("Lead tier", tier)}
          ${row("CTA variant", cta)}
          ${row("Readiness", d.readiness)}
          ${leadId ? row("Admin", `<a href="${adminLeadUrl}" style="color:#0d9488;">Open lead in admin</a>`) : ""}
          ${row("Name", d.name)}
          ${row("Email", `<a href="mailto:${d.email}">${d.email}</a>`)}
          ${row("Phone", d.phone)}
          ${row("School / Team / Org", d.org)}
          ${row("Location", d.location)}
          ${row("Service", serviceLabel(d.service))}
          ${row("Sport / program / picks", d.shootRow)}
          ${row("Session style", d.seniorRow)}
          ${row("Timeline", d.timeline)}
          ${d.service === "media-day" && d.teamSize != null ? row("Team size", `${d.teamSize} athletes`) : ""}
          ${row("Package", d.package)}
          ${row("Notes", [d.extras, d.notes].filter(Boolean).join(" | "))}
        </table>
      </div>
    `
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw = incomingSchema.parse(body)
    const d = normalizeBooking(raw)

    const score = computeLeadScore({
      service: d.service,
      timeline: d.timeline,
      readiness: d.readiness || "exploring",
      packageIntent: d.packageIntent,
      phone: d.phone,
      notes: d.notes,
      org: d.org,
    })
    const tier = tierFromScore(score)
    const ctaVariant: CtaVariant = ctaVariantFromTier(tier)
    const scoreInt = clampIntScore(score)
    const teamSizeCol = toTeamSizeColumn(d.teamSize)

    let leadId: string | null = null
    const admin = createSupabaseAdmin()
    const submittedAt = new Date()

    if (admin) {
      const existingId = raw.partialLeadId?.trim()
      const nurture = initialNurtureCronState({
        submittedAt,
        tier,
      })

      const dbRow: Record<string, unknown> = {
        name: d.name,
        email: d.email,
        phone: d.phone ?? "",
        org: d.org ?? "",
        location: d.location ?? "",
        service: d.service ?? "",
        timeline: d.timeline ?? "",
        package_name: d.package ?? "",
        team_size: teamSizeCol,
        detail_sport_program: d.shootRow ?? "",
        detail_session_style: d.seniorRow ?? "",
        notes_extras: [d.extras, d.notes].filter(Boolean).join(" | ") || "",
        raw_payload: jsonbSafePayload(raw),
        lead_score: scoreInt,
        lead_tier: tier,
        readiness: d.readiness || null,
        cta_variant: ctaVariant,
        lead_stage: "submitted",
        nurture_step: nurture.nurture_step,
        next_nurture_at: nurture.next_nurture_at,
        nurture_paused_at: null,
        recycle_at: null,
      }

      if (existingId && isUuid(existingId)) {
        const { data: updated, error: upErr } = await admin
          .from("leads")
          .update(dbRow)
          .eq("id", existingId)
          .select("id, created_at")
          .maybeSingle()
        if (upErr) {
          console.error("Supabase update error", upErr.code, upErr.message, upErr.details, upErr.hint)
        } else if (updated?.id) {
          leadId = updated.id
          const created = updated.created_at ? new Date(String(updated.created_at)) : submittedAt
          const n2 = initialNurtureCronState({ submittedAt: created, tier })
          await admin
            .from("leads")
            .update({ nurture_step: n2.nurture_step, next_nurture_at: n2.next_nurture_at })
            .eq("id", leadId)
        } else {
          console.warn("No lead row for partialLeadId; inserting new lead", { existingId })
        }
      }

      if (!leadId) {
        const { id, lastError } = await insertLeadsWithFallbacks(admin, dbRow)
        if (!id) {
          console.error("All lead insert fallbacks failed", lastError)
          return NextResponse.json(
            {
              error: "Could not save inquiry",
              ...(process.env.BOOKING_DEBUG === "1" && lastError
                ? { debug: { supabaseMessage: lastError.message, code: lastError.code } }
                : {}),
            },
            { status: 500 },
          )
        }
        leadId = id
        const { data: insertedLead } = await admin.from("leads").select("created_at").eq("id", leadId).maybeSingle()
        const created = insertedLead?.created_at ? new Date(String(insertedLead.created_at)) : submittedAt
        const n2 = initialNurtureCronState({ submittedAt: created, tier })
        await admin
          .from("leads")
          .update({ nurture_step: n2.nurture_step, next_nurture_at: n2.next_nurture_at })
          .eq("id", leadId)
      }
    } else {
      console.warn("SUPABASE_SERVICE_ROLE_KEY missing — skipping leads insert")
    }

    const magnetToken = leadId ? signMagnetToken(leadId) : ""
    const ctx = leadId ? ctxWithMagnet(leadId, d.name) : ctxWithMagnet("00000000-0000-4000-8000-000000000000", d.name)
    const audience = d.role === "parent" ? "parent" : "senior"
    const svc = serviceLabel(d.service)

    let clientSubject = `Your A.C Media booking request: ${svc}`
    let clientHtml = ""
    let usedKey = ""

    if (tier === "hot" && d.service !== "media-day") {
      const hot = buildDayZeroClientEmail(d.service, tier, ctx, svc)
      clientSubject = hot.subject
      clientHtml = hot.html
      usedKey = "hot_schedule"
    } else if (leadId && admin) {
      const key =
        d.service === "media-day" && tier === "hot"
          ? "md_day0_hot"
          : d.service === "media-day"
            ? "md_day0"
            : d.service === "senior-portraits"
              ? "sr_day0"
              : "sp_day0"
      usedKey = key
      const resolved = await resolveEmailTemplate(admin, d.service || "media-day", key, ctx, audience)
      clientSubject = resolved.subject
      clientHtml = resolved.html
    } else if (leadId) {
      const built = buildDayZeroClientEmail(d.service, tier, ctx, svc)
      clientSubject = built.subject
      clientHtml = built.html
    } else {
      clientHtml = `<p>Hi ${d.name},</p><p>Thank you — we received your inquiry for ${svc}.</p>`
    }

    const emailHtml = coleEmailHtml(d, score, tier, ctaVariant, leadId)
    const unsubHeader = leadId
      ? `<${siteBase()}/api/unsub?k=${encodeURIComponent(signEngageToken({ leadId, kind: "unsub" }))}>`
      : undefined

    let clientEmailSent = false
    let clientEmailError: string | null = null

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const coleResult = await resend.emails.send({
        from: EMAIL_FROM,
        to: "alternate.creative.media@gmail.com",
        replyTo: d.email,
        subject: `New booking inquiry: ${d.name}${d.org ? ` (${d.org})` : ""}`,
        html: emailHtml,
      })
      if (coleResult.error) console.error("Resend cole email error:", coleResult.error)
      else console.log("Cole email sent:", coleResult.data?.id)

      const clientHeaders: Record<string, string> = {}
      if (unsubHeader) {
        clientHeaders["List-Unsubscribe"] = unsubHeader
        clientHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
      }

      const clientResult = await resend.emails.send({
        from: EMAIL_FROM,
        to: d.email,
        replyTo: EMAIL_REPLY_TO,
        subject: clientSubject,
        html: clientHtml,
        headers: Object.keys(clientHeaders).length ? clientHeaders : undefined,
        tags: leadId ? [{ name: "lead_id", value: leadId }] : undefined,
      })
      clientEmailSent = !clientResult.error
      if (clientResult.error) {
        clientEmailError = String(clientResult.error.message || clientResult.error)
        console.error("Resend client email error:", clientResult.error)
      } else {
        console.log("Client email sent:", clientResult.data?.id)
      }

      if (admin && leadId && clientEmailSent) {
        await insertLeadEvent(admin, leadId, "email.sent", {
          template: usedKey || "day0",
          to: d.email,
          channel: "resend",
          messageId: clientResult.data?.id ?? null,
        })
      }
    } else {
      console.warn("RESEND_API_KEY missing — skipping emails")
    }

    return NextResponse.json({
      ok: true,
      ctaVariant,
      leadTier: tier,
      leadId: leadId ?? "",
      magnetToken: ctaVariant === "warm_up" ? magnetToken : "",
      clientEmailSent,
      ...(process.env.BOOKING_DEBUG === "1" && clientEmailError ? { clientEmailError } : {}),
    })
  } catch (err) {
    console.error("Booking API error:", err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid submission", details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
