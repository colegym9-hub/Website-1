"use client"

import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import type { GlobalFooterContent } from "@/lib/site-content-schema"
import { DEFAULT_GLOBAL_FOOTER } from "@/lib/site-content-defaults"

export default function Footer({ content }: { content?: GlobalFooterContent }) {
  const ctaRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ctaRef, { once: true, margin: "-10%" })
  const f = content ?? DEFAULT_GLOBAL_FOOTER

  return (
    <footer className="bg-[var(--ac-bg)]">
      {/* Pre-footer CTA */}
      <div
        ref={ctaRef}
        className="px-6 md:px-10 py-28 md:py-40 text-center border-t border-[var(--ac-divider)]"
      >
        <motion.p
          initial={{ opacity: 0, y: 20, skewY: 1 }}
          animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="text-[var(--ac-text-muted)] text-xs tracking-[0.3em] uppercase mb-5"
        >
          {f.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40, skewY: 2 }}
          animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="font-heading text-[clamp(2.5rem,7vw,5.5rem)] text-[var(--ac-text)] leading-none mb-10"
          style={{ letterSpacing: "-0.03em" }}
        >
          {f.headlineLine1}
          <br />
          {f.headlineLine2}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
        >
          <Button
            asChild
            className="group rounded-lg bg-[var(--ac-accent)] text-[var(--ac-text)] hover:bg-[var(--ac-accent-hover)] hover:scale-[1.03] inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300"
          >
            <Link href={f.ctaHref}>
              {f.ctaText}
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Info bar */}
      <div className="border-t border-[var(--ac-divider)] px-6 md:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-heading text-[var(--ac-text)] text-sm tracking-[0.12em] uppercase">
            {f.brandLine}
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--ac-text-muted)] tracking-widest uppercase">
            {f.links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hover:text-[var(--ac-accent)] transition-colors normal-case sm:uppercase"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-xs text-[var(--ac-text-muted)] tracking-widest uppercase">
            <span>{f.locationLine}</span>
            <span>
              © {new Date().getFullYear()} {f.copyrightName}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
