"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { type Shoot, SIZE_MAP, CATEGORY_LABELS } from "./shoot-data"

gsap.registerPlugin(ScrollTrigger)

type CanvasItemProps = {
  shoot: Shoot
  dimmed: boolean // true when a category filter is active and this item doesn't match
}

export default function CanvasItem({ shoot, dimmed }: CanvasItemProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { width, height } = SIZE_MAP[shoot.size]

  // ScrollTrigger fade-in entrance
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    gsap.fromTo(
      el,
      { opacity: 0, y: 28, scale: 0.97 },
      {
        opacity: dimmed ? 0.25 : 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          toggleActions: "play none none none",
        },
      }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Dimming transition when category filter changes
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    gsap.to(el, {
      opacity: dimmed ? 0.25 : 1,
      scale: dimmed ? 0.97 : 1,
      duration: 0.5,
      ease: "power2.out",
      pointerEvents: dimmed ? "none" : "auto",
    })
  }, [dimmed])

  return (
    <div
      ref={wrapRef}
      className="absolute"
      style={{
        top: shoot.top,
        left: shoot.left,
        width,
        zIndex: 10,
        opacity: 0, // GSAP animates this in
      }}
    >
      {/* Label above image */}
      <p
        className="mb-2 text-[10px] tracking-[0.2em] uppercase transition-colors duration-300"
        style={{ color: "var(--ac-text-muted)" }}
      >
        {shoot.title}
      </p>

      {/* Image card */}
      <Link
        href={`/work/${shoot.id}`}
        className="group relative block overflow-hidden"
        style={{
          width,
          height,
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
        }}
        tabIndex={dimmed ? -1 : 0}
      >
        {/* Main image */}
        <Image
          src={shoot.cover}
          alt={shoot.title}
          fill
          sizes="(max-width: 768px) 90vw, 40vw"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
          style={{
            filter: shoot.isGrayscale ? "grayscale(100%)" : "none",
            transition: "transform 700ms ease-out, filter 500ms ease-out",
          }}
          // On hover, JS-powered grayscale→color is handled via group-hover CSS below
        />

        {/* Grayscale lift on hover (only for B&W items) */}
        {shoot.isGrayscale && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              backgroundImage: `url(${shoot.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "none",
            }}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />

        {/* Bottom reveal — category tag */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <span
            className="text-[10px] tracking-[0.18em] uppercase"
            style={{ color: "var(--ac-accent)" }}
          >
            {CATEGORY_LABELS[shoot.category]}
          </span>
          <span
            className="text-[10px] tracking-[0.14em] uppercase"
            style={{ color: "var(--ac-text-muted)" }}
          >
            View shoot →
          </span>
        </div>
      </Link>
    </div>
  )
}
