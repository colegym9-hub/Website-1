/**
 * Plain-text email authoring → HTML for Resend.
 * Tokens (inserted via admin /-menu): [[merge:key]], [[link:label|url]], [[button:label|url]]
 * Legacy merges in plain text: {{key}} or {key}
 */

export const PLAIN_MERGE_FIELDS = [
  { key: "firstName", label: "First name" },
  { key: "name", label: "Full name" },
  { key: "prepUrl", label: "Prep / welcome pack link" },
  { key: "workUrl", label: "Work / portfolio link" },
  { key: "scheduleUrl", label: "Schedule call link" },
  { key: "pixiesetUrl", label: "Pixieset booking link" },
  { key: "btsUrl", label: "Behind-the-scenes video" },
  { key: "mackenzieUrl", label: "Mackenzie session example" },
  { key: "replyTo", label: "Reply-to reference" },
  { key: "siteUrl", label: "Site base URL" },
  { key: "unsubscribeUrl", label: "Unsubscribe link" },
] as const

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Expand [[merge:key]], {{key}}, {key} with raw values (no HTML escaping).
 * Escaping happens in compilePlainBodyToHtml for text runs; hrefs use sanitizeHref.
 */
export function expandPlainMergeValues(plain: string, mergeMap: Record<string, string>): string {
  let out = plain.replace(/\[\[merge:([a-zA-Z]+)\]\]/g, (_, key: string) => mergeMap[key] ?? `[[missing:${key}]]`)
  for (const [k, v] of Object.entries(mergeMap)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}|\\{${k}\\}`, "gi")
    out = out.replace(re, v)
  }
  return out
}

const TOKEN_RE = /\[\[(link|button):([^\]|]+)\|([^\]]+)\]\]/g

function sanitizeHref(url: string): string {
  const t = url.trim()
  if (!/^https?:\/\//i.test(t)) return "#"
  return escapeHtml(t.replace(/"/g, "").replace(/'/g, ""))
}

function buttonBlock(label: string, url: string): string {
  const u = sanitizeHref(url)
  const safeLabel = escapeHtml(label.trim())
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:14px 0;"><tr><td style="border-radius:8px;background:#0d2224;"><a href="${u}" style="display:inline-block;padding:12px 22px;color:#f5f5f5;text-decoration:none;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;">${safeLabel}</a></td></tr></table>`
}

/** Compile one line segment with link/button tokens (merges already expanded). */
export function compileInlineWithTokens(line: string): string {
  const out: string[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(TOKEN_RE.source, "g")
  while ((m = re.exec(line)) !== null) {
    out.push(escapeHtml(line.slice(last, m.index)))
    const kind = m[1]
    const label = m[2]
    const url = m[3]
    if (kind === "link") {
      const u = sanitizeHref(url)
      out.push(
        `<a href="${u}" style="color:#0d5c5f;font-weight:600;text-decoration:underline;">${escapeHtml(label.trim())}</a>`,
      )
    } else {
      out.push(buttonBlock(label, url))
    }
    last = m.index + m[0].length
  }
  out.push(escapeHtml(line.slice(last)))
  return out.join("")
}

/** Split on blank lines; single newlines inside a block become <br />. */
export function compilePlainBodyToHtml(plain: string): string {
  const blocks = plain.split(/\n\n+/).map(b => b.trim()).filter(Boolean)
  const paras = blocks.map(block => {
    const lines = block.split(/\n/)
    const inner = lines.map(l => compileInlineWithTokens(l)).join("<br />")
    return `<p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.65;color:#1a1a1a;">${inner}</p>`
  })
  return `<div style="max-width:600px;">${paras.join("")}</div>`
}
