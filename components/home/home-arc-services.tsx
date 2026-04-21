"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { HomeServicesContent } from "@/lib/site-content-schema"
import { DEFAULT_HOME_SERVICES } from "@/lib/site-content-defaults"
import styles from "./home-vertical-services.module.css";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeArcServices({ content }: { content?: HomeServicesContent }) {
  const nodes = content?.cards ?? DEFAULT_HOME_SERVICES.cards
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current;
      if (!cards.length) return;

      // We want enough scroll distance to comfortably sequence 3 cards sliding and holding
      const totalScrollHeight = window.innerHeight * 3;

      // Initial state for text
      cards.forEach((card, index) => {
        if (!card) return;
        const textElements = card.querySelectorAll(".anim-text");
        if (!textElements.length) return;

        gsap.set(textElements, { 
          opacity: 0, 
          z: -100, 
          rotationX: 10,
          y: 50
        });

        // Card 0 text animates independently when the section enters the viewport
        if (index === 0) {
          gsap.to(textElements, {
            opacity: 1,
            z: 0,
            y: 0,
            rotationX: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
            }
          });
        }
      });

      // Pin the container and scrub the timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalScrollHeight}`,
          pin: true,
          scrub: 1, // Smooth scrubbing
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.35) setActiveSlide(0);
            else if (p < 0.7) setActiveSlide(1);
            else setActiveSlide(2);
          }
        }
      });

      const text1 = cards[1]?.querySelectorAll(".anim-text");
      const text2 = cards[2]?.querySelectorAll(".anim-text");

      // === PHASE 1: Card 1 (Sportraits) Enters ===
      // Starts sliding at 0.4, finishes at 1.2
      tl.fromTo(cards[1], 
        { y: window.innerHeight }, 
        { y: 0, ease: "power1.inOut", duration: 0.8 }, 
        0.4
      );
      tl.to(cards[0], 
        { scale: 0.9, opacity: 0.5, ease: "power1.inOut", duration: 0.8 }, 
        0.4
      );
      
      // Text for Card 1 scrubs in as the card comes up
      if (text1?.length) {
        tl.to(text1, {
          opacity: 1, z: 0, y: 0, rotationX: 0, duration: 0.6,
          stagger: 0.1, ease: "power2.out"
        }, 0.6);
      }

      // === PHASE 2: Card 2 (Senior Portraits) Enters ===
      // Starts sliding at 1.8, finishes at 2.6
      tl.fromTo(cards[2], 
        { y: window.innerHeight }, 
        { y: 0, ease: "power1.inOut", duration: 0.8 }, 
        1.8
      );
      tl.to(cards[1], 
        { scale: 0.9, opacity: 0.5, ease: "power1.inOut", duration: 0.8 }, 
        1.8
      );

      // Text for Card 2 scrubs in
      if (text2?.length) {
        tl.to(text2, {
          opacity: 1, z: 0, y: 0, rotationX: 0, duration: 0.6,
          stagger: 0.1, ease: "power2.out"
        }, 2.0);
      }

      // === PHASE 3: Hold on Senior Portraits ===
      // Pad timeline to 3.2 so it holds before unpinning
      tl.to({}, { duration: 0.6 }, 2.6);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.container} id="ac-arc-services">
      {/* Segmented Dots Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          {nodes.map((_, index) => (
            <button
              key={index} 
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                styles.progressDot, 
                index === activeSlide && styles.progressDotActive
              )}
              onClick={() => {
                if (containerRef.current) {
                  const startPos = containerRef.current.offsetTop;
                  const totalScroll = window.innerHeight * 3;
                  
                  // Target times on the 3.2 duration timeline
                  let targetTime = 0;
                  if (index === 1) targetTime = 1.2;
                  if (index === 2) targetTime = 2.6;
                  
                  const targetScroll = startPos + (targetTime / 3.2) * totalScroll;
                  window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.cardsWrapper}>
        {nodes.map((node, index) => (
          <div 
            key={node.id} 
            ref={(el) => {
              cardsRef.current[index] = el;
            }} 
            className={cn("service-slide", styles.card)}
            style={{ zIndex: index }}
          >
            <div
              className={styles.cardBg}
              style={{
                backgroundImage: `url(${node.image})`,
                backgroundPosition: node.bgPosition ?? "center",
              }}
            />
            <div className={styles.overlay} />
            
            <div className={styles.content}>
              <h2 className={cn("anim-text", styles.title)}>
                {node.titleBreak ? (
                  <>
                    {node.titleBreak[0]}
                    <br />
                    {node.titleBreak[1]}
                  </>
                ) : (
                  node.title
                )}
              </h2>
              
              <div className={cn("anim-text", styles.btnWrapper)}>
                 <Link href={`/contact?service=${node.service}`} className={styles.btn}>
                  <span>Book Now</span>
                  <div className={styles.btnIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
