"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { motion, useInView } from "framer-motion"

gsap.registerPlugin(ScrollTrigger)

const workImages = [
  { src: "https://images.pixieset.com/821255111/5636b3ea4eed08fd8f91383c9f6e2981-xlarge.jpg", label: "Media Day", x: "-5%",  y: "0%"  },
  { src: "https://images.pixieset.com/821255111/5cb0e75861b0d503dc3f4a30f34dba0c-xlarge.jpg", label: "Sportrait",  x: "5%",   y: "-8%" },
  { src: "https://images.pixieset.com/821255111/6333ab7bc2c413a9f9a03b2e212bf636-xlarge.jpg", label: "Media Day", x: "-8%",  y: "5%"  },
  { src: "https://images.pixieset.com/821255111/720cfbd94b1219d4690ab0cf997b12a2-xlarge.jpg", label: "Senior",    x: "3%",   y: "-3%" },
  { src: "https://images.pixieset.com/821255111/7ed24ec634a033f075c891a7f68bb023-xlarge.jpg", label: "Media Day", x: "-3%",  y: "8%"  },
]

export default function TheWork() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const imgsRef = useRef<(HTMLDivElement | null)[]>([])
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: "-10%" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768

      if (isMobile) return

      // Pin the section and drive animations via scroll progress
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 2}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress

          // Heading grows in font-size
          const size = 3 + p * 12 // 3rem → 15rem
          gsap.set(headingRef.current, { fontSize: `${size}rem` })

          // Images spread outward as scroll progresses
          imgsRef.current.forEach((img, i) => {
            if (!img) return
            const dir = i % 2 === 0 ? -1 : 1
            const spread = p * (120 + i * 20)
            gsap.set(img, {
              x: dir * spread,
              y: (i - 2) * p * 30,
              opacity: Math.max(0, 1 - p * 1.6),
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Stacked images */}
      <div
        ref={stackRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        {workImages.map((img, i) => (
          <div
            key={i}
            ref={(el) => { imgsRef.current[i] = el }}
            className="absolute"
            style={{
              width: "clamp(160px, 18vw, 280px)",
              aspectRatio: "2/3",
              top: `calc(50% + ${img.y})`,
              left: `calc(50% + ${img.x})`,
              transform: "translate(-50%, -50%)",
              zIndex: workImages.length - i,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.label}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.75) contrast(1.05)" }}
            />
            <span
              className="absolute bottom-2 left-2 text-[10px] text-[#A0A0A0] tracking-widest uppercase"
            >
              {img.label}
            </span>
          </div>
        ))}
      </div>

      {/* Growing headline */}
      <div className="relative z-10 text-center px-4 pointer-events-none">
        <h2
          ref={headingRef}
          className="font-heading text-[#F0EDE8] leading-none whitespace-nowrap"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "-0.03em",
            mixBlendMode: "difference",
          }}
        >
          The Work
        </h2>
      </div>

      {/* CTA — appears at bottom */}
      <motion.div
        ref={ctaRef}
        initial={{ opacity: 0, y: 16 }}
        animate={ctaInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        className="absolute bottom-12 left-0 right-0 flex justify-center z-20"
      >
        <Link
          href="/work"
          className="inline-flex items-center gap-3 text-sm text-[var(--ac-accent)] tracking-widest uppercase hover:text-[var(--ac-accent-mid)] transition-colors duration-300 group"
        >
          View all work
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </motion.div>
    </section>
  )
}
