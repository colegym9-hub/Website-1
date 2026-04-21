"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Badge } from "@/components/ui/badge"

gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type CardData = {
  id: string
  label: string
  sub: string
  img: string
  popular?: boolean
}

const CARDS: CardData[] = [
  {
    id: "sportraits",
    label: "Sportraits",
    sub: "Sport-specific athlete portraits",
    img: "https://images.pixieset.com/821255111/17617b846454f5f264d489b2eded72bf-large.jpg",
  },
  {
    id: "media-day",
    label: "Media Day",
    sub: "Teams, programs, and organizations",
    img: "https://images.pixieset.com/821255111/987e6ce32b37bc16626624495bdc8865-large.jpg",
    popular: true,
  },
  {
    id: "senior-portraits",
    label: "Senior Portraits",
    sub: "Your year, your story",
    img: "https://images.pixieset.com/821255111/91e7a8de3d7234a737043d22f1b2b9fb-large.jpg",
  },
]

// Order: left=CARDS[0], center=CARDS[1], right=CARDS[2]
const LEFT   = CARDS[0]
const CENTER = CARDS[1]
const RIGHT  = CARDS[2]

// ---------------------------------------------------------------------------
// Shared card image + overlay
// ---------------------------------------------------------------------------

function CardInner({ data, large = false }: { data: CardData; large?: boolean }) {
  return (
    <>
      <Image
        src={data.img}
        alt={data.label}
        fill
        sizes="(max-width: 768px) 80vw, 22vw"
        className="object-cover"
        priority={data.id === "media-day"}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: large ? "20px" : "14px",
          textAlign: "left",
        }}
      >
        <p
          style={{
            fontFamily: '"coolvetica", sans-serif',
            color: "#F0EDE8",
            fontSize: large ? "1.3rem" : "clamp(0.9rem, 2.2vw, 1.15rem)",
            lineHeight: 1.1,
            marginBottom: "4px",
          }}
        >
          {data.label}
        </p>
        <p style={{ color: "#A0A0A0", fontSize: large ? "0.8rem" : "0.7rem", lineHeight: 1.4 }}>
          {data.sub}
        </p>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// WhatWeOffer
// ---------------------------------------------------------------------------

