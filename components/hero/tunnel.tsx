// @turbopack-refresh
"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

// ─── Data ────────────────────────────────────────────────────────────────────

const CYCLING_WORDS = ["Confidence", "Intensity", "Legacy", "Moment"]

const ringImageUrls = [
  "https://images.pixieset.com/821255111/27ab9674f721ad0ef81c485752c834ec-large.jpg",
  "https://images.pixieset.com/821255111/1dd15e9ac0c7f9ea7ea565ab9e4857ca-large.jpg",
  "https://images.pixieset.com/821255111/5636b3ea4eed08fd8f91383c9f6e2981-large.jpg",
  "https://images.pixieset.com/821255111/e95fdd852a3054cb26ed1523ce7b0e8e-large.jpg",
  "https://images.pixieset.com/821255111/de0405d463218b86434c2c2e6861f8fa-large.jpg",
  "https://images.pixieset.com/821255111/f2d121665486d77a7ab3b226921254fb-large.jpg",
  "https://images.pixieset.com/821255111/987e6ce32b37bc16626624495bdc8865-large.jpg",
  "https://images.pixieset.com/821255111/574ce72a98e27b772088134390a78de4-large.jpg",
]

const scatteredImageUrls = [
  "https://images.pixieset.com/821255111/1efbc1814417c9e3455fdf38e8509a14-large.jpg",
  "https://images.pixieset.com/821255111/17617b846454f5f264d489b2eded72bf-large.jpg",
  "https://images.pixieset.com/821255111/195568d10a8ef49a1684257859a246c3-large.jpg",
  "https://images.pixieset.com/821255111/4b518a93f67a7f77ec8ed11f751eb377-large.jpg",
  "https://images.pixieset.com/821255111/8d53b01ff38315ebba4bf7a56bb21bfd-large.jpg",
  "https://images.pixieset.com/821255111/a208cab9f4daab1037decf890c3465d7-large.jpg",
]

const scattered = [
  { left: "7%",  top: "15%", rot: -12, w: "clamp(50px,5vw,85px)" },
  { left: "88%", top: "10%", rot: 8,   w: "clamp(45px,4vw,75px)" },
  { left: "5%",  top: "65%", rot: 14,  w: "clamp(55px,6vw,90px)" },
  { left: "86%", top: "72%", rot: -7,  w: "clamp(50px,5vw,80px)" },
  { left: "50%", top: "5%",  rot: 20,  w: "clamp(40px,4vw,65px)" },
  { left: "50%", top: "88%", rot: -15, w: "clamp(45px,4vw,70px)" },
]

