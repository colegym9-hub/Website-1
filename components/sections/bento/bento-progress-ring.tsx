"use client"

import { useId } from "react"
import { motion } from "framer-motion"

const SIZE = 112
const STROKE = 6
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

type BentoProgressRingProps = {
  label?: string
  className?: string
}

export function BentoProgressRing({ label = "Prep", className }: BentoProgressRingProps) {
  const gid = useId().replace(/:/g, "")
  const gradId = `bento-ring-grad-${gid}`
  return (
    <div className={className}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-white/10"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * 0.22 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4ff4d" />
            <stop offset="100%" stopColor="#8db6bb" />
          </linearGradient>
        </defs>
      </svg>
      <p className="mt-3 text-center text-xs font-medium tracking-[0.2em] text-white/70 uppercase">
        {label}
      </p>
    </div>
  )
}
