import { useEffect, useRef, useState } from 'react'

interface UseRevealOptions {
  threshold?: number
  delay?: number
  once?: boolean
}

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  delay = 0,
  once = true,
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            const timer = setTimeout(() => setIsVisible(true), delay)
            return () => clearTimeout(timer)
          }
          setIsVisible(true)
          if (once) observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, delay, once])

  return { ref, isVisible }
}
