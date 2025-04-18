"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getPreloadablePages } from "@/lib/page-manifest"

export default function Preload() {
  const router = useRouter()
  const preloadedRef = useRef<Set<string>>(new Set())
  const isPreloadingRef = useRef(false)

  useEffect(() => {
    // Only run preloading once
    if (isPreloadingRef.current) return
    isPreloadingRef.current = true

    // Get the list of pages to preload
    const pagesToPreload = getPreloadablePages()

    // Create a function to preload pages in batches
    const preloadBatch = (startIndex: number, batchSize: number) => {
      const endIndex = Math.min(startIndex + batchSize, pagesToPreload.length)

      for (let i = startIndex; i < endIndex; i++) {
        const page = pagesToPreload[i]
        if (!preloadedRef.current.has(page)) {
          router.prefetch(page)
          preloadedRef.current.add(page)
        }
      }

      // If there are more pages to preload, schedule the next batch
      if (endIndex < pagesToPreload.length) {
        setTimeout(() => preloadBatch(endIndex, batchSize), 200)
      }
    }

    // Start preloading after a short delay
    const timer = setTimeout(() => {
      preloadBatch(0, 2) // Preload 2 pages at a time
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return null
}
