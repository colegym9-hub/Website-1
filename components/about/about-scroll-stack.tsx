"use client"

import { Children, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import styles from "./about-scroll-stack.module.css"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", onStoreChange)
      return () => mq.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

/**
 * Pinned scroll stack — cards slide up from below to overlap the previous ones.
 * Mimics the homepage HomeArcServices animations.
 * Falls back to normal vertical scroll on mobile (<768px) or reduced motion.
 */
export function AboutScrollStack({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [activeSlide, setActiveSlide] = useState(0)

  const reduced = usePrefersReducedMotion()
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true
    return window.innerWidth < 768
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useLayoutEffect(() => {
    if (isMobile || reduced || slides.length < 2) return

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean)
      if (cards.length !== slides.length) return

      const totalScrollHeight = window.innerHeight * slides.length
      const lastEndTime = (slides.length - 2) * 1.4 + 1.2
      const timelineDuration = lastEndTime + 0.6

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalScrollHeight}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress
            const timelineTime = p * timelineDuration

            let current = 0
            for (let i = 1; i < slides.length; i++) {
              const midpoint = (i - 1) * 1.4 + 0.8
              if (timelineTime >= midpoint) {
                current = i
              }
            }
            setActiveSlide(current)
          },
        },
      })

      // Set initial positions: all cards except the first are below screen
      cards.forEach((card, index) => {
        if (index > 0) {
          gsap.set(card, { y: window.innerHeight })
        }
      })

      for (let i = 1; i < slides.length; i++) {
        const startTime = (i - 1) * 1.4 + 0.4

        tl.fromTo(cards[i],
          { y: window.innerHeight },
          { y: 0, ease: "power1.inOut", duration: 0.8 },
          startTime
        )
        tl.to(cards[i - 1],
          { scale: 0.9, opacity: 0, ease: "power1.inOut", duration: 0.8 },
          startTime
        )
      }

      tl.to({}, { duration: 0.6 }, lastEndTime)

    }, containerRef)

    return () => ctx.revert()
  }, [isMobile, reduced, slides.length]);

  // Mobile / reduced motion: plain stacked cards
  if (isMobile || reduced) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:gap-8 md:px-8">
        {slides.map((node, j) => (
          <div key={j}>{node}</div>
        ))}
      </div>
    )
  }

  const lastEndTime = (slides.length - 2) * 1.4 + 1.2;
  const timelineDuration = lastEndTime + 0.6;

  // Desktop: pinned overlapping stack
  return (
    <section ref={containerRef} className={styles.container}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          {slides.map((_, index) => (
            <button
              key={index} 
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                styles.progressDot, 
                index === activeSlide && styles.progressDotActive
              )}
              onClick={() => {
                if (containerRef.current) {
                  const startPos = containerRef.current.offsetTop;
                  const totalScroll = window.innerHeight * slides.length;
                  
                  let targetTime = 0;
                  if (index > 0) {
                    targetTime = (index - 1) * 1.4 + 1.2;
                  }
                  
                  const targetScroll = startPos + (targetTime / timelineDuration) * totalScroll;
                  window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.cardsWrapper}>
        {slides.map((node, index) => (
          <div 
            key={index} 
            ref={(el) => {
              cardsRef.current[index] = el;
            }} 
            className={styles.card}
            style={{ zIndex: index }}
          >
            <div className="w-full h-full">
              {node}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
