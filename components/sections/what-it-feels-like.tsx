"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { motion, useInView } from "framer-motion"

gsap.registerPlugin(ScrollTrigger)

// TODO: Replace with a real A.C Media shoot photo (smoke + strobes)
const HERO_IMAGE = "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1600&q=85"

// TODO: Add real testimonials from a-cmedia.com/portfolio
const testimonials = [
  {
    quote: "I've never felt more like an athlete in my life. The smoke, the lighting. It was something completely different.",
    name: "Jordan M.",
    detail: "Basketball · Binghamton University",
  },
  {
    quote: "Cole made the whole team feel comfortable. By the end everyone was hyped and the photos showed it.",
    name: "Coach T. Williams",
    detail: "Varsity Football · Corning-Painted Post",
  },
  {
    quote: "I didn't think senior portraits could actually look like this. These don't look like anything from around here.",
    name: "Alyssa K.",
    detail: "Senior Athlete · Elmira Heights",
  },
  {
    quote: "The turnaround was fast, the images were incredible. Parents were texting me the whole week after.",
    name: "Coach D. Rivera",
    detail: "Club Volleyball · Southern Tier",
  },
  {
    quote: "I went in nervous and came out with images I'm still sending to coaches a year later.",
    name: "Marcus L.",
    detail: "Baseball · SUNY Broome",
  },
]

export default function WhatItFeelsLike() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-10%" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.innerWidth < 768) return

      const strip = stripRef.current
      if (!strip) return

      const totalWidth = strip.scrollWidth - window.innerWidth

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${totalWidth + window.innerHeight}`,
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          gsap.set(strip, { x: -self.progress * totalWidth })
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
      {/* Full-bleed hero image */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="A.C Media shoot"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.5) contrast(1.15)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.7) 100%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30, skewY: 2 }}
          animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
          transition={{ duration: 1, ease: [0.165, 0.84, 0.44, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <p className="text-[#A0A0A0] text-xs tracking-[0.3em] uppercase mb-4">
            What it feels like
          </p>
          <h2
            className="font-heading text-[clamp(2.5rem,7vw,6rem)] text-[#F0EDE8] leading-none"
            style={{ letterSpacing: "-0.03em" }}
          >
            Something they didn&apos;t
            <br />
            expect.
          </h2>
        </motion.div>
      </div>

      {/* Horizontal testimonial strip */}
      <div className="py-16 overflow-hidden">
        <div
          ref={stripRef}
          className="flex gap-6 px-10 w-max will-change-transform"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[clamp(280px,35vw,440px)] bg-[#111111] border border-[#2A2A2A] p-8 flex flex-col justify-between"
            >
              <p className="text-[#F0EDE8] text-base md:text-lg leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
                <p className="font-medium text-[#F0EDE8] text-sm">{t.name}</p>
                <p className="text-[#A0A0A0] text-xs tracking-widest uppercase mt-1">
                  {t.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
