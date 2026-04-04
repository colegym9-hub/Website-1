"use client"

import { useState } from "react"
import { type Category } from "./shoot-data"

const tabs: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sportraits", label: "Sportraits" },
  { value: "media-days", label: "Media Days" },
  { value: "senior-portraits", label: "Senior Portraits" },
]

type CategoryFilterProps = {
  active: Category
  onChange: (c: Category) => void
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const [hovered, setHovered] = useState<Category | null>(null)

  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-4 py-3"
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "color-mix(in srgb, var(--ac-bg) 70%, transparent)",
        border: "1px solid var(--ac-divider)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.value
        const isHovered = hovered === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            onMouseEnter={() => setHovered(tab.value)}
            onMouseLeave={() => setHovered(null)}
            className="text-left text-[11px] tracking-[0.18em] uppercase px-2 py-1.5 rounded-md transition-all duration-200"
            style={{
              color: isActive
                ? "var(--ac-accent)"
                : isHovered
                ? "var(--ac-text)"
                : "var(--ac-text-muted)",
              backgroundColor: isActive
                ? "color-mix(in srgb, var(--ac-accent) 12%, transparent)"
                : "transparent",
              fontFamily: "var(--font-body-typekit), system-ui",
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
