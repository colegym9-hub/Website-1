"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Cycles through words with type/delete animation — ready to swap for GSAP later.
 */
export function useTypewriter(
  words: readonly string[],
  options?: {
    startDelayMs?: number
    typingMs?: number
    deletingMs?: number
    pauseAtWordMs?: number
    pauseBetweenWordsMs?: number
  }
) {
  const {
    startDelayMs = 1100,
    typingMs = 100,
    deletingMs = 50,
    pauseAtWordMs = 2000,
    pauseBetweenWordsMs = 500,
  } = options ?? {}

  const [text, setText] = useState("")
  const wordsRef = useRef(words)
  wordsRef.current = words

  useEffect(() => {
    let wordIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeoutId: ReturnType<typeof setTimeout>

    const type = () => {
      const w = wordsRef.current
      const currentWord = w[wordIndex]

      if (isDeleting) {
        setText(currentWord.substring(0, charIndex - 1))
        charIndex--
      } else {
        setText(currentWord.substring(0, charIndex + 1))
        charIndex++
      }

      let timeout = isDeleting ? deletingMs : typingMs

      if (!isDeleting && charIndex === currentWord.length) {
        timeout = pauseAtWordMs
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        wordIndex = (wordIndex + 1) % w.length
        timeout = pauseBetweenWordsMs
      }

      timeoutId = setTimeout(type, timeout)
    }

    const startId = setTimeout(type, startDelayMs)
    return () => {
      clearTimeout(startId)
      clearTimeout(timeoutId)
    }
  }, [
    startDelayMs,
    typingMs,
    deletingMs,
    pauseAtWordMs,
    pauseBetweenWordsMs,
  ])

  return text
}
