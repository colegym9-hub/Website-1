"use client"

import * as THREE from "three"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, extend } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { easing, geometry } from "maath"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRouter } from "next/navigation"
import NextImage from "next/image"

gsap.registerPlugin(ScrollTrigger)

// Extend R3F with maath's RoundedPlane geometry for rounded frame corners
extend({ RoundedPlaneGeometry: geometry.RoundedPlaneGeometry })

declare module "@react-three/fiber" {
  interface ThreeElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roundedPlaneGeometry: any
  }
}

// ─── Proxy Pixieset images through Next.js optimizer (solves CORS in WebGL) ──

const proxy = (url: string) =>
  `/api/image-proxy?url=${encodeURIComponent(url)}`

// ─── Data ─────────────────────────────────────────────────────────────────────

const FRAME_W = 2.2
const FRAME_H = 3.5
const CORNER_R = 0.14

const FRAMES = [
  {
    id: "sportraits",
    label: "Sportraits",
    img: proxy(
      "https://images.pixieset.com/821255111/17617b846454f5f264d489b2eded72bf-large.jpg"
    ),
    position: [-5.5, 0, 0] as [number, number, number],
    rotY: 12 * (Math.PI / 180),
  },
  {
    id: "media-day",
    label: "Media Day",
    img: proxy(
      "https://images.pixieset.com/821255111/987e6ce32b37bc16626624495bdc8865-large.jpg"
    ),
    position: [0, 0, 0] as [number, number, number],
    rotY: 0,
  },
  {
    id: "senior-portraits",
    label: "Senior Portraits",
    img: proxy(
      "https://images.pixieset.com/821255111/91e7a8de3d7234a737043d22f1b2b9fb-large.jpg"
    ),
    position: [5.5, 0, 0] as [number, number, number],
    rotY: -12 * (Math.PI / 180),
  },
]

const TESTIMONIALS = [
  {
    quote:
      "He perfectly captures individuals' personalities with such a unique style that is different from your average photographer.",
    name: "Mackenzie Chamberlain",
    detail: "Senior Portrait · Class of 2025",
    photo:
      "https://images.pixieset.com/821255111/aebf37f2c2ea8d62e25d6eb7ea4b4f9c-large.jpg",
  },
  {
    quote:
      "The pics were so sick and unlike any dance pics I've gotten done before. He was open to all ideas.",
    name: "Lilley Watkins",
    detail: "Dance · EGC Studio",
    photo:
      "https://images.pixieset.com/821255111/50f7dcb6be5720de40032d5ef245e121-large.jpg",
  },
  {
    quote:
      "I was not expecting it to be that cool without any editing. It was the best photoshoot I've ever done.",
    name: "McKenna Patton",
    detail: "Dance · EGC Studio",
    photo:
      "https://images.pixieset.com/821255111/6048794ab61949f57627c339447fcaec-large.jpg",
  },
  {
    quote:
      "AC is the premier photographer in the area and he won't let you down. Great results. Great process. Great experience.",
    name: "Jack Nolan",
    detail: "Senior Portrait · Baseball",
    photo:
      "https://images.pixieset.com/821255111/91e7a8de3d7234a737043d22f1b2b9fb-large.jpg",
  },
  {
    quote:
      "It's 100% worth it. He puts in quality work and will deliver the best quality he possibly can for you.",
    name: "Skyler Hughes",
    detail: "Gymnastics Sportraits",
    photo:
      "https://images.pixieset.com/821255111/a208cab9f4daab1037decf890c3465d7-large.jpg",
  },
  {
    quote:
      "You can clearly see AC took his time on every photo and took pride in every aspect of editing the photos.",
    name: "Dom Weed",
    detail: "Baseball Sportraits",
    photo:
      "https://images.pixieset.com/821255111/f2d121665486d77a7ab3b226921254fb-large.jpg",
  },
]

// ─── Three.js: Portal frame with rounded corners + glass look ─────────────────

type FrameData = (typeof FRAMES)[number]

