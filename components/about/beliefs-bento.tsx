"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  beliefBtsRaw,
  beliefMediaDayHero,
  beliefStrydsCollage,
  profileAsset,
  type AboutPhoto,
} from "@/lib/about-media"

export type Belief = {
  label: string
  title: string
  body: string
}

const beliefThumbs: AboutPhoto[] = [
  beliefMediaDayHero,
  beliefBtsRaw,
  { src: profileAsset.src, alt: profileAsset.alt },
  {
    src: "https://images.pixieset.com/821255111/f90197961ae8821222210e2ef146d71e-large.jpg",
    alt: "Athlete portrait, media day lighting",
  },
]

const pillMesh: [string, string][] = [
  ["#2d4a4c", "#8abcbf"],
  ["#3a3028", "#6b9ea0"],
  ["#1e2e2c", "#5a8a8c"],
  ["#252525", "#8abcbf"],
]

const collageLayout = [
  { i: 0, className: "left-[0%] top-[8%] z-10 w-[32%] -rotate-[9deg]" },
  { i: 1, className: "right-[4%] top-[0%] z-20 w-[34%] rotate-[7deg]" },
  { i: 2, className: "left-[18%] bottom-[4%] z-30 w-[38%] rotate-[4deg]" },
  { i: 3, className: "left-[38%] top-[18%] z-40 w-[36%] -rotate-[3deg]" },
  { i: 4, className: "right-[0%] bottom-[10%] z-50 w-[34%] -rotate-[6deg]" },
]

function FloatingRing({ className, progress }: { className?: string; progress: number }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full border border-white/[0.08] ${className ?? ""}`}
      style={{
        background: `conic-gradient(from 210deg, var(--ac-accent-mid) ${progress * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
        WebkitMask:
          "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
      }}
      aria-hidden
    />
  )
}

const shellClass =
  "overflow-hidden rounded-[2.5rem] border border-white/20 bg-[#0f0f0f]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] md:p-10"

const megaShellClass =
  "overflow-hidden rounded-[2.5rem] border border-white/20 bg-[#0f0f0f]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] md:p-10 lg:p-14"

type MotionMode = "inView" | "static"

/** “Built around the athlete” + four mesh pills (pinned stack slide). */
export function BeliefsBentoPartA({
  beliefs,
  motionMode = "inView",
  unstyled = false,
}: {
  beliefs: Belief[]
  motionMode?: MotionMode
  /** When true, no outer card shell (e.g. inside combined {@link BeliefsBento}). */
  unstyled?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const staticMotion = motionMode === "static" || reduceMotion

  const inner = (
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/45">
            What we believe
          </p>
          <h2
            className="font-heading text-white"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Built around the athlete.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/55 md:text-lg">
            Four principles that shape every shoot. Lighting, direction, and the room we hold on
            set. Nothing decorative; just how we work.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 lg:col-span-7">
          {beliefs.map((b, idx) => {
            const [c0, c1] = pillMesh[idx % pillMesh.length]!
            const thumb = beliefThumbs[idx] ?? beliefMediaDayHero
            return (
              <motion.article
                key={b.label}
                initial={staticMotion ? false : { opacity: 0, y: 18 }}
                whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={staticMotion ? undefined : { once: true, margin: "-8%" }}
                animate={staticMotion ? { opacity: 1, y: 0 } : undefined}
                transition={{ type: "spring", stiffness: 320, damping: 28, delay: idx * 0.05 }}
                whileHover={
                  staticMotion
                    ? undefined
                    : { rotateX: 2, rotateY: -2, transition: { type: "spring", stiffness: 400, damping: 22 } }
                }
                style={{ transformPerspective: 900 }}
                className="relative flex min-h-[4.25rem] items-center gap-4 overflow-hidden rounded-full border border-white/[0.06] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:min-h-[4.75rem] md:gap-5 md:px-5 md:py-3.5"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-95"
                  style={{
                    background: `linear-gradient(125deg, ${c0} 0%, ${c1} 55%, ${c0} 100%)`,
                  }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_20%_0%,rgba(255,255,255,0.12),transparent_50%)]" />
                <Avatar className="relative z-10 size-11 shrink-0 border border-white/20 shadow-md md:size-[3.25rem]">
                  <AvatarImage src={thumb.src} alt={thumb.alt} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-xs text-white/70">
                    {b.label.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="relative z-10 min-w-0 flex-1">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/80">
                    {b.label}
                  </p>
                  <p className="truncate font-heading text-base text-white md:text-lg">{b.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/75">{b.body}</p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
  )

  if (unstyled) return inner
  return <div className={shellClass}>{inner}</div>
}

/** “The image should last” + collage (pinned stack slide). */
export function BeliefsBentoPartB({
  beliefs,
  motionMode = "inView",
  unstyled = false,
}: {
  beliefs: Belief[]
  motionMode?: MotionMode
  unstyled?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const staticMotion = motionMode === "static" || reduceMotion

  const inner = (
      <div className="relative min-h-[240px] md:min-h-[300px] lg:min-h-[340px]">
        <div className="pointer-events-none absolute left-0 top-[10%] z-0 hidden md:block">
          <FloatingRing className="h-24 w-24 opacity-90" progress={62} />
          <FloatingRing className="absolute left-9 top-12 h-[4.5rem] w-[4.5rem] opacity-70" progress={38} />
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-center gap-3 lg:col-span-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/45">
              {beliefs[3]?.label ?? "The image"}
            </p>
            <p className="font-heading text-2xl text-white md:text-3xl">{beliefs[3]?.title}</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/55 md:text-base">
              {beliefs[3]?.body}
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg min-h-[200px] md:aspect-[5/4] md:max-w-xl lg:col-span-8 lg:mx-0 lg:max-w-none">
            {beliefStrydsCollage.map((photo, layoutIdx) => {
              const slot = collageLayout[layoutIdx]
              if (!slot) return null
              return (
                <motion.figure
                  key={photo.src}
                  className={`absolute overflow-hidden rounded-[20px] border border-white/20 bg-[#0f0f0f]/80 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:rounded-[24px] ${slot.className}`}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 768px) 45vw, 28vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </motion.figure>
              )
            })}
          </div>
        </div>
      </div>
  )

  if (unstyled) return inner
  return <div className={shellClass}>{inner}</div>
}

export function BeliefsBento({ beliefs }: { beliefs: Belief[] }) {
  return (
    <div className={megaShellClass}>
      <BeliefsBentoPartA beliefs={beliefs} unstyled />
      <div className="mt-10 border-t border-white/[0.06] pt-10 md:mt-12 md:pt-12">
        <BeliefsBentoPartB beliefs={beliefs} unstyled />
      </div>
    </div>
  )
}
