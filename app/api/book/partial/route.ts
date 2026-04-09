import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { EMAIL_FROM } from "@/lib/email-config"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

/** Saves partial lead data when contact info is captured, before the funnel is finished. */
const partialSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    partialLeadId: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    org: z.string().optional().default(""),
    role: z.string().optional().default(""),
    service: z.string().optional().default(""),
    location: z.string().optional().default(""),
    timeline: z.string().optional().default(""),
    timelineNote: z.string().optional().default(""),
    sport: z.string().optional().default(""),
    sports: z.array(z.string()).optional(),
    rosterSize: z.number().optional(),
    sessionType: z.string().optional().default(""),
    readiness: z.string().optional().default(""),
  })
  .passthrough()

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(s: string) {
  return UUID_RE.test(s.trim())
}

function partialColeHtml(data: z.infer<typeof partialSchema>) {
  const role = data.role ? `<tr><td style="padding:8px 0;color:#666;">Role</td><td><strong>${data.role}</strong></td></tr>` : ""
  return `
    <div style="font-family:sans-serif;max-width:600px;color:#111;">
      <h2 style="margin:0 0 16px;">Contact captured (in progress)</h2>
      <p style="color:#666;margin:0 0 16px;">They haven’t finished the booking flow yet — you’ve got their details early.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${role}
        <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td><strong>${data.name}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666;">Email</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#666;">Phone</td><td>${data.phone || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Org</td><td>${data.org || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Service</td><td>${data.service || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Location</td><td>${data.location || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Timeline</td><td>${data.timeline || "—"} ${data.timelineNote ? `(${data.timelineNote})` : ""}</td></tr>
      </table>
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = partialSchema.parse(body)

    const admin = createSupabaseAdmin()
    if (!admin) return NextResponse.json({ ok: false })

    const leadPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      org: data.org,
      service: data.service,
      location: data.location,
      timeline: data.timeline + (data.timelineNote ? ` (${data.timelineNote})` : ""),
      detail_sport_program: data.sport || (data.sports?.join(", ") ?? ""),
      detail_session_style: data.sessionType,
      team_size: data.rosterSize ?? null,
      readiness: data.readiness || null,
      raw_payload: body,
      lead_stage: "contact_captured",
    }

    let leadId = ""
    let createdNewLead = false

    const existingId = data.partialLeadId.trim()
    if (existingId && isUuid(existingId)) {
      const { data: updated, error } = await admin
        .from("leads")
        .update(leadPayload)
        .eq("id", existingId)
        .select("id")
        .maybeSingle()
      if (error) {
        console.error("partial lead update error", error)
        return NextResponse.json({ ok: false })
      }
      leadId = updated?.id ?? ""
    }

    if (!leadId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recentExisting, error: findError } = await admin
        .from("leads")
        .select("id")
        .eq("email", data.email)
        .eq("service", data.service)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError) {
        console.error("partial lead lookup error", findError)
        return NextResponse.json({ ok: false })
      }

      if (recentExisting?.id) {
        const { data: updated, error } = await admin
          .from("leads")
          .update(leadPayload)
          .eq("id", recentExisting.id)
          .select("id")
          .maybeSingle()
        if (error) {
          console.error("partial lead update error", error)
          return NextResponse.json({ ok: false })
        }
        leadId = updated?.id ?? ""
      }
    }

    if (!leadId) {
      const { data: inserted, error } = await admin.from("leads").insert(leadPayload).select("id").single()
      if (error) {
        console.error("partial lead insert error", error)
        return NextResponse.json({ ok: false })
      }
      leadId = inserted?.id ?? ""
      createdNewLead = Boolean(leadId)
    }

    if (createdNewLead && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const r = await resend.emails.send({
        from: EMAIL_FROM,
        to: "alternate.creative.media@gmail.com",
        replyTo: data.email,
        subject: `Contact captured: ${data.name}${data.org ? ` (${data.org})` : ""}`,
        html: partialColeHtml(data),
        tags: leadId ? [{ name: "lead_id", value: leadId }] : undefined,
      })
      if (r.error) console.error("partial Cole notify", r.error)
    }

    return NextResponse.json({ ok: true, leadId })
  } catch (e) {
    console.error("partial lead error", e)
    return NextResponse.json({ ok: false })
  }
}