function PortalFrame({
  frame,
  onClick,
}: {
  frame: FrameData
  onClick: () => void
}) {
  const texture = useTexture(frame.img)
  const displayTexture = useMemo(() => {
    const nextTexture = texture.clone()
    const img = texture.image as { width?: number; height?: number } | undefined
    if (!img?.width || !img?.height) return nextTexture

    const imgAspect = img.width / img.height
    const frameAspect = FRAME_W / FRAME_H

    if (imgAspect > frameAspect) {
      const scale = frameAspect / imgAspect
      nextTexture.repeat.set(scale, 1)
      nextTexture.offset.set((1 - scale) / 2, 0)
    } else {
      const scale = imgAspect / frameAspect
      nextTexture.repeat.set(1, scale)
      nextTexture.offset.set(0, (1 - scale) / 2)
    }

    nextTexture.needsUpdate = true
    return nextTexture
  }, [texture])
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef<THREE.Mesh>(null!)
  const glassTopRef = useRef<THREE.Mesh>(null!)

  useEffect(() => {
    return () => {
      displayTexture.dispose()
    }
  }, [displayTexture])

  useFrame((_, delta) => {
    // Teal glow pulses on hover
    const glowMat = glowRef.current?.material
    if (glowMat instanceof THREE.MeshBasicMaterial) {
      easing.damp(glowMat, "opacity", hovered ? 0.6 : 0.2, 0.3, delta)
    }
    // Glass top highlight shimmers
    const topMat = glassTopRef.current?.material
    if (topMat instanceof THREE.MeshBasicMaterial) {
      easing.damp(topMat, "opacity", hovered ? 0.25 : 0.14, 0.3, delta)
    }
  })

  return (
    <group
      position={frame.position}
      rotation={[0, frame.rotY, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ""
      }}
    >
      {/* ── Layer 1: Teal glow halo (furthest back) ── */}
      <mesh ref={glowRef} position={[0, 0, -0.06]}>
        <roundedPlaneGeometry args={[FRAME_W + 0.5, FRAME_H + 0.5, CORNER_R + 0.04]} />
        <meshBasicMaterial
          color="#3e6466"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Layer 2: Dark glass backing (Apple glass depth effect) ── */}
      <mesh position={[0, 0, -0.025]}>
        <roundedPlaneGeometry args={[FRAME_W + 0.12, FRAME_H + 0.12, CORNER_R + 0.02]} />
        <meshBasicMaterial
          color="#080808"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Layer 3: Photo (rounded, cover-fitted) ── */}
      <mesh>
        <roundedPlaneGeometry args={[FRAME_W, FRAME_H, CORNER_R]} />
        <meshBasicMaterial map={displayTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Layer 4: Bottom gradient for label legibility ── */}
      <mesh position={[0, -(FRAME_H / 2 - FRAME_H * 0.18), 0.008]}>
        <roundedPlaneGeometry
          args={[FRAME_W, FRAME_H * 0.37, CORNER_R * 0.4]}
        />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.78}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Layer 5: Apple glass — top specular highlight strip ── */}
      <mesh ref={glassTopRef} position={[0, FRAME_H * 0.42, 0.012]}>
        <roundedPlaneGeometry args={[FRAME_W - 0.08, FRAME_H * 0.06, 0.04]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.14}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── Layer 6: Thin bright border ring (glass edge) ── */}
      <mesh position={[0, 0, -0.005]}>
        <roundedPlaneGeometry args={[FRAME_W + 0.03, FRAME_H + 0.03, CORNER_R + 0.01]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── Three.js: Floating dust particles ────────────────────────────────────────

function Particles({ count = 320 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const randomAt = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (randomAt(i * 3 + 1) - 0.5) * 44
      arr[i * 3 + 1] = (randomAt(i * 3 + 2) - 0.5) * 22
      arr[i * 3 + 2] = randomAt(i * 3 + 3) * -52 + 13
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.012
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#F0EDE8"
        transparent
        opacity={0.16}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Three.js: Scroll-driven camera ───────────────────────────────────────────

function CameraRig({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const camTarget = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const p = progressRef.current
    const tx = 0
    let ty = 0
    let tz = 0
    const lx = 0
    let ly = 0
    let lz = 0

    if (p < 0.55) {
      const t = p / 0.55
      ty = 1.2 - t * 0.7
      tz = 10 - t * 7.5
    } else if (p < 0.70) {
      const t = (p - 0.55) / 0.15
      ty = 0.5 - t * 0.5
      tz = 2.5 - t * 4.5
      lz = -5
    } else if (p < 0.90) {
      tz = -4
      lz = -9
    } else {
      // Tilt down to reveal footer
      const t = (p - 0.90) / 0.10
      ty = -t * 0.9
      tz = -4 + t * 0.8
      ly = -2.5 * t
      lz = -10
    }

    easing.damp3(state.camera.position, [tx, ty, tz], 0.12, delta)
    easing.damp3(camTarget.current, [lx, ly, lz], 0.12, delta)
    state.camera.lookAt(camTarget.current)
  })

  return null
}

// ─── Three.js: Full scene ─────────────────────────────────────────────────────

function Scene({
  progressRef,
  onFrameClick,
}: {
  progressRef: React.MutableRefObject<number>
  onFrameClick: (id: string) => void
}) {
  return (
    <>
      <color attach="background" args={["#0A0A0A"]} />
      <ambientLight intensity={0.65} />
      <spotLight position={[0, 10, 6]} intensity={1.8} color="#ffffff" />
      <pointLight position={[0, 0, 4]} intensity={0.9} color="#8abcbf" />
      <Particles />
      <Suspense fallback={null}>
        {FRAMES.map((frame) => (
          <PortalFrame
            key={frame.id}
            frame={frame}
            onClick={() => onFrameClick(frame.id)}
          />
        ))}
      </Suspense>
      <CameraRig progressRef={progressRef} />
    </>
  )
}

// ─── HTML: Testimonial card (glass style) ─────────────────────────────────────

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        borderRadius: "14px",
        overflow: "hidden",
        background: "rgba(15, 15, 15, 0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Photo */}
      <div
        style={{
          position: "relative",
          width: "130px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <NextImage
          src={t.photo}
          alt={t.name}
          fill
          sizes="130px"
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* Quote */}
      <div
        style={{
          flex: 1,
          padding: "24px 22px 20px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "160px",
        }}
      >
        <p
          style={{
            color: "#F0EDE8",
            fontSize: "clamp(0.82rem, 1.5vw, 0.95rem)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          &ldquo;{t.quote}&rdquo;
        </p>
        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p style={{ color: "#F0EDE8", fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
            {t.name}
          </p>
          <p
            style={{
              color: "#A0A0A0",
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginTop: "3px",
            }}
          >
            {t.detail}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function ServicePortals() {
  const router = useRouter()
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const testimonialHeaderRef = useRef<HTMLDivElement>(null)
  const testimonialsGroupRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const showTestimonialsRef = useRef(false)
  const [showTestimonials, setShowTestimonials] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${window.innerHeight * 5}`,
        pin: true,
        scrub: 1.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress

          // Fade section header out as scroll starts (0 → 0.12)
          if (headerRef.current) {
            gsap.set(headerRef.current, {
              opacity: 1 - Math.min(1, self.progress / 0.12),
            })
          }

          // Toggle testimonials visibility when camera parks
          const shouldShow = self.progress >= 0.70
          if (shouldShow !== showTestimonialsRef.current) {
            showTestimonialsRef.current = shouldShow
            setShowTestimonials(shouldShow)
          }

          // Drive testimonials scrolling up from bottom of viewport (progress 0.70 → 0.90)
          if (testimonialsGroupRef.current) {
            const sf = Math.max(0, Math.min(1, (self.progress - 0.70) / 0.20))
            // Group starts at bottom of viewport (innerHeight), scrolls up past top
            const groupHeight = 6 * 220 + 5 * 24 // estimated total height
            const y = window.innerHeight - sf * (window.innerHeight + groupHeight + 120)
            gsap.set(testimonialsGroupRef.current, { y })
          }

          // Fade testimonial header in
          if (testimonialHeaderRef.current) {
            const fadeIn = Math.max(0, Math.min(1, (self.progress - 0.68) / 0.06))
            const fadeOut = self.progress > 0.90 ? Math.max(0, 1 - (self.progress - 0.90) / 0.05) : 1
            gsap.set(testimonialHeaderRef.current, { opacity: fadeIn * fadeOut })
          }
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: "100vh", background: "#0A0A0A", position: "relative" }}
    >
      {/* ── Three.js canvas (fullscreen) ─────────────────────────────────── */}
      <Canvas
        camera={{ fov: 75, position: [0, 1.2, 10] }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ position: "absolute", inset: 0 }}
        onCreated={({ gl }) => {
          // Force canvas to fill viewport on initialization
          gl.setSize(window.innerWidth, window.innerHeight)
        }}
      >
        <Scene
          progressRef={progressRef}
          onFrameClick={(id) => router.push(`/contact?service=${id}`)}
        />
      </Canvas>

      {/* ── Section header overlay (fades out on scroll) ─────────────────── */}
      <div
        ref={headerRef}
        style={{
          position: "absolute",
          top: "76px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
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

      {/* ── Testimonials: header + cards scroll up over 3D space ────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: showTestimonials ? "auto" : "none",
          overflow: "hidden",
        }}
      >
        {/* "What clients say" header — pinned at top when testimonials visible */}
        <div
          ref={testimonialHeaderRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "clamp(28px,3.5vh,52px) clamp(24px,5vw,52px) clamp(12px,1.5vh,20px)",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              color: "#A0A0A0",
              fontSize: "0.68rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            What clients say
          </p>
          <h2
            style={{
              fontFamily: '"coolvetica", sans-serif',
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "#F0EDE8",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Something they didn&apos;t expect.
          </h2>
        </div>

        {/* Cards — scroll vertically through viewport over the 3D background */}
        <div
          ref={testimonialsGroupRef}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            width: "min(92vw, 620px)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            willChange: "transform",
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* ── Scroll cue ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 10,
          pointerEvents: "none",
          opacity: showTestimonials ? 0 : 1,
          transition: "opacity 0.4s",
        }}
      >
        <span
          style={{
            color: "#A0A0A0",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            height: "32px",
            width: "1px",
            background: "linear-gradient(to bottom, #A0A0A0, transparent)",
          }}
        />
      </div>
    </section>
  )
}
