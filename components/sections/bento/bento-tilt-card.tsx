"use client"

import { useRef, useCallback, type ReactNode } from "react"
import { motion, useSpring, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const springConfig = { stiffness: 300, damping: 24, mass: 0.8 }

type BentoTiltCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode
  className?: string
}

export function BentoTiltCard({ children, className, ...props }: BentoTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, springConfig)
  const rotateY = useSpring(0, springConfig)

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      rotateY.set(px * 14)
      rotateX.set(-py * 14)
    },
    [rotateX, rotateY]
  )

  const onLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  return (
    <div className={cn("h-full", className)} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={{
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 18 },
        }}
        className="h-full will-change-transform"
        {...props}
      >
        {children}
      </motion.div>
    </div>
  )
}
