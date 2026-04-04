"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { motion, useInView } from "framer-motion"

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    quote: "He perfectly captures individuals' personalities with such a unique style that is different from your average photographer.",
    name: "Mackenzie Chamberlain",
    detail: "Senior Portrait · Class of 2025",
    photo: "https://images.pixieset.com/821255111/aebf37f2c2ea8d62e25d6eb7ea4b4f9c-large.jpg",
  },
  {
    quote: "The pics were so sick and unlike any dance pics I've gotten done before. He was open to all ideas.",
    name: "Lilley Watkins",
    detail: "Dance · EGC Studio",
    photo: "https://images.pixieset.com/821255111/50f7dcb6be5720de40032d5ef245e121-large.jpg",
  },
  {
    quote: "I was not expecting it to be that cool without any editing. It was the best photoshoot I've ever done.",
    name: "McKenna Patton",
    detail: "Dance · EGC Studio",
    photo: "https://images.pixieset.com/821255111/6048794ab61949f57627c339447fcaec-large.jpg",
  },
  {
    quote: "AC is the premier photographer in the area and he won't let you down. Great results. Great process. Great experience.",
    name: "Jack Nolan",
    detail: "Senior Portrait · Baseball",
    photo: "https://images.pixieset.com/821255111/91e7a8de3d7234a737043d22f1b2b9fb-large.jpg",
  },
  {
    quote: "It's 100% worth it. He puts in quality work and will deliver the best quality he possibly can for you.",
    name: "Skyler Hughes",
    detail: "Gymnastics Sportraits",
    photo: "https://images.pixieset.com/821255111/a208cab9f4daab1037decf890c3465d7-large.jpg",
  },
  {
    quote: "You can clearly see AC took his time on every photo and took pride in every aspect of editing the photos.",
    name: "Dom Weed",
    detail: "Baseball Sportraits",
    photo: "https://images.pixieset.com/821255111/f2d121665486d77a7ab3b226921254fb-large.jpg",
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stripRef   = useRef<HTMLDivElement>(null)
  const labelRef   = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: "-10%" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768
      if (isMobile) return

      const strip = stripRef.current
      if (!strip) return

      // Width to scroll: total strip width minus one viewport (so last 2 cards land on screen)
      const getScrollWidth = () => strip.scrollWidth - window.innerWidth

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getScrollWidth() + window.innerHeight * 0.5}`,
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(strip, { x: -self.progress * getScrollWidth() })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0A0A] overflow-hidden"
    >
      {/* Header */}
      <div ref={labelRef} className="px-6 md:px-10 pt-20 md:pt-28 pb-10 md:pb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
          className="text-[#A0A0A0] text-xs tracking-[0.3em] uppercase mb-4"
        >
          What clients say
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30, skewY: 1 }}
          animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="font-heading text-[clamp(2.5rem,6vw,5rem)] text-[#F0EDE8] leading-none"
          style={{ letterSpacing: "-0.03em" }}
        >
          Something they
          <br />
          didn&apos;t expect.
        </motion.h2>
      </div>

      {/* Desktop: horizontal scroll strip */}
      <div className="hidden md:block pb-20 overflow-hidden">
        <div
          ref={stripRef}
          className="flex gap-5 px-10 w-max will-change-transform"
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} i={i} />
          ))}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden flex flex-col gap-4 px-6 pb-16">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} i={i} />
        ))}
      </div>
    </section>
  )
}

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-5%" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.165, 0.84, 0.44, 1] }}
      style={{ flexShrink: 0, width: "clamp(400px, 50vw, 560px)" }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* Photo — left side, slightly taller than the quote box */}
        <div
          style={{
            position: "relative",
            width: "160px",
            flexShrink: 0,
            marginTop: "-16px",
            marginBottom: "-16px",
            alignSelf: "stretch",
            overflow: "hidden",
            borderRadius: "6px 0 0 6px",
            boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
            zIndex: 1,
          }}
        >
          <Image
            src={t.photo}
            alt={t.name}
            fill
            sizes="160px"
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
        </div>

        {/* Quote box */}
        <div
          style={{
            flex: 1,
            background: "#111111",
            border: "1px solid #1e1e1e",
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            padding: "28px 24px 24px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px",
          }}
        >
          <p
            style={{
              color: "#F0EDE8",
              fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
              lineHeight: 1.65,
            }}
          >
            &ldquo;{t.quote}&rdquo;
          </p>
          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop: "1px solid #1e1e1e",
            }}
          >
            <p style={{ color: "#F0EDE8", fontSize: "0.875rem", fontWeight: 500 }}>
              {t.name}
            </p>
            <p
              style={{
                color: "#A0A0A0",
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop: "4px",
              }}
            >
              {t.detail}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
