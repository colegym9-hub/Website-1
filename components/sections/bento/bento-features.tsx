"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Camera, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { BentoTiltCard } from "./bento-tilt-card"
import { BentoProgressRing } from "./bento-progress-ring"

const springIn = {
  hidden: { opacity: 0, y: 48, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
}

const cardShell =
  "relative h-full min-h-[140px] overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0a0a0a]/80 shadow-[inset_1px_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[inset_1px_1px_0_rgba(255,255,255,0.1),0_20px_56px_rgba(0,0,0,0.55)]"

function LavaLampMesh() {
  return (
    <motion.div
      className="absolute inset-0 opacity-90"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 50%", "100% 0%", "0% 0%"],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundSize: "200% 200%",
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(212, 255, 77, 0.35), transparent 55%),
          radial-gradient(ellipse 70% 50% at 80% 70%, rgba(255, 105, 180, 0.28), transparent 50%),
          radial-gradient(ellipse 60% 80% at 50% 50%, rgba(141, 182, 187, 0.25), transparent 55%),
          radial-gradient(circle at 60% 20%, rgba(34, 197, 94, 0.2), transparent 40%)
        `,
      }}
    />
  )
}

function ScrollMaskedHeadline({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15%" })
  const words = text.split(" ")

  return (
    <div ref={ref} className="flex flex-wrap gap-x-2 gap-y-1">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block font-heading text-2xl tracking-tight text-white md:text-3xl"
            initial={{ y: "100%" }}
            animate={inView ? { y: 0 } : { y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              delay: i * 0.045,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

export default function BentoFeatures() {
  return (
    <section className="relative border-t border-[var(--ac-divider)] bg-[var(--ac-bg)] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="mb-10 md:mb-14"
        >
          <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-[var(--ac-accent-mid)]">
            How it feels
          </p>
          <h2 className="max-w-2xl font-heading text-4xl tracking-tight text-white md:text-5xl">
            Production-level shoots, built like a product.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 md:auto-rows-[minmax(160px,auto)]"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%", amount: 0.15 }}
        >
          {/* 1 — Lava lamp (8×2) */}
          <motion.div variants={springIn} className="md:col-span-8 md:row-span-2">
            <BentoTiltCard className="h-full min-h-[280px] md:min-h-[320px]">
              <div className={cn(cardShell, "flex h-full flex-col justify-end p-6 md:p-8")}>
                <LavaLampMesh />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="relative z-10">
                  <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-white/60 uppercase">
                    Atmosphere
                  </p>
                  <h3 className="font-heading text-2xl tracking-tight text-white md:text-3xl">
                    Lights, haze, and direction that read on camera.
                  </h3>
                </div>
              </div>
            </BentoTiltCard>
          </motion.div>

          {/* 2 — Progress ring (4×1) */}
          <motion.div variants={springIn} className="md:col-span-4">
            <BentoTiltCard className="h-full">
              <div
                className={cn(
                  cardShell,
                  "flex h-full min-h-[160px] flex-col items-center justify-center p-6 text-white"
                )}
              >
                <BentoProgressRing label="Session flow" />
                <p className="mt-4 max-w-[200px] text-center text-sm leading-snug text-white/55">
                  Structured run-of-show so nobody stands around guessing what&apos;s next.
                </p>
              </div>
            </BentoTiltCard>
          </motion.div>

          {/* 3 — Floating icon (4×1) */}
          <motion.div variants={springIn} className="md:col-span-4">
            <BentoTiltCard className="h-full">
              <div
                className={cn(
                  cardShell,
                  "flex h-full min-h-[160px] flex-col items-center justify-center gap-3 p-6"
                )}
              >
                <motion.div
                  className="flex size-16 items-center justify-center rounded-2xl bg-white/[0.06] text-[var(--ac-accent-mid)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Camera className="size-8" aria-hidden />
                </motion.div>
                <p className="text-center font-heading text-lg tracking-tight text-white">
                  Shot with intent
                </p>
                <p className="max-w-[220px] text-center text-sm text-white/50">
                  Every frame is composed. Not sprayed.
                </p>
              </div>
            </BentoTiltCard>
          </motion.div>

          {/* 4 — Text reveal (5×1) */}
          <motion.div variants={springIn} className="md:col-span-5">
            <BentoTiltCard className="h-full">
              <div className={cn(cardShell, "flex h-full min-h-[180px] flex-col justify-center p-6 md:p-8")}>
                <ScrollMaskedHeadline text="The season ends the image stays" />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
                  Built for athletes who want something they still open years from now.
                </p>
              </div>
            </BentoTiltCard>
          </motion.div>

          {/* 5 — High-contrast / mesh accent (4×1) */}
          <motion.div variants={springIn} className="md:col-span-4">
            <BentoTiltCard className="h-full">
              <div
                className={cn(
                  cardShell,
                  "flex h-full min-h-[180px] flex-col justify-between bg-white p-6 text-[#0a0a0a] md:p-8"
                )}
                style={{
                  boxShadow:
                    "inset 1px 1px 0 rgba(255,255,255,0.9), 0 16px 48px rgba(0,0,0,0.12)",
                }}
              >
                <Sparkles className="size-7 text-[#346e73]" aria-hidden />
                <div>
                  <h3 className="font-heading text-xl tracking-tight md:text-2xl">Media days &amp; sportraits</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Team days with energy. Individual frames with edge.
                  </p>
                </div>
              </div>
            </BentoTiltCard>
          </motion.div>

          {/* 6 — Teal glass strip (3×1) */}
          <motion.div variants={springIn} className="md:col-span-3">
            <BentoTiltCard className="h-full">
              <div
                className={cn(
                  cardShell,
                  "flex h-full min-h-[180px] flex-col justify-center gap-2 bg-[color-mix(in_srgb,var(--ac-accent)_22%,#0a0a0a)] p-5"
                )}
              >
                <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-[var(--ac-accent-light)] uppercase">
                  Book
                </p>
                <p className="font-heading text-lg leading-snug tracking-tight text-white">
                  Ready when you are.
                </p>
                <a
                  href="/book"
                  className="mt-2 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-white/20"
                >
                  Start →
                </a>
              </div>
            </BentoTiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
