"use client"

import { useRef, useEffect, useMemo } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { SIZE_MAP, CATEGORY_LABELS, type Category, type ShootSize } from "./shoot-data"
import FloatingQuote from "./floating-quote"
import Image from "next/image"
import Link from "next/link"
import type { GalleryItem, GalleryLayout } from "@/lib/site-content-schema"

gsap.registerPlugin(ScrollTrigger)

function shootSizePreset(item: Extract<GalleryItem, { type: "shoot" }>): ShootSize {
  return item.sizePreset ?? "medium"
}

function mobileSortItems(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((a, b) => {
    if (a.col !== b.col) return a.col - b.col
    return a.row - b.row
  })
}

export default function CanvasGallery({
  category,
  layout,
}: {
  category: Category
  layout: GalleryLayout
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const tw = layout.trackWidthVw
  const mobileOrder = useMemo(() => mobileSortItems(layout.items), [layout.items])

  useEffect(() => {
    const wrap = wrapRef.current
    const sticky = stickyRef.current
    const track = trackRef.current
    const progress = progressRef.current
    if (!wrap || !sticky || !track) return

    const id = setTimeout(() => {
      ScrollTrigger.refresh()

      const mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
        const totalMove = track.scrollWidth - window.innerWidth
        if (totalMove <= 0) return

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
  }, [layout.trackWidthVw, layout.items.length])

  const endHeadlineLines = layout.endCta.headline.split("\n")

  return (
    <>
      <div ref={wrapRef} className="relative hidden md:block">
        <div ref={stickyRef} className="sticky top-0 overflow-hidden" style={{ height: "100vh" }}>
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

          <div
            ref={trackRef}
            className="absolute top-0 left-0 h-full will-change-transform"
            style={{
              width: `${tw}vw`,
              height: "100vh",
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gridTemplateRows: `repeat(${layout.gridRowCount}, minmax(0, 1fr))`,
              position: "relative",
            }}
          >
            {layout.items.map((item, idx) => {
              if (item.type === "shoot") {
                const dimmed = category !== "all" && item.category !== category
                const size = shootSizePreset(item)
                const { width, height } = SIZE_MAP[size]
                return (
                  <div
                    key={item.id}
                    className="min-w-0 flex flex-col justify-end"
                    style={{
                      gridColumn: `${item.col} / span ${item.colSpan}`,
                      gridRow: `${item.row} / span ${item.rowSpan}`,
                      opacity: dimmed ? 0.22 : 1,
                      transform: dimmed ? "scale(0.97)" : "scale(1)",
                      transition: "opacity 0.45s ease, transform 0.45s ease",
                      pointerEvents: dimmed ? "none" : "auto",
                      zIndex: 2,
                      paddingBottom: "0.25rem",
                    }}
                  >
                    <p
                      className="mb-2 text-[10px] tracking-[0.2em] uppercase truncate"
                      style={{ color: "var(--ac-text-muted)" }}
                    >
                      {item.title}
                    </p>
                    <Link
                      href={`/work/${item.id}`}
                      className="group relative block shrink-0 overflow-hidden"
                      style={{ width, height, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
                      tabIndex={dimmed ? -1 : 0}
                    >
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        sizes="40vw"
                        className="object-cover"
                        style={{
                          filter: item.isGrayscale ? "grayscale(100%)" : "none",
                          transition: "transform 700ms ease-out, filter 600ms ease-out",
                        }}
                      />
                      {item.isGrayscale && (
                        <Image
                          src={item.cover}
                          alt=""
                          fill
                          aria-hidden
                          sizes="40vw"
                          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ filter: "none" }}
                        />
                      )}
                      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span
                          className="text-[10px] tracking-[0.18em] uppercase"
                          style={{ color: "var(--ac-accent)" }}
                        >
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <span
                          className="text-[10px] tracking-[0.14em] uppercase"
                          style={{ color: "var(--ac-text-muted)" }}
                        >
                          View →
                        </span>
                      </div>
                    </Link>
                  </div>
                )
              }

              return (
                <div
                  key={item.id}
                  className="min-w-0 flex items-center justify-center px-1"
                  style={{
                    gridColumn: `${item.col} / span ${item.colSpan}`,
                    gridRow: `${item.row} / span ${item.rowSpan}`,
                    zIndex: 5,
                    maxWidth: "100%",
                  }}
                >
                  <div className="max-w-[260px] w-full">
                    <FloatingQuote
                      quote={item.quote}
                      attribution={item.attribution}
                      context={item.context}
                      delay={0.8 + idx * 0.15}
                    />
                  </div>
                </div>
              )
            })}

            <div
              className="pointer-events-none absolute flex flex-col justify-center"
              style={{
                top: 0,
                left: `${tw - 58}vw`,
                width: "32vw",
                height: "100vh",
                paddingLeft: "3vw",
                paddingRight: "3vw",
                borderLeft: "1px solid rgba(255,255,255,0.05)",
                zIndex: 10,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.28em] mb-8"
                style={{ color: "var(--ac-accent)" }}
              >
                {layout.spotlightEyebrow}
              </p>
              <div className="flex flex-col gap-8">
                {layout.spotlightQuotes.map((q, i) => (
                  <div key={`${q.name}-${i}`}>
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

            <div
              className="absolute flex flex-col gap-6"
              style={{
                top: "50%",
                left: `${tw - 26}vw`,
                transform: "translate(0, -50%)",
                paddingLeft: "4vw",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                zIndex: 10,
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
                {endHeadlineLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < endHeadlineLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
              <Link
                href={layout.endCta.buttonHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm transition-colors duration-300"
                style={{
                  backgroundColor: "var(--ac-accent)",
                  color: "#0d2224",
                }}
              >
                {layout.endCta.buttonText}
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full px-5 py-24 flex flex-col gap-24 overflow-x-hidden">
        {mobileOrder.map((item, i) => {
          if (item.type === "shoot") {
            const dimmed = category !== "all" && item.category !== category
            if (dimmed) return null
            const size = shootSizePreset(item)
            const isLandscape = size === "hero" || size === "large"
            return (
              <div key={item.id} className="flex flex-col items-center w-full">
                <p
                  className="mb-3 text-[10px] tracking-[0.2em] uppercase text-center w-full"
                  style={{ color: "var(--ac-text-muted)" }}
                >
                  {item.title}
                </p>
                <Link
                  href={`/work/${item.id}`}
                  className="group relative block w-full overflow-hidden"
                  style={{
                    aspectRatio: isLandscape ? "4/3" : "4/5",
                    maxWidth: "400px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    sizes="90vw"
                    className="object-cover transition-transform duration-700 ease-out group-active:scale-[1.02]"
                    style={{
                      filter: item.isGrayscale ? "grayscale(100%)" : "none",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ac-accent)" }}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--ac-text-muted)" }}>
                      View
                    </span>
                  </div>
                </Link>
              </div>
            )
          }
          return (
            <div key={item.id} className="px-2 w-full max-w-[320px] mx-auto">
              <FloatingQuote
                quote={item.quote}
                attribution={item.attribution}
                context={item.context}
                delay={0}
              />
            </div>
          )
        })}

        <div className="flex flex-col gap-8 px-2 py-10 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: "var(--ac-accent)" }}>
            {layout.spotlightEyebrow}
          </p>
          {layout.spotlightQuotes.map((q, i) => (
            <div
              key={`m-${q.name}-${i}`}
              className="border-l-2 pl-4"
              style={{ borderColor: "var(--ac-accent)", opacity: 0.6 + i * 0.1 }}
            >
              <p className="text-[#aaa] text-sm leading-relaxed mb-2">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ac-accent)" }}>
                {q.name} <span style={{ color: "var(--ac-text-muted)" }}>· {q.detail}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-5 text-center py-16 border-t border-white/5">
          <p className="font-heading text-3xl" style={{ color: "var(--ac-text)", letterSpacing: "-0.02em" }}>
            {layout.endCta.headline.replace(/\n/g, " ")}
          </p>
          <Link
            href={layout.endCta.buttonHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm transition-colors duration-300"
            style={{ backgroundColor: "var(--ac-accent)", color: "#0d2224" }}
          >
            {layout.endCta.buttonText} →
          </Link>
        </div>
      </div>
    </>
  )
}
