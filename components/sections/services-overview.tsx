"use client"

import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const services = [
  {
    title: "Media Day",
    body: "Production-level imagery built around your team. Bold lighting. Real athletes.",
    from: "Media days from $900",
    photo: "https://images.pixieset.com/821255111/d62fa665236011d8960c26653b1192d8-xlarge.jpg",
    href: "/book",
  },
  {
    title: "Senior Portraits",
    body: "Who you are as a person and as an athlete. Built for the athlete, not just the senior.",
    from: "Senior portraits from $350",
    photo: "https://images.pixieset.com/821255111/fa0072d497fb493669cbb5e6c085b81b-xlarge.jpg",
    href: "/book",
  },
]

export default function ServicesOverview() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <section ref={ref} className="bg-[#0A0A0A] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
          className="mb-12 md:mb-16"
        >
          <p className="text-[#A0A0A0] text-xs tracking-[0.3em] uppercase mb-4">What we do</p>
          <h2
            className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] text-[#F0EDE8] leading-none"
            style={{ letterSpacing: "-0.03em" }}
          >
            Built for athletes.
            <br />
            Every level.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.165, 0.84, 0.44, 1] }}
              className="relative overflow-hidden group"
              style={{ aspectRatio: "3/4" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svc.photo}
                alt={svc.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ filter: "brightness(0.45) contrast(1.1)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.25) 55%, transparent 100%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                <h3
                  className="font-heading text-[clamp(2rem,5vw,3.5rem)] text-[#F0EDE8] leading-none mb-3"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {svc.title}
                </h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed mb-4 max-w-[260px]">
                  {svc.body}
                </p>
                <p className="text-[#555] text-[11px] tracking-[0.15em] uppercase mb-6">
                  {svc.from}
                </p>
                <Link
                  href={svc.href}
                  className="inline-flex items-center gap-3 text-xs text-[var(--ac-accent)] tracking-widest uppercase hover:text-[var(--ac-accent-mid)] transition-colors duration-300 group/cta"
                >
                  Start booking
                  <span className="group-hover/cta:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
