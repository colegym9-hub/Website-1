import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import TopographicBg from "@/components/portfolio/topographic-bg"
import { SHOOTS } from "@/components/portfolio/shoot-data"
import { SiteShell } from "@/components/site-shell"
import { DEFAULT_GLOBAL_NAV } from "@/lib/site-content-defaults"

export function generateStaticParams() {
  return SHOOTS.map((shoot) => ({ slug: shoot.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = SHOOTS.find((s) => s.id === slug)
  const title = item?.title ?? "Shoot"

  return {
    title: `${title} - A.C Media`,
    description: `Photography shoot: ${title}. Cinematic athlete photography by A.C Media in Binghamton, NY.`,
  }
}

export default async function ShootPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = SHOOTS.find((s) => s.id === slug)
  if (!item) notFound()

  return (
    <SiteShell>
      <main
        className="relative flex min-h-screen flex-col"
        style={{ backgroundColor: "var(--ac-bg)" }}
      >
        <TopographicBg />

        <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
          <Link
            href="/work"
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-white"
            style={{ color: "var(--ac-text-muted)" }}
          >
            <span>←</span>
            <span>The Work</span>
          </Link>
          <Link
            href="/"
            className="text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 hover:text-white"
            style={{ color: "var(--ac-text-muted)", fontFamily: '"coolvetica", sans-serif' }}
          >
            {DEFAULT_GLOBAL_NAV.brandLabel}
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          {item.cover && (
            <div
              className="relative mb-10 overflow-hidden rounded-xl"
              style={{
                width: "clamp(200px, 36vw, 480px)",
                aspectRatio: "4/5",
                boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
                filter: item.isGrayscale ? "grayscale(100%)" : "none",
              }}
            >
              <Image
                src={item.cover}
                alt={item.title}
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>
          )}

          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-4"
            style={{ color: "var(--ac-accent)" }}
          >
            Gallery coming soon
          </p>

          <h1
            className="font-heading mb-4"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
              color: "var(--ac-text)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {item.title}
          </h1>

          <p
            className="max-w-xs text-sm leading-relaxed mb-10"
            style={{ color: "var(--ac-text-muted)" }}
          >
            Full gallery dropping soon. In the meantime, check the rest of the work below.
          </p>

          <div className="h-px w-12 mb-10" style={{ backgroundColor: "var(--ac-accent)", opacity: 0.4 }} />

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/work"
              className="text-xs tracking-[0.18em] uppercase transition-colors duration-200 hover:text-white"
              style={{ color: "var(--ac-text-muted)" }}
            >
              ← Back to The Work
            </Link>
            <span className="hidden sm:block text-[#333]">·</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm transition-colors duration-300"
              style={{ backgroundColor: "var(--ac-accent)", color: "#0d2224" }}
            >
              Book your own shoot →
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
