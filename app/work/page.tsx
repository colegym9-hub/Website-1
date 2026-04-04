"use client"

import { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Footer from "@/components/footer"
import CanvasGallery from "@/components/portfolio/canvas-gallery"
import TopographicBg from "@/components/portfolio/topographic-bg"

gsap.registerPlugin(ScrollTrigger)

const MARQUEE_WORDS = [
  "THE WORK", "MEDIA DAYS", "SPORTRAITS", "SENIOR PORTRAITS",
  "THE WORK", "MEDIA DAYS", "SPORTRAITS", "SENIOR PORTRAITS",
]

export default function WorkPage() {
  const marqueeRef   = useRef<HTMLDivElement>(null)
  const heroTextRef  = useRef<HTMLDivElement>(null)
  const signatureRef = useRef<HTMLDivElement>(null)

  // Marquee
  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const totalWidth = el.scrollWidth / 2
    const anim = gsap.to(el, { x: -totalWidth, duration: 38, ease: "none", repeat: -1 })
    return () => { anim.kill() }
  }, [])

  // Hero text stagger in
  useEffect(() => {
    const el = heroTextRef.current
    if (!el) return
    gsap.fromTo(
      el.children,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.3 }
    )
  }, [])

  // Signature reveal — scale + fade instead of stroke draw
  useEffect(() => {
    const el = signatureRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.88, filter: "blur(4px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.out", delay: 1.0 }
    )
  }, [])

  return (
    <main className="relative min-h-screen" style={{ backgroundColor: "var(--ac-bg)" }}>
      <TopographicBg />

      {/* ── Hero ── */}
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* Background marquee */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
          <div ref={marqueeRef} className="flex whitespace-nowrap" style={{ willChange: "transform" }}>
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
              <span
                key={i}
                className="font-heading px-8 select-none"
                style={{
                  fontSize: "clamp(5rem, 16vw, 14rem)",
                  color: "transparent",
                  WebkitTextStroke: "1px color-mix(in srgb, var(--ac-accent) 18%, transparent)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Hero content */}
        <div
          ref={heroTextRef}
          className="relative z-10 flex flex-col items-center gap-5 text-center px-6"
        >
          <p
            className="text-[11px] tracking-[0.28em] uppercase"
            style={{ color: "var(--ac-accent)", opacity: 0 }}
          >
            A.C Media · Portfolio
          </p>

          <h1
            className="font-heading"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              color: "var(--ac-text)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              opacity: 0,
            }}
          >
            The Work.
          </h1>

          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: "var(--ac-text-muted)", opacity: 0 }}
          >
            Every athlete. Every team. Every season.
          </p>

          {/* Signature — cursive font, GSAP scale+blur reveal */}
          <div
            ref={signatureRef}
            style={{
              opacity: 0,
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              color: "var(--ac-accent)",
              letterSpacing: "0.01em",
              lineHeight: 1.1,
              userSelect: "none",
            }}
            aria-label="A.C Media signature"
          >
            A.C Media
          </div>

          {/* Scroll cue */}
          <div className="mt-2 flex flex-col items-center gap-2" style={{ opacity: 0 }}>
            <span
              className="text-[10px] tracking-[0.22em] uppercase"
              style={{ color: "var(--ac-text-muted)" }}
            >
              Scroll to explore
            </span>
            <div
              className="h-8 w-px animate-pulse"
              style={{ backgroundColor: "var(--ac-accent)", opacity: 0.5 }}
            />
          </div>
        </div>
      </section>

      {/* ── Canvas ── */}
      <section className="relative z-10">
        <CanvasGallery category="all" />
      </section>

      {/* ── Footer ── */}
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  )
}
