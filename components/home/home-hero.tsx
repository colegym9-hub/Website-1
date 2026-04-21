"use client"

import Image from "next/image"
import Link from "next/link"
import { useTypewriter } from "./use-typewriter"
import styles from "./home-hero.module.css"
import type { HomeHeroContent } from "@/lib/site-content-schema"
import { DEFAULT_HOME_HERO } from "@/lib/site-content-defaults"

const INNER_ANGLES = [0, 60, 120, 180, 240, 300] as const
const OUTER_ANGLES = [0, 40, 80, 120, 160, 200, 240, 280, 320] as const

export default function HomeHero({ content }: { content?: HomeHeroContent }) {
  const c = content ?? DEFAULT_HOME_HERO
  const typewriterText = useTypewriter(c.typewriterWords as unknown as readonly string[])

  return (
    <section data-section="hero" className={styles.hero} id="ac-media-hero">
      <div className={styles.orbitWrapper}>
        <div className={`${styles.orbit} ${styles.innerOrbit}`}>
          {c.innerOrbitImages.map((src, i) => {
            const deg = INNER_ANGLES[i] ?? 0
            return (
              <div
                key={src}
                className={styles.orbitArm}
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={styles.imgWrap}
                  style={{
                    transform: `translateY(-340px) rotate(${-deg}deg)`,
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    width={250}
                    height={250}
                    className={`${styles.orbitImg} ${styles.innerImg}`}
                    sizes="250px"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className={`${styles.orbit} ${styles.outerOrbit}`}>
          {c.outerOrbitImages.map((src, i) => {
            const deg = OUTER_ANGLES[i] ?? 0
            return (
              <div
                key={src}
                className={styles.orbitArm}
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={styles.imgWrap}
                  style={{
                    transform: `translateY(-580px) rotate(${-deg}deg)`,
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    width={250}
                    height={250}
                    className={`${styles.orbitImg} ${styles.outerImg}`}
                    sizes="250px"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.heroOverlay} aria-hidden />

      <div className={styles.heroContent}>
        <span className={styles.heroSubtitle}>A.C Media | Cole Warner</span>
        <h1 className={styles.heroTitle}>
          Capture The <br />
          <span className={styles.typewriterText}>{typewriterText}</span>
          <span className={styles.cursor} aria-hidden />
        </h1>
        <p className={styles.heroDescription}>
          High-impact sports portraits and media days across New York and Pennsylvania.
          Pictures that look like they belong at the next level.
        </p>
        <Link href="/contact" className={styles.heroBtn}>
          Book Your Shoot
        </Link>
      </div>
    </section>
  )
}
