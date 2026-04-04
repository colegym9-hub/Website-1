"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import BackgroundEffects from "@/components/background-effects"

const quotes = [
  { quote: "The best photoshoot I've ever done. AC was open to all our crazy ideas and the shoot was so laid back. He really made us feel comfortable, and the photos turned out incredible.", name: "McKenna Patton", detail: "Dance" },
  { quote: "I was blown away when I saw my photos. You can clearly see AC took his time on every photo and took pride into every aspect of editing.", name: "Dom Weed", detail: "Senior + Baseball" },
  { quote: "AC is the premier photographer in the area and he won't let you down. He does great work.", name: "Jack Nolan", detail: "Senior Portraits" },
]

const sections = [
  {
    eyebrow: "Before your session",
    title: "Show up as yourself.",
    bullets: [
      "Bring a variety of outfits. Athletic gear, casual wear, anything that feels like you.",
      "Props that mean something to you always make a better frame. A jersey, a bat, a piece of gear.",
      "No poses to memorize. No forced expressions. We move through it together.",
      "If you have inspo images, reply to your confirmation email with them. No pressure either way.",
    ],
  },
  {
    eyebrow: "Day of the shoot",
    title: "Arrive ready to move.",
    bullets: [
      "Show up on time. We use every minute of your session.",
      "Lighting and effects are already dialed in before you get there.",
      "You bring the energy. We handle the rest.",
      "We slow down when you need a breath and push when you want edge.",
    ],
  },
  {
    eyebrow: "After the shoot",
    title: "Gallery delivered in 2-3 weeks.",
    bullets: [
      "You'll get an email with a link to your private online gallery.",
      "Download your images with full print rights included.",
      "Every gallery includes fully edited images and retouched selects.",
      "Questions after delivery? Reply to any email and Cole will sort it.",
    ],
  },
  {
    eyebrow: "Booking timing",
    title: "Plan ahead when you can.",
    bullets: [
      "Media days: book about one month before your season starts for the best availability.",
      "Senior portraits: start 2-3 months out, especially in the fall when demand peaks.",
      "Sportraits: 2-4 weeks out works for most schedules.",
    ],
  },
]

function WelcomePackInner() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get("l") ?? ""
  const token = searchParams.get("t") ?? ""
  const [engaged, setEngaged] = useState<"idle" | "ok" | "err">("idle")

  useEffect(() => {
    if (!leadId || !token) return
    void fetch("/api/magnet-engage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, token }),
    })
      .then(r => { setEngaged(r.ok ? "ok" : "err") })
      .catch(() => setEngaged("err"))
  }, [leadId, token])

  return (
    <div className="min-h-screen bg-[var(--ac-bg)] flex flex-col">
      <BackgroundEffects />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-[#1e1e1e] bg-[var(--ac-bg)]/90 backdrop-blur-sm">
        <Link
          href="/"
          className="text-[var(--ac-text)] tracking-[0.15em] uppercase text-sm hover:text-[var(--ac-accent)] transition-colors"
          style={{ fontFamily: '"coolvetica", sans-serif' }}
        >
          A.C Media
        </Link>
      </header>

      <main className="flex-1 pt-24 pb-24 px-6 max-w-2xl mx-auto w-full">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-[var(--ac-accent)] text-[11px] uppercase tracking-widest mb-4">Welcome guide</p>
          <h1 className="font-heading text-white mb-3" style={{ fontSize: "clamp(2.4rem, 7vw, 4rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            You&apos;re in.
          </h1>
          <p className="text-[#666] text-sm leading-relaxed max-w-sm mx-auto">
            Cole will be in touch soon. Here&apos;s everything you need to know before your session.
          </p>
          {leadId && token && engaged === "ok" && (
            <p className="text-[#4a7a82] text-xs mt-4">We&apos;ll tailor follow-ups from here.</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1e1e1e] mb-16" />

        {/* Guide Sections */}
        <div className="flex flex-col gap-14">
          {sections.map((s, i) => (
            <div key={i}>
              <p className="text-[var(--ac-accent)] text-[10px] uppercase tracking-[0.25em] mb-2">{s.eyebrow}</p>
              <h2 className="font-heading text-white mb-5" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", letterSpacing: "-0.01em" }}>
                {s.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3 text-[#888] text-sm leading-relaxed">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--ac-accent)] opacity-70" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1e1e1e] mt-16 mb-16" />

        {/* Client quotes */}
        <div className="flex flex-col gap-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#444]">What clients say</p>
          {quotes.map((q, i) => (
            <div key={i} className="border-l-2 border-[var(--ac-accent)]/30 pl-5">
              <p className="text-[#aaa] text-sm leading-relaxed mb-3">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-[var(--ac-accent)] text-[10px] uppercase tracking-[0.2em]">
                {q.name} <span className="text-[#444]">· {q.detail}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1e1e1e] mt-16 mb-16" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/work"
            className="inline-flex justify-center px-6 py-3 bg-[var(--ac-accent)] text-[#0d2224] font-heading rounded-lg text-sm hover:bg-[var(--ac-accent-hover)] transition-colors"
          >
            See the work
          </Link>
          <a
            href="https://instagram.com/a_c.media"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center px-6 py-3 border border-[#2a2a2a] text-[#bbb] rounded-lg text-sm hover:border-[var(--ac-accent)]/50 transition-colors"
          >
            Follow on Instagram
          </a>
        </div>
      </main>
    </div>
  )
}

export default function WelcomePackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ac-bg)]" />}>
      <WelcomePackInner />
    </Suspense>
  )
}
