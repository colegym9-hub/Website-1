"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

// FloatingQuote — no ScrollTrigger (it doesn't work reliably inside a GSAP-pinned container).
// Instead: delayed fade+rise on mount, continuous float loop.

type FloatingQuoteProps = {
  quote: string
  attribution: string
  context: string
  delay?: number // seconds to delay entrance (stagger between quotes)
}

export default function FloatingQuote({ quote, attribution, context, delay = 0.4 }: FloatingQuoteProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Delayed fade + rise entrance
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power3.out",
        delay,
      }
    )

    // Continuous gentle float after entrance
    const floatAnim = gsap.to(el, {
      y: "-=10",
      duration: 4 + Math.random() * 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: delay + 1.2,
    })

    return () => { floatAnim.kill() }
  }, [delay])

  return (
    <div
      ref={ref}
      className="select-none"
      style={{ opacity: 0, maxWidth: "260px" }}
    >
      {/* Teal accent line */}
      <div
        className="mb-3 h-px w-8"
        style={{ backgroundColor: "var(--ac-accent)" }}
      />

      {/* Quote */}
      <p
        className="text-sm leading-relaxed italic"
        style={{ color: "var(--ac-text)", fontFamily: "var(--font-body-typekit), system-ui" }}
      >
        &ldquo;{quote}&rdquo;
      </p>

      {/* Attribution */}
      <div className="mt-3 flex flex-col gap-0.5">
        <span
          className="font-heading text-sm tracking-wide"
          style={{ color: "var(--ac-accent)", letterSpacing: "0.04em" }}
        >
          {attribution}
        </span>
        <span
          className="text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--ac-text-muted)" }}
        >
          {context}
        </span>
      </div>
    </div>
  )
}
