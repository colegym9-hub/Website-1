"use client"

import Image from "next/image"
import Link from "next/link"
import { CATEGORY_LABELS } from "@/components/portfolio/shoot-data"
import type { GalleryShootRef } from "@/lib/site-content-schema"

type Role = "hero" | "support" | "mobile-hero" | "mobile-support"

type Props = {
  item: GalleryShootRef
  role: Role
  sizes?: string
  priority?: boolean
}

const ROLE_CLASSES: Record<Role, string> = {
  hero: "w-full h-full",
  support: "w-full h-full",
  "mobile-hero": "w-full aspect-[4/5]",
  "mobile-support": "w-full aspect-[3/4]",
}

const DEFAULT_SIZES: Record<Role, string> = {
  hero: "(min-width: 768px) 50vw, 100vw",
  support: "(min-width: 768px) 30vw, 50vw",
  "mobile-hero": "100vw",
  "mobile-support": "50vw",
}

export default function GalleryCard({ item, role, sizes, priority }: Props) {
  return (
    <Link
      href={`/work/${item.id}`}
      className={`group relative block overflow-hidden ${ROLE_CLASSES[role]}`}
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
    >
      <Image
        src={item.cover}
        alt={item.title}
        fill
        sizes={sizes ?? DEFAULT_SIZES[role]}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        style={{
          filter: item.isGrayscale ? "grayscale(100%)" : "none",
          objectPosition: item.objectPosition ?? "center center",
          transition: "transform 700ms ease-out, filter 600ms ease-out",
        }}
      />
      {item.isGrayscale && (
        <Image
          src={item.cover}
          alt=""
          fill
          aria-hidden
          sizes={sizes ?? DEFAULT_SIZES[role]}
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            filter: "none",
            objectPosition: item.objectPosition ?? "center center",
          }}
        />
      )}

      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/40" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0">
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ac-accent)" }}>
          {CATEGORY_LABELS[item.category]}
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ac-text-muted)" }}>
          View →
        </span>
      </div>
    </Link>
  )
}
