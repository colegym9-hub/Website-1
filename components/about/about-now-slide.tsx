"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import type { AboutPhoto } from "@/lib/about-media"

type Props = {
  headline: string
  paragraphs: string[]
  primaryPhoto: AboutPhoto
  secondaryPhoto: AboutPhoto
}

function TapePhoto({
  photo,
  className,
  priority,
}: {
  photo: AboutPhoto
  className?: string
  priority?: boolean
}) {
  return (
    <div
      className={`group relative ${className ?? ""}`}
      style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.45))" }}
    >
      <span
        className="pointer-events-none absolute -left-1 top-3 z-10 h-3 w-10 -rotate-[12deg] rounded-[1px] bg-white/[0.22] shadow-sm backdrop-blur-[2px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-0.5 top-8 z-10 h-3 w-9 rotate-[10deg] rounded-[1px] bg-white/[0.18] shadow-sm backdrop-blur-[2px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-6 -left-1 z-10 h-2.5 w-8 rotate-[8deg] rounded-[1px] bg-white/[0.2] backdrop-blur-[2px]"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[14px] border border-white/20 bg-[#0f0f0f]/80 md:rounded-[18px]">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={520}
          height={700}
          className="h-full w-full object-cover"
          unoptimized
          priority={priority}
        />
      </div>
    </div>
  )
}

export function AboutNowSlide({ headline, paragraphs, primaryPhoto, secondaryPhoto }: Props) {
  return (
    <div className="flex flex-col gap-8 px-5 py-6 md:gap-10 md:px-8 md:py-8">
      <h2
        className="max-w-[95%] font-heading uppercase tracking-[0.04em] text-white"
        style={{
          fontSize: "clamp(1.75rem, 4.2vw, 3.35rem)",
          lineHeight: 1.02,
          letterSpacing: "0.04em",
        }}
      >
        {headline}
      </h2>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="relative h-[240px] overflow-hidden lg:col-span-5 lg:h-[340px] lg:overflow-visible">
          {/* Secondary photo — top left, slower drift */}
          <motion.div
            className="absolute left-0 top-[4%] z-10 w-[48%] max-w-[180px] lg:w-[50%] lg:max-w-[200px]"
          >
            <TapePhoto photo={secondaryPhoto} />
          </motion.div>

          {/* Primary photo (circle) — bottom right, slightly different phase */}
          <motion.div
            className="absolute bottom-[4%] right-[2%] z-20 w-[50%] max-w-[185px] lg:w-[52%] lg:max-w-[210px]"
          >
            <TapePhoto photo={primaryPhoto} priority />
          </motion.div>
        </div>

        <div className="flex flex-col justify-center gap-5 lg:col-span-7">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[0.95rem] leading-[1.75] text-white/[0.78] md:text-lg md:leading-[1.8]"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
