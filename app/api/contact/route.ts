import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email-config"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(5000),
  service: z.string().trim().max(80).optional().default(""),
})

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return NextResponse.json({ ok: false, error: issue?.message ?? "Invalid input" }, { status: 400 })
  }
  const { name, email, phone, message, service } = parsed.data

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const subject = service
    ? `New contact — ${name} (${service})`
    : `New contact — ${name}`

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 16px;">New message from the site</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Phone:</strong> ${phone ? `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>` : "(not provided)"}</p>
      ${service ? `<p><strong>Service:</strong> ${escapeHtml(service)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <div style="white-space: pre-wrap; padding: 12px 16px; background: #f6f6f6; border-radius: 8px;">${escapeHtml(message)}</div>
    </div>
  `.trim()

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "(not provided)"}`,
    service ? `Service: ${service}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_REPLY_TO,
      replyTo: email,
      subject,
      html,
      text,
    })
    if (result.error) {
      return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 502 })
  }
}