export default function WhatWeOffer() {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const sectionRef  = useRef<HTMLDivElement>(null)

  // Desktop Part-A hand card refs
  const dLeftRef   = useRef<HTMLDivElement>(null)
  const dCenterRef = useRef<HTMLDivElement>(null)
  const dRightRef  = useRef<HTMLDivElement>(null)

  // Mobile stacked card refs
  const mLeftRef   = useRef<HTMLDivElement>(null)
  const mCenterRef = useRef<HTMLDivElement>(null)
  const mRightRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const mobile = window.innerWidth < 768

    const leftCard   = mobile ? mLeftRef.current   : dLeftRef.current
    const centerCard = mobile ? mCenterRef.current : dCenterRef.current
    const rightCard  = mobile ? mRightRef.current  : dRightRef.current

    if (!leftCard || !centerCard || !rightCard) return

    // ------------------------------------------------------------------
    // Part A — card hand entry animation
    // ------------------------------------------------------------------

    if (mobile) {
      gsap.set([leftCard, centerCard, rightCard], { opacity: 0, y: 30 })
    } else {
      gsap.set(centerCard, { opacity: 0, scale: 0.85, filter: "blur(8px)" })
      gsap.set(leftCard,   { opacity: 0, rotateY: 25, z: -80 })
      gsap.set(rightCard,  { opacity: 0, rotateY: -25, z: -80 })
    }

    const entryTl = gsap.timeline({ paused: true })

    if (mobile) {
      entryTl
        .to(leftCard,   { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
        .to(centerCard, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .to(rightCard,  { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    } else {
      entryTl
        .to(centerCard, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
        })
        .to(
          leftCard,
          { opacity: 1, rotateY: -15, z: -40, duration: 0.65, ease: "power3.out" },
          "-=0.4",
        )
        .to(
          rightCard,
          { opacity: 1, rotateY: 15, z: -40, duration: 0.65, ease: "power3.out" },
          "<",
        )
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      once: true,
      onEnter: () => entryTl.play(),
    })

    return () => {
      entryTl.kill()
    }
  }, [])

  const handleServiceClick = (serviceId: string) => {
    router.push(`/contact?service=${serviceId}`)
  }

  // Shared hand card base styles (GSAP will animate opacity in)
  const handCardStyle: React.CSSProperties = {
    width: "clamp(160px, 22vw, 220px)",
    aspectRatio: "3 / 4",
    borderRadius: "10px",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    opacity: 0, // GSAP animates in
    background: "rgba(15, 15, 15, 0.9)",
    border: "1px solid rgba(58, 142, 138, 0.3)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0A0A] overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Section header                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center pt-20 px-6 mb-12">
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "var(--ac-accent)",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          What We Do
        </p>
        <h2
          style={{
            fontFamily: '"coolvetica", sans-serif',
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Every shoot starts somewhere.
        </h2>
      </div>

      {/* ================================================================== */}
      {/* DESKTOP                                                             */}
      {/* ================================================================== */}
      <div
        className="hidden md:flex flex-col items-center justify-center"
        style={{ paddingBottom: "80px" }}
      >
        {/* Part A — 3-D card hand */}
        <div
          style={{
            perspective: "1400px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {/* Left card — Sportraits */}
          <div
            ref={dLeftRef}
            style={{
              ...handCardStyle,
              transform: "rotateY(-15deg) translateZ(-40px)",
              transition: "filter 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
              filter:
                hoveredId && hoveredId !== LEFT.id
                  ? "blur(2px) brightness(0.55)"
                  : "none",
              boxShadow:
                hoveredId === LEFT.id
                  ? "0 16px 48px rgba(58,142,138,0.2), 0 8px 32px rgba(0,0,0,0.5)"
                  : "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
            onMouseEnter={() => setHoveredId(LEFT.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleServiceClick(LEFT.id)}
          >
            <CardInner data={LEFT} />
          </div>

          {/* Center card — Media Day */}
          <div
            ref={dCenterRef}
            style={{
              ...handCardStyle,
              transform:
                hoveredId === CENTER.id
                  ? "scale(1.05) translateY(-6px)"
                  : "scale(1)",
              transition: "filter 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
              filter:
                hoveredId && hoveredId !== CENTER.id
                  ? "blur(2px) brightness(0.55)"
                  : "none",
              boxShadow:
                hoveredId === CENTER.id
                  ? "0 16px 48px rgba(58,142,138,0.2), 0 8px 32px rgba(0,0,0,0.5)"
                  : "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
            onMouseEnter={() => setHoveredId(CENTER.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleServiceClick(CENTER.id)}
          >
            {CENTER.popular && (
              <Badge className="absolute top-[10px] right-[10px] z-10 bg-[var(--ac-accent)] text-white text-[0.6rem] tracking-[0.15em] uppercase">
                Most Popular
              </Badge>
            )}
            <CardInner data={CENTER} />
          </div>

          {/* Right card — Senior Portraits */}
          <div
            ref={dRightRef}
            style={{
              ...handCardStyle,
              transform:
                hoveredId === RIGHT.id
                  ? "scale(1.05) translateY(-6px)"
                  : "rotateY(15deg) translateZ(-40px)",
              transition: "filter 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
              filter:
                hoveredId && hoveredId !== RIGHT.id
                  ? "blur(2px) brightness(0.55)"
                  : "none",
              boxShadow:
                hoveredId === RIGHT.id
                  ? "0 16px 48px rgba(58,142,138,0.2), 0 8px 32px rgba(0,0,0,0.5)"
                  : "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
            onMouseEnter={() => setHoveredId(RIGHT.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleServiceClick(RIGHT.id)}
          >
            <CardInner data={RIGHT} />
          </div>
        </div>

        {/* Funnel — normal flow below cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "64px",
            padding: "0 24px",
          }}
        >
          <h3
            style={{
              fontFamily: '"coolvetica", sans-serif',
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: "8px",
            }}
          >
            What are we creating together?
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#A0A0A0",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            Pick the one that fits. We&apos;ll build from there.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {CARDS.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleServiceClick(card.id)}
                whileHover={{ scale: 1.04, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  width: "clamp(140px, 20vw, 200px)",
                  aspectRatio: "3 / 4",
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  cursor: "pointer",
                  background: "rgba(15, 15, 15, 0.9)",
                  border: "1px solid rgba(58, 142, 138, 0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
                  padding: 0,
                }}
                aria-label={`Select ${card.label}`}
              >
                {card.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "var(--ac-accent)",
                      color: "#ffffff",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      zIndex: 10,
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <CardInner data={card} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE — stacked cards then funnel, no pin                         */}
      {/* ================================================================== */}
      <div className="flex md:hidden flex-col items-center px-6 pb-20 gap-16">

        {/* Part A — stacked hand cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          <div
            ref={mLeftRef}
            style={{
              width: "100%",
              maxWidth: "360px",
              aspectRatio: "3 / 4",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              opacity: 0,
              background: "rgba(15, 15, 15, 0.9)",
              border: "1px solid rgba(58, 142, 138, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
          >
            <CardInner data={LEFT} large />
          </div>

          <div
            ref={mCenterRef}
            style={{
              width: "100%",
              maxWidth: "360px",
              aspectRatio: "3 / 4",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              opacity: 0,
              background: "rgba(15, 15, 15, 0.9)",
              border: "1px solid rgba(58, 142, 138, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
          >
            {CENTER.popular && (
              <Badge className="absolute top-[10px] right-[10px] z-10 bg-[var(--ac-accent)] text-white text-[0.6rem] tracking-[0.15em] uppercase">
                Most Popular
              </Badge>
            )}
            <CardInner data={CENTER} large />
          </div>

          <div
            ref={mRightRef}
            style={{
              width: "100%",
              maxWidth: "360px",
              aspectRatio: "3 / 4",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              opacity: 0,
              background: "rgba(15, 15, 15, 0.9)",
              border: "1px solid rgba(58, 142, 138, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
            }}
          >
            <CardInner data={RIGHT} large />
          </div>
        </div>

        {/* Funnel — always visible below on mobile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: "12px",
          }}
        >
          <h3
            style={{
              fontFamily: '"coolvetica", sans-serif',
              fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            What are we creating together?
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#A0A0A0",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Pick the one that fits. We&apos;ll build from there.
          </p>

          {CARDS.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleServiceClick(card.id)}
              whileHover={{ scale: 1.04, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                width: "100%",
                maxWidth: "360px",
                aspectRatio: "3 / 4",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                background: "rgba(15, 15, 15, 0.9)",
                border: "1px solid rgba(58, 142, 138, 0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(58,142,138,0.06)",
                padding: 0,
              }}
              aria-label={`Select ${card.label}`}
            >
              {card.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "var(--ac-accent)",
                    color: "#ffffff",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    zIndex: 10,
                  }}
                >
                  Most Popular
                </div>
              )}
              <CardInner data={card} large />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
