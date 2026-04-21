import Link from "next/link"
import Footer from "@/components/footer"
import { SiteShell } from "@/components/site-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import ContactForm from "@/app/contact/contact-form"

export const metadata = {
  title: "Contact — A.C Media",
  description:
    "Get in touch with A.C Media. Cinematic athlete photography in Binghamton, NY and Elmira-Corning, NY.",
}

type SearchParams = Promise<{ service?: string | string[] }>

function normalizeService(value: string | string[] | undefined): string {
  if (!value) return ""
  const raw = Array.isArray(value) ? value[0] ?? "" : value
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const service = normalizeService(sp.service)

  return (
    <SiteShell>
      <main className="relative min-h-screen bg-[var(--ac-bg)] pt-28 pb-24">
        <div className="mx-auto w-full max-w-3xl px-6">
          <div className="mb-10 text-center">
            <p
              className="mb-4 text-[11px] uppercase tracking-[0.3em]"
              style={{ color: "var(--ac-accent)" }}
            >
              Get in touch
            </p>
            <h1
              className="font-heading text-[var(--ac-text)]"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Let&apos;s talk about your shoot.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--ac-text-muted)] md:text-base">
              Drop your info and a bit about what you have in mind. I&apos;ll get back
              to you personally — no bots, no funnels.
            </p>
          </div>

          <Card className="border-white/10 bg-[#0f0f0f]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-[var(--ac-text)]">
                Send a message
              </CardTitle>
              <CardDescription>
                {service
                  ? `Service selected: ${service}. Change it in your message if needed.`
                  : "Booking, pricing, or just a question — it all lands in my inbox."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm defaultService={service} />
            </CardContent>
          </Card>

          <div className="mt-10 grid gap-4 text-center sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#0f0f0f]/60 px-5 py-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ac-text-muted)]">
                Email
              </p>
              <Link
                href="mailto:alternate.creative.media@gmail.com"
                className="mt-2 block break-all text-sm text-[var(--ac-text)] hover:text-[var(--ac-accent)] transition-colors"
              >
                alternate.creative.media@gmail.com
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0f0f0f]/60 px-5 py-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ac-text-muted)]">
                Instagram
              </p>
              <a
                href="https://instagram.com/a_c.media"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm text-[var(--ac-text)] hover:text-[var(--ac-accent)] transition-colors"
              >
                @a_c.media
              </a>
            </div>
          </div>

          <Separator className="my-10 bg-[var(--ac-divider)]" />

          <p className="text-center text-xs uppercase tracking-[0.3em] text-[var(--ac-text-muted)]">
            Binghamton, NY · Elmira-Corning, NY
          </p>
        </div>

        <Toaster position="bottom-center" richColors closeButton />
      </main>
      <Footer />
    </SiteShell>
  )
}
