"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Preload() {
  const router = useRouter()

  useEffect(() => {
    // Preload critical pages
    const pagesToPreload = ["/history", "/analytics", "/reports", "/expenses", "/admin"]

    // Use setTimeout to delay preloading until after initial page load
    setTimeout(() => {
      pagesToPreload.forEach((page) => {
        router.prefetch(page)
      })
    }, 2000)
  }, [router])

  return null
}
