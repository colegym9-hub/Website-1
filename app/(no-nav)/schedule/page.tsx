import Link from "next/link"
import BackgroundEffects from "@/components/background-effects"

export default function SchedulePage() {
  const embedUrl = process.env.NEXT_PUBLIC_SCHEDULE_EMBED_URL?.trim()
  const externalUrl = process.env.NEXT_PUBLIC_SCHEDULE_URL?.trim()

  return (
    <div className="min-h-screen bg-[var(--ac-bg)] flex flex-col">
      <BackgroundEffects />
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-[#1e1e1e] bg-[var(--ac-bg)]/90 backdrop-blur-sm">
        <Link
          href="/"
          className="text-[var(--ac-text)] tracking-[0.15em] uppercase text-sm hover:text-[var(--ac-accent)] transition-colors"
          style={{ fontFamily: '"coolvetica", sans-serif' }}
        >
          A.C Media
        </Link>
        <Link href="/book" className="text-xs text-[#666] hover:text-[var(--ac-accent)] uppercase tracking-widest">
          Book
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center pt-20 pb-16 px-4 max-w-4xl mx-auto w-full">
        <h1 className="font-heading text-white text-2xl md:text-3xl text-center mb-2">Book a call</h1>
        <p className="text-[#777] text-sm text-center max-w-md mb-8 leading-relaxed">
          Choose a time that works. If nothing fits, reply to your confirmation email and we&apos;ll sort it out.
        </p>
        {embedUrl ? (
          <div className="w-full rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#111] min-h-[640px]">
            <iframe title="Schedule" src={embedUrl} className="w-full h-[min(80vh,720px)] border-0" />
          </div>
        ) : externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm hover:bg-[var(--ac-accent-hover)] transition-colors"
          >
            Open calendar →
          </a>
        ) : (
          <p className="text-[#888] text-sm text-center max-w-md">
            Calendar link is not configured yet. Set{" "}
            <code className="text-[var(--ac-accent)] text-xs">NEXT_PUBLIC_SCHEDULE_EMBED_URL</code> or{" "}
            <code className="text-[var(--ac-accent)] text-xs">NEXT_PUBLIC_SCHEDULE_URL</code> in your environment.
          </p>
        )}
      </main>
    </div>
  )
}
