"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { GlobalNavContent } from "@/lib/site-content-schema"
import { DEFAULT_GLOBAL_NAV } from "@/lib/site-content-defaults"

export default function Nav({ content }: { content?: GlobalNavContent }) {
  const nav = content ?? DEFAULT_GLOBAL_NAV
  const links = nav.links
  const [scrolled, setScrolled] = useState(false)
  const [openForPath, setOpenForPath] = useState<string | null>(null)
  const pathname = usePathname()
  const open = openForPath === pathname

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Hide entirely on the booking flow — it has its own header
  if (pathname.startsWith("/book")) return null
  // Admin uses its own shell (Networking Hub–style); no marketing nav
  if (pathname.startsWith("/admin")) return null

  return (
    <>
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "color-mix(in srgb, var(--ac-bg) 95%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--ac-divider)" : "1px solid transparent",
        }}
      >
        <Link
          href="/"
          className="font-heading text-[var(--ac-text)] tracking-[0.15em] uppercase text-sm md:text-base hover:text-[var(--ac-accent)] transition-colors duration-300"
        >
          {nav.brandLabel}
        </Link>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="hidden sm:inline-flex rounded-lg bg-[var(--ac-accent)] text-[var(--ac-text)] hover:bg-[var(--ac-accent-hover)] hover:scale-[1.03] px-5 py-2 text-xs font-medium tracking-widest uppercase transition-all duration-300"
          >
            <Link href={nav.ctaHref}>{nav.ctaText}</Link>
          </Button>

          <button
            onClick={() => setOpenForPath(open ? null : pathname)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex flex-col gap-[5px] p-1 cursor-pointer"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px bg-[var(--ac-text)] w-[22px] origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-px bg-[var(--ac-text)] w-[22px]"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px bg-[var(--ac-text)] w-[22px] origin-center"
            />
          </button>
        </div>
      </header>

      {/* Right drawer */}
      <Sheet open={open} onOpenChange={(nextOpen) => setOpenForPath(nextOpen ? pathname : null)}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex flex-col justify-between py-8 px-8 border-l border-[var(--ac-divider)]"
          style={{
            width: "min(85vw, 420px)",
            backgroundColor: "var(--ac-bg)",
          }}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Close */}
          <div className="flex justify-end">
            <button
              onClick={() => setOpenForPath(null)}
              className="text-[var(--ac-text-muted)] hover:text-[var(--ac-text)] transition-colors text-xs tracking-widest uppercase"
            >
              Close
            </button>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={link.href}
                  className="font-heading block text-[clamp(2.8rem,9vw,4.5rem)] leading-[1.05] text-[var(--ac-text)] hover:text-[var(--ac-accent)] transition-colors duration-300"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <Separator className="bg-[var(--ac-divider)]" />
            <a
              href={nav.sheetSocialHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ac-text-muted)] hover:text-[var(--ac-accent)] transition-colors text-xs tracking-widest uppercase"
            >
              {nav.sheetSocialLabel}
            </a>
            <Button
              asChild
              className="sm:hidden rounded-lg bg-[var(--ac-accent)] text-[var(--ac-text)] hover:bg-[var(--ac-accent-hover)] hover:scale-[1.03] px-6 py-3 text-xs font-medium tracking-widest uppercase transition-all duration-300"
            >
              <Link href={nav.ctaHref}>{nav.ctaText}</Link>
            </Button>
          </motion.div>
        </SheetContent>
      </Sheet>
    </>
  )
}
