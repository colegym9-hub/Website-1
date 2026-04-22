"use client"

import { useEffect, type RefObject } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type Args = {
  wrapRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  progressRef?: RefObject<HTMLDivElement | null>
  minViewportWidthPx?: number
  deps?: unknown[]
}

export function useHorizontalScroll({
  wrapRef,
  trackRef,
  progressRef,
  minViewportWidthPx = 768,
  deps = [],
}: Args) {
  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track) return

    const id = setTimeout(() => {
      ScrollTrigger.refresh()

      const mm = gsap.matchMedia()

      mm.add(`(min-width: ${minViewportWidthPx}px)`, () => {
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
                const progress = progressRef?.current
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
