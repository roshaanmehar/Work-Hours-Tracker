"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Preload() {
  const router = useRouter()

  useEffect(() => {
    // Preload critical pages
    const pagesToPreload = ["/history", "/analytics", "/reports", "/expenses", "/admin"]

    // Use requestIdleCallback to preload during browser idle time
    if ("requestIdleCallback" in window) {
      pagesToPreload.forEach((page) => {
        // @ts-ignore - TypeScript doesn't recognize requestIdleCallback
        window.requestIdleCallback(() => {
          router.prefetch(page)
        })
      })
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        pagesToPreload.forEach((page) => {
          router.prefetch(page)
        })
      }, 2000)
    }
  }, [router])

  return null
}
