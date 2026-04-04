/** Outbound email identity and fixed funnel URLs (plan §4). */

export const EMAIL_FROM = 'Cole @ A.C Media <cole@a-cmedia.com>'
export const EMAIL_REPLY_TO = "alternate.creative.media@gmail.com"

export const PIXIESET_INQUIRY_URL = "https://acmediaco.pixieset.com/booking/online-inquiry-call"
export const MEDIA_DAY_BTS_YOUTUBE = "https://youtu.be/Q-zUv8KUuEY"
export const MACKENZIE_SESSION_URL = "https://a-cmedia.com/Mackenzie-senior-and-sports-photos"

export function siteBase(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export function firstNameFromFullName(name: string): string {
  const t = name.trim()
  if (!t) return "there"
  return t.split(/\s+/)[0] ?? "there"
}
