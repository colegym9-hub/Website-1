"use client"

import { useEffect } from "react"

export default function BackgroundEffects() {
  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches
    if (isMobile) return

    const onMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px")
      document.documentElement.style.setProperty("--my", e.clientY + "px")
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <>
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9997]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.035,
        }}
      />
      {/* Mouse glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9996] hidden md:block"
        style={{
          background:
            "radial-gradient(circle 700px at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--ac-accent) 12%, transparent) 0%, transparent 70%)",
          transition: "background 0.2s ease",
        }}
      />
    </>
  )
}
