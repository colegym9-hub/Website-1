"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"

export default function WhoWeAre() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15%" })

  return (
    <section
      ref={ref}
      className="relative bg-[#0A0A0A] py-32 md:py-48 px-6 md:px-10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[40fr_60fr] gap-16 md:gap-24 items-start">

          {/* Left — stat */}
          <motion.div
            initial={{ opacity: 0, y: 60, skewY: 3 }}
            animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
            className="flex flex-col"
          >
            <p
              className="font-heading text-[#F0EDE8] leading-none"
              style={{
                fontSize: "clamp(5rem,13vw,9rem)",
                letterSpacing: "-0.04em",
              }}
            >
              70+
            </p>
            <p className="text-[#A0A0A0] text-xs tracking-[0.3em] uppercase mt-3">
              Media days led
            </p>
          </motion.div>

          {/* Right — copy */}
          <div className="flex flex-col justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40, skewY: 2 }}
              animate={inView ? { opacity: 1, y: 0, skewY: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.165, 0.84, 0.44, 1] }}
            >
              <p className="text-[#A0A0A0] text-xs tracking-[0.3em] uppercase mb-5">
                Who we are
              </p>
              <p className="text-[#F0EDE8] text-lg md:text-xl leading-relaxed">
                I&apos;m Cole Warner, the photographer and videographer behind A.C Media.
                I specialize in media days and sportraits. Bold, dramatic visuals
                that showcase athletes as they truly are.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
            >
              <p className="text-[#A0A0A0] text-base leading-relaxed">
                I started shooting games at my own high school. Over time I realized
                what I loved most was giving athletes something that would last beyond
                the season. Something they could look back on years later, maybe even
                show their kids one day. That&apos;s what drives me.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.165, 0.84, 0.44, 1] }}
            >
              <p className="text-[#A0A0A0] text-base leading-relaxed">
                Now I focus on media days and sportraits. Creative lighting. Dynamic
                compositions. Not just how athletes look in uniform. The intensity,
                the personality, the thing they bring to the game that nobody else has.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.58, ease: [0.165, 0.84, 0.44, 1] }}
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-3 text-sm text-[var(--ac-accent)] tracking-widest uppercase hover:text-[var(--ac-accent-mid)] transition-colors duration-300 group"
              >
                Full story
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-24 h-px bg-[#1a1a1a] origin-left"
        />
      </div>
    </section>
  )
}