const tunnelImages = [
  { url: "https://images.pixieset.com/821255111/23343af97171ca32f954ecb01edb321f-large.jpg", side: "left",  z: 0     },
  { url: "https://images.pixieset.com/821255111/1b972055fec2eeebca80f014111dd0b8-large.jpg", side: "right", z: 0     },
  { url: "https://images.pixieset.com/821255111/36886c2bed475cbe95ae792f5c542324-large.jpg", side: "left",  z: -550  },
  { url: "https://images.pixieset.com/821255111/4ca6e56aea63422e0caa3d67dbd22462-large.jpg", side: "right", z: -550  },
  { url: "https://images.pixieset.com/821255111/7db378917e54e197999c4edd8a7bea19-large.jpg", side: "left",  z: -1100 },
  { url: "https://images.pixieset.com/821255111/91e7a8de3d7234a737043d22f1b2b9fb-large.jpg", side: "right", z: -1100 },
  { url: "https://images.pixieset.com/821255111/4b026172c5c67ad9141dcfeb5ad9934d-large.jpg", side: "left",  z: -1650 },
  { url: "https://images.pixieset.com/821255111/bcce011fbdcf84835089540e5e9c4cfb-large.jpg", side: "right", z: -1650 },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroTunnel() {
  const containerRef       = useRef<HTMLDivElement>(null)
  const headlineWrapRef    = useRef<HTMLDivElement>(null)
  const ringImgRefs        = useRef<(HTMLDivElement | null)[]>([])
  const scatterRef         = useRef<HTMLDivElement>(null)
  const tunnelRef          = useRef<HTMLDivElement>(null)
  const tunnelContainerRef = useRef<HTMLDivElement>(null)
  const tunnelTextRef      = useRef<HTMLDivElement>(null)
  const wordRef            = useRef<HTMLSpanElement>(null)
  const underlineRef       = useRef<HTMLSpanElement>(null)
  const ctaRef             = useRef<HTMLDivElement>(null)

  const [wordIndex, setWordIndex] = useState(0)
  const wordIndexRef = useRef(0)

  // ── Word cycling ────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (!wordRef.current) return

      // Fade out
      gsap.to(wordRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          // Swap word
          wordIndexRef.current = (wordIndexRef.current + 1) % CYCLING_WORDS.length
          setWordIndex(wordIndexRef.current)

          // Fade in from below
          gsap.fromTo(
            wordRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
          )
        },
      })
    }, 2400)

    return () => clearInterval(interval)
  }, [])

  // ── Main GSAP context ───────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768

      // ── CTA stagger in ──────────────────────────────────────────────
      if (ctaRef.current) {
        const ctaItems = ctaRef.current.children
        gsap.fromTo(
          ctaItems,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", delay: 0.6 }
        )
      }

      // ── Underline draw ──────────────────────────────────────────────
      if (underlineRef.current) {
        gsap.fromTo(
          underlineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: 1.1,
            onComplete: () => {
              gsap.to(underlineRef.current, {
                opacity: 0.5,
                duration: 0.9,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              })
            },
          }
        )
      }

      // ── Image entry animation ────────────────────────────────────────
      const allImgRefs = isMobile
        ? ringImgRefs.current.slice(0, 6).filter(Boolean)
        : ringImgRefs.current.filter(Boolean)

      gsap.fromTo(
        allImgRefs,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, stagger: 0.08, duration: 0.7, ease: "power2.out", delay: 0.3 }
      )

      // ── Idle drift ───────────────────────────────────────────────────
      allImgRefs.forEach((img, i) => {
        gsap.to(img, {
          y: "+=12",
          duration: 4 + i * 0.3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        })
      })

      // ── Tunnel hidden initially ──────────────────────────────────────
      if (tunnelRef.current) {
        gsap.set(tunnelRef.current, { opacity: 0 })
      }

      // ── Scroll phase (desktop only) ──────────────────────────────────
      if (isMobile) return

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 3}`,
        pin: true,
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress

          // Ring images fly toward camera (p 0→0.4) + motion blur
          ringImgRefs.current.forEach((imgRef) => {
            if (!imgRef) return
            const ringP = Math.min(p / 0.4, 1)
            gsap.set(imgRef, {
              scale: 1 + ringP * 3.5,
              opacity: 1 - ringP,
              filter: `blur(${ringP * 5}px)`,
            })
          })

          // Scattered images fade (p 0.1→0.5)
          if (scatterRef.current) {
            const scatP = gsap.utils.clamp(0, 1, (p - 0.1) / 0.4)
            gsap.set(scatterRef.current, { opacity: 1 - scatP })
          }

          // Headline: shrink + light blur during zoom phase (p 0→0.4)
          // then main fade (p 0.35→0.55) — both coexist
          if (headlineWrapRef.current) {
            const zoomP = Math.min(p / 0.4, 1)
            const headP = gsap.utils.clamp(0, 1, (p - 0.35) / 0.2)
            // Zoom phase softens opacity slightly; main fade completes the fade
            const opacity = (1 - zoomP * 0.3) * (1 - headP)
            gsap.set(headlineWrapRef.current, {
              scale: 1 - zoomP * 0.12,
              filter: `blur(${zoomP * 3}px)`,
              opacity,
            })
          }

          // Tunnel fade in (p 0.35→0.5)
          if (tunnelRef.current) {
            const tunnelFadeP = gsap.utils.clamp(0, 1, (p - 0.35) / 0.15)
            gsap.set(tunnelRef.current, { opacity: tunnelFadeP })
          }

          // Camera travel through tunnel (p 0.4→1.0)
          if (tunnelContainerRef.current) {
            const tunnelP = gsap.utils.clamp(0, 1, (p - 0.4) / 0.6)
            gsap.set(tunnelContainerRef.current, { z: tunnelP * 1500 })
          }

          // Tunnel text overlay — fade in (p 0.4→0.5), exit upper-left (p 0.88→1.0)
          if (tunnelTextRef.current) {
            const fadeIn = gsap.utils.clamp(0, 1, (p - 0.4) / 0.1)
            const exitP  = gsap.utils.clamp(0, 1, (p - 0.88) / 0.12)
            const opacity = fadeIn * (1 - exitP * 0.7)
            gsap.set(tunnelTextRef.current, {
              opacity,
              x: exitP * -180,
              y: exitP * -120,
              scale: 1 - exitP * 0.35,
            })
          }
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#0A0A0A" }}
    >
      {/* ── Orbital ring images ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
        }}
      >
        {ringImageUrls.map((url, i) => {
          const angle = i * 45 // 0, 45, 90, … 315
          const R = "clamp(200px, 26vw, 340px)"
          return (
            <div
              key={`ring-${i}`}
              ref={(el) => { ringImgRefs.current[i] = el }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "clamp(80px, 8vw, 140px)",
                transform: `rotate(${angle}deg) translateX(${R}) translateY(-50%)`,
                willChange: "transform, opacity",
                opacity: 0,
              }}
            >
              <Image
                src={url}
                alt=""
                width={800}
                height={533}
                style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", transform: `rotate(-${angle}deg)`, borderRadius: "6px" }}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          )
        })}
      </div>

      {/* ── Scattered background images ─────────────────────────────────── */}
      <div
        ref={scatterRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        className="hidden md:block"
      >
        {scattered.map((pos, i) => (
          <div
            key={`scat-${i}`}
            ref={(el) => { ringImgRefs.current[8 + i] = el }}
            style={{
              position: "absolute",
              left: pos.left,
              top: pos.top,
              width: pos.w,
              borderRadius: "6px",
              overflow: "hidden",
              transform: `rotate(${pos.rot}deg)`,
              willChange: "transform, opacity",
              opacity: 0,
            }}
          >
            <Image
              src={scatteredImageUrls[i]}
              alt=""
              width={800}
              height={533}
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* ── Headline content ─────────────────────────────────────────────── */}
      <div
        ref={headlineWrapRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 10,
          padding: "0 1.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: '"coolvetica", sans-serif',
            fontSize: "clamp(3.5rem, 9vw, 8rem)",
            lineHeight: 1.05,
            color: "#ffffff",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          Capture The{" "}
          <span
            ref={wordRef}
            style={{
              color: "var(--ac-accent)",
              fontStyle: "italic",
              display: "inline-block",
            }}
          >
            {CYCLING_WORDS[wordIndex]}
          </span>
        </h1>

        <p className="text-xs tracking-[0.3em] text-[#A0A0A0] uppercase mt-4">
          A.C Media - Athlete Photography
        </p>

        <div
          ref={ctaRef}
          style={{
            display: "flex",
            gap: "1.25rem",
            marginTop: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            asChild
            variant="outline"
            style={{ opacity: 0 }}
            className="rounded-lg border-white/70 bg-white/12 text-white hover:bg-white/20 hover:border-white px-6 py-2.5 text-sm tracking-wide transition-all duration-300"
          >
            <Link href="/work">See the work</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            style={{ opacity: 0 }}
            className="relative rounded-lg border-[var(--ac-accent-mid)] bg-[color-mix(in_srgb,var(--ac-accent)_15%,transparent)] text-[var(--ac-accent-mid)] hover:bg-[color-mix(in_srgb,var(--ac-accent)_30%,transparent)] hover:border-[var(--ac-accent-hover)] hover:text-white px-6 py-2.5 text-sm tracking-wide transition-all duration-300"
          >
            <Link href="/contact">
              {"Book Now"}
              <span
                ref={underlineRef}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "1px",
                  background: "var(--ac-accent)",
                  width: "100%",
                  transformOrigin: "left",
                  transform: "scaleX(0)",
                }}
              />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Tunnel (Phase B) ─────────────────────────────────────────────── */}
      <div
        ref={tunnelRef}
        style={{
          position: "absolute",
          inset: 0,
          perspective: "800px",
          perspectiveOrigin: "50% 50%",
          pointerEvents: "none",
        }}
      >
        <div
          ref={tunnelContainerRef}
          style={{
            transformStyle: "preserve-3d",
            position: "absolute",
            inset: 0,
          }}
        >
          {/* Left + right wall image panels */}
          {tunnelImages.map((img, i) => {
            const isLeft = img.side === "left"
            return (
              <div
                key={`tunnel-${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  ...(isLeft ? { left: "-5%" } : { right: "-5%" }),
                  width: "60%",
                  transform: `rotateY(${isLeft ? 65 : -65}deg) translateZ(${img.z}px)`,
                  transformOrigin: isLeft ? "left center" : "right center",
                  transformStyle: "preserve-3d",
                  overflow: "hidden",
                  filter: "brightness(0.5) contrast(1.15)",
                }}
              >
                <Image
                  src={img.url}
                  alt=""
                  width={1200}
                  height={800}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            )
          })}

          {/* Top arch panel — gives the "inside a curved corridor" ceiling */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(to bottom, #050505 0%, rgba(10,10,10,0.7) 100%)",
              transform: "rotateX(-72deg)",
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
            }}
          />

          {/* Bottom arch panel */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(to top, #050505 0%, rgba(10,10,10,0.7) 100%)",
              transform: "rotateX(72deg)",
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
            }}
          />

          {/* Vanishing-point teal glow at tunnel end */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "500px",
              height: "500px",
              transform: "translateX(-50%) translateY(-50%) translateZ(-1800px)",
              background: "radial-gradient(ellipse, rgba(58,142,138,0.22) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Vignette + edge darken for curved wall feel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 70% at 50% 50%, transparent 20%, rgba(5,5,5,0.7) 80%, rgba(5,5,5,0.97) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Tunnel text overlay — transition phrase between hero and Who We Are */}
        <div
          ref={tunnelTextRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            zIndex: 30,
            pointerEvents: "none",
            textAlign: "center",
            padding: "0 2rem",
          }}
        >
          <p style={{
            color: "#A0A0A0",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}>
            Who We Are
          </p>
          <p style={{
            fontFamily: '"coolvetica", sans-serif',
            fontSize: "clamp(3rem, 7vw, 6rem)",
            color: "#F0EDE8",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Built for<br />athletes.
          </p>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 10,
        }}
      >
        <motion.span
          style={{ fontSize: "10px", color: "#A0A0A0", letterSpacing: "0.3em", textTransform: "uppercase" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll
        </motion.span>
        <motion.div
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "2.5rem",
            background: "linear-gradient(to bottom, #A0A0A0, transparent)",
            transformOrigin: "top",
          }}
        />
      </div>
    </section>
  )
}
