"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Image from "next/image"

const POSITIONS = [
  { x: 8,  y: 12, rot: -12, size: "large"  },
  { x: 82, y: 8,  rot:  8,  size: "small"  },
  { x: 15, y: 72, rot:  15, size: "medium" },
  { x: 75, y: 68, rot:  -6, size: "large"  },
  { x: 45, y: 18, rot:  20, size: "small"  },
  { x: 90, y: 45, rot: -18, size: "medium" },
  { x: 5,  y: 45, rot:  10, size: "small"  },
  { x: 55, y: 82, rot: -14, size: "large"  },
  { x: 30, y: 88, rot:   6, size: "medium" },
  { x: 68, y: 22, rot: -10, size: "small"  },
  { x: 20, y: 35, rot:  18, size: "medium" },
  { x: 85, y: 80, rot:  12, size: "large"  },
  { x: 42, y: 55, rot:  -8, size: "small"  },
  { x: 62, y: 48, rot:  14, size: "medium" },
] as const

const IMAGES = [
  "https://images.pixieset.com/821255111/27ab9674f721ad0ef81c485752c834ec-large.jpg",
  "https://images.pixieset.com/821255111/1dd15e9ac0c7f9ea7ea565ab9e4857ca-large.jpg",
  "https://images.pixieset.com/821255111/5636b3ea4eed08fd8f91383c9f6e2981-large.jpg",
  "https://images.pixieset.com/821255111/e95fdd852a3054cb26ed1523ce7b0e8e-large.jpg",
  "https://images.pixieset.com/821255111/de0405d463218b86434c2c2e6861f8fa-large.jpg",
  "https://images.pixieset.com/821255111/f2d121665486d77a7ab3b226921254fb-large.jpg",
  "https://images.pixieset.com/821255111/987e6ce32b37bc16626624495bdc8865-large.jpg",
  "https://images.pixieset.com/821255111/574ce72a98e27b772088134390a78de4-large.jpg",
  "https://images.pixieset.com/821255111/1efbc1814417c9e3455fdf38e8509a14-large.jpg",
  "https://images.pixieset.com/821255111/17617b846454f5f264d489b2eded72bf-large.jpg",
  "https://images.pixieset.com/821255111/195568d10a8ef49a1684257859a246c3-large.jpg",
  "https://images.pixieset.com/821255111/4b518a93f67a7f77ec8ed11f751eb377-large.jpg",
  "https://images.pixieset.com/821255111/8d53b01ff38315ebba4bf7a56bb21bfd-large.jpg",
  "https://images.pixieset.com/821255111/a208cab9f4daab1037decf890c3465d7-large.jpg",
]

const SIZE_MAP = {
  large:  "clamp(100px, 12vw, 180px)",
  medium: "clamp(70px, 8vw, 120px)",
  small:  "clamp(50px, 5vw, 80px)",
} as const

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  const overlayRef  = useRef<HTMLDivElement>(null)
  const centerRef   = useRef<HTMLDivElement>(null)
  const arcRef      = useRef<SVGCircleElement>(null)
  const counterRef  = useRef<HTMLSpanElement>(null)
  const taglineRef  = useRef<HTMLParagraphElement>(null)
  const imageRefs   = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const startTime = performance.now()
    const MIN_MS = 500

    const ctx = gsap.context(() => {
      // Slow infinite rotation on the arc SVG element (parent <svg>)
      const arcSvg = arcRef.current?.closest("svg")
      if (arcSvg) {
        gsap.to(arcSvg, {
          rotation: 360,
          duration: 8,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        })
      }

      // Tagline fades in at 0.6s
      gsap.fromTo(
        taglineRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.6, ease: "power2.out" }
      )

      function runCounter() {
        const elapsed = performance.now() - startTime
        const duration = Math.max(MIN_MS, elapsed) / 1000

        const counterObj = { val: 0 }

        // Arc stroke-dashoffset: 301 → 0
        gsap.fromTo(
          arcRef.current,
          { strokeDashoffset: 301 },
          { strokeDashoffset: 0, duration, ease: "power2.inOut" }
        )

        // Counter 0 → 100
        gsap.to(counterObj, {
          val: 100,
          duration,
          ease: "power2.inOut",
          onUpdate() {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counterObj.val))
            }
          },
          onComplete() {
            // --- Phase 2: collapse center content ---
            gsap.to([centerRef.current], {
              scale: 0,
              opacity: 0,
              duration: 0.4,
              ease: "power3.in",
              onComplete() {
                // Scatter images in
                const imgEls = imageRefs.current.filter(Boolean) as HTMLDivElement[]

                gsap.fromTo(
                  imgEls,
                  { opacity: 0, scale: 0.6 },
                  {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: "power2.out",
                    onComplete() {
                      // Slow drift per image
                      imgEls.forEach((img, i) => {
                        gsap.to(img, {
                          y: "+=20",
                          duration: 6 + i * 0.5,
                          yoyo: true,
                          repeat: -1,
                          ease: "sine.inOut",
                        })
                      })

                      // After 1.2s, curtain wipe upward
                      gsap.delayedCall(1.2, () => {
                        gsap.to(overlayRef.current, {
                          clipPath: "inset(0 0 100% 0)",
                          duration: 0.9,
                          ease: "power3.inOut",
                          onComplete: () => setVisible(false),
                        })
                      })
                    },
                  }
                )
              },
            })
          },
        })
      }

      if (document.readyState === "complete") {
        gsap.delayedCall(Math.max(0, (MIN_MS - (performance.now() - startTime)) / 1000), runCounter)
      } else {
        window.addEventListener("load", runCounter, { once: true })
      }
    })

    return () => ctx.revert()
  }, [])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#0A0A0A]"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      {/* Centered content: arc + counter + tagline */}
      <div className="flex h-full w-full items-center justify-center">
        <div ref={centerRef} className="flex flex-col items-center gap-6">
          {/* Arc + counter */}
          <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
            <svg
              width="112"
              height="112"
              viewBox="0 0 112 112"
              fill="none"
              style={{ position: "absolute", inset: 0 }}
            >
              {/* Track ring */}
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#1E1E1E"
                strokeWidth="3"
              />
              {/* Animated arc */}
              <circle
                ref={arcRef}
                cx="56"
                cy="56"
                r="48"
                stroke="var(--ac-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="301"
                strokeDashoffset="301"
                style={{ transformOrigin: "50% 50%" }}
              />
            </svg>

            {/* Counter number */}
            <span
              ref={counterRef}
              style={{
                fontFamily: "var(--font-display, \"coolvetica\", sans-serif)",
                fontSize: "clamp(3rem, 8vw, 5rem)",
                color: "#ffffff",
                lineHeight: 1,
                position: "relative",
                zIndex: 1,
              }}
            >
              0
            </span>
          </div>

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="text-xs uppercase tracking-[0.2em] text-[#A0A0A0]"
            style={{ opacity: 0 }}
          >
            A.C Media · Athlete Photography · PA &amp; NY
          </p>
        </div>
      </div>

      {/* Space scene images */}
      {POSITIONS.map((pos, i) => (
        <div
          key={i}
          ref={(el) => { imageRefs.current[i] = el }}
          style={{
            position: "absolute",
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `rotate(${pos.rot}deg)`,
            opacity: 0,
            width: SIZE_MAP[pos.size],
            aspectRatio: "2/3",
          }}
        >
          <Image
            src={IMAGES[i]}
            alt=""
            width={600}
            height={900}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority={i < 4}
          />
        </div>
      ))}
    </div>
  )
}
