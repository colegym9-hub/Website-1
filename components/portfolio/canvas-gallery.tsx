"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { SHOOTS, TESTIMONIALS, type Category, SIZE_MAP, CATEGORY_LABELS } from "./shoot-data"
import FloatingQuote from "./floating-quote"
import Image from "next/image"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

// Closing shoot is around 530vw + CTA and padding
const TRACK_VW = 600

const SPOTLIGHT_QUOTES = [
  {
    quote: "The best photoshoot I've ever done. He really made us feel comfortable, and the photos turned out incredible.",
    name: "McKenna Patton",
    detail: "Dance",
  },
  {
    quote: "I was blown away when I saw my photos. You can clearly see AC took his time on every photo.",
    name: "Dom Weed",
    detail: "Senior + Baseball",
  },
  {
    quote: "AC is the premier photographer in the area and he won't let you down.",
    name: "Jack Nolan",
    detail: "Senior Portraits",
  },
]

export default function CanvasGallery({ category }: { category: Category }) {
  const wrapRef    = useRef<HTMLDivElement>(null) // outer scroll-height spacer
  const stickyRef  = useRef<HTMLDivElement>(null) // viewport-fixed panel
  const trackRef   = useRef<HTMLDivElement>(null) // the wide horizontal track
  const progressRef = useRef<HTMLDivElement>(null) // progress bar

  useEffect(() => {
    const wrap    = wrapRef.current
    const sticky  = stickyRef.current
    const track   = trackRef.current
    const progress = progressRef.current
    if (!wrap || !sticky || !track) return

    // Wait a tick for layout to settle
    const id = setTimeout(() => {
      ScrollTrigger.refresh()

      // Use GSAP matchMedia to only run the horizontal scroll on desktop
      const mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
        const totalMove = track.scrollWidth - window.innerWidth
        if (totalMove <= 0) return

        // Give the spacer enough height to drive the horizontal move
        wrap.style.height = `${window.innerHeight + totalMove}px`

        const ctx = gsap.context(() => {
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: () => `+=${track.scrollWidth - window.innerWidth}`,
              scrub: 1.2,
              invalidateOnRefresh: true,
              onRefresh: () => {
                wrap.style.height = `${window.innerHeight + track.scrollWidth - window.innerWidth}px`
              },
              onUpdate: (self) => {
                if (progress) gsap.set(progress, { scaleX: self.progress })
              },
            },
          })
        }, wrap)

        return () => {
          ctx.revert()
          wrap.style.height = "auto"
        }
      })

      return () => mm.revert()
    }, 150)

    return () => clearTimeout(id)
  }, [])

  return (
    <>
      {/* ── Desktop Horizontal Gallery ── */}
      <div ref={wrapRef} className="relative hidden md:block">
      {/* Sticky panel — stays fixed to viewport while spacer scrolls */}
      <div
        ref={stickyRef}
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 z-20 origin-left"
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "var(--ac-accent)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
            opacity: 1,
            zIndex: 50,
          }}
        />

        {/* Wide horizontal track — GSAP translates this left */}
        <div
          ref={trackRef}
          className="absolute top-0 left-0 h-full will-change-transform"
          style={{ width: `${TRACK_VW}vw` }}
        >
          {/* ── Shoot images ── */}
          {SHOOTS.map((shoot) => {
            const dimmed = category !== "all" && shoot.category !== category
            const { width, height } = SIZE_MAP[shoot.size]

            return (
              <div
                key={shoot.id}
                className="absolute"
                style={{
                  top: shoot.top,
                  left: shoot.left,
                  width,
                  opacity: dimmed ? 0.22 : 1,
                  transform: dimmed ? "scale(0.97)" : "scale(1)",
                  transition: "opacity 0.45s ease, transform 0.45s ease",
                  pointerEvents: dimmed ? "none" : "auto",
                }}
              >
                {/* Shoot label */}
                <p
                  className="mb-2 text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--ac-text-muted)" }}
                >
                  {shoot.title}
                </p>

                {/* Image card */}
                <Link
                  href={`/work/${shoot.id}`}
                  className="group relative block overflow-hidden"
                  style={{ width, height, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
                  tabIndex={dimmed ? -1 : 0}
                >
                  <Image
                    src={shoot.cover}
                    alt={shoot.title}
                    fill
                    sizes="40vw"
                    className="object-cover"
                    style={{
                      filter: shoot.isGrayscale ? "grayscale(100%)" : "none",
                      transition: "transform 700ms ease-out, filter 600ms ease-out",
                    }}
                  />

                  {/* Color reveal for B&W images on hover */}
                  {shoot.isGrayscale && (
                    <Image
                      src={shoot.cover}
                      alt=""
                      fill
                      aria-hidden
                      sizes="40vw"
                      className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ filter: "none" }}
                    />
                  )}

                  {/* Scale on hover */}
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]" />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />

                  {/* Bottom reveal */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ac-accent)" }}>
                      {CATEGORY_LABELS[shoot.category]}
                    </span>
                    <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--ac-text-muted)" }}>
                      View →
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}

          {/* ── Testimonials ── */}
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className="absolute"
              style={{ top: t.top, left: t.left, maxWidth: "260px" }}
            >
              <FloatingQuote
                quote={t.quote}
                attribution={t.attribution}
                context={t.context}
                delay={0.8 + i * 0.3}
              />
            </div>
          ))}

          {/* ── Testimonial Spotlight ── */}
          <div
            className="absolute flex flex-col justify-center"
            style={{
              top: 0,
              left: `${TRACK_VW - 58}vw`,
              width: "32vw",
              height: "100vh",
              paddingLeft: "3vw",
              paddingRight: "3vw",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.28em] mb-8"
              style={{ color: "var(--ac-accent)" }}
            >
              What clients say
            </p>
            <div className="flex flex-col gap-8">
              {SPOTLIGHT_QUOTES.map((q, i) => (
                <div key={i}>
                  <p
                    className="font-heading leading-snug mb-3"
                    style={{
                      fontSize: "clamp(1rem, 1.5vw, 1.35rem)",
                      color: "var(--ac-text)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ac-accent)" }}>
                    {q.name} <span style={{ color: "var(--ac-text-muted)" }}>· {q.detail}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── End CTA ── */}
          <div
            className="absolute flex flex-col gap-6"
            style={{
              top: "50%",
              left: `${TRACK_VW - 26}vw`,
              transform: "translate(0, -50%)",
              paddingLeft: "4vw",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="font-heading"
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
                color: "var(--ac-text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Let&apos;s build<br />yours.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm transition-colors duration-300"
              style={{
                backgroundColor: "var(--ac-accent)",
                color: "#0d2224",
              }}
            >
              Book a shoot
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* ── Mobile Vertical Gallery ── */}
      <div className="md:hidden w-full px-5 py-24 flex flex-col gap-24 overflow-x-hidden">
        {SHOOTS.map((shoot, i) => {
          const isLandscape = shoot.size === "hero" || shoot.size === "large"

          return (
            <div key={shoot.id} className="flex flex-col items-center w-full">
              {/* Shoot Label */}
              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase text-center w-full" style={{ color: "var(--ac-text-muted)" }}>
                {shoot.title}
              </p>

              {/* Image Card */}
              <Link
                href={`/work/${shoot.id}`}
                className="group relative block w-full overflow-hidden"
                style={{
                  aspectRatio: isLandscape ? "4/3" : "4/5",
                  maxWidth: "400px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                }}
              >
                <Image
                  src={shoot.cover}
                  alt={shoot.title}
                  fill
                  sizes="90vw"
                  className="object-cover transition-transform duration-700 ease-out group-active:scale-[1.02]"
                  style={{
                    filter: shoot.isGrayscale ? "grayscale(100%)" : "none",
                  }}
                />

                {/* Dark overlay base just slightly */}
                <div className="absolute inset-0 bg-black/10 transition-colors duration-500" />

                {/* Bottom reveal is always subtly visible on mobile, fades in fully on tap/hover */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ac-accent)" }}>
                    {CATEGORY_LABELS[shoot.category]}
                  </span>
                  <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--ac-text-muted)" }}>
                    View
                  </span>
                </div>
              </Link>

              {/* Interspersed Testimonials (mix them in roughly every other post if available) */}
              {TESTIMONIALS[i] && (
                <div className="mt-20 px-2 w-full max-w-[320px]">
                  <FloatingQuote
                    quote={TESTIMONIALS[i].quote}
                    attribution={TESTIMONIALS[i].attribution}
                    context={TESTIMONIALS[i].context}
                    delay={0}
                  />
                </div>
              )}
            </div>
          )
        })}

        {/* Mobile Testimonial Spotlight */}
        <div className="flex flex-col gap-8 px-2 py-10 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: "var(--ac-accent)" }}>
            What clients say
          </p>
          {SPOTLIGHT_QUOTES.map((q, i) => (
            <div key={i} className="border-l-2 pl-4" style={{ borderColor: "var(--ac-accent)", opacity: 0.6 + i * 0.1 }}>
              <p className="text-[#aaa] text-sm leading-relaxed mb-2">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ac-accent)" }}>
                {q.name} <span style={{ color: "var(--ac-text-muted)" }}>· {q.detail}</span>
              </p>
            </div>
          ))}
        </div>

        {/* End CTA Mobile */}
        <div className="mt-4 flex flex-col items-center gap-5 text-center py-16 border-t border-white/5">
          <p className="font-heading text-3xl" style={{ color: "var(--ac-text)", letterSpacing: "-0.02em" }}>
            Let&apos;s build yours.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm transition-colors duration-300"
            style={{ backgroundColor: "var(--ac-accent)", color: "#0d2224" }}
          >
            Book a shoot →
          </Link>
        </div>
      </div>
    </>
  )
}
