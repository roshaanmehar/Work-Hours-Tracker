"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import styles from "./page-transition.module.css"

export default function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const initialLoadRef = useRef(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Skip the initial load animation
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }

    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Show loading state when route changes
    setIsLoading(true)

    // Hide loading state after a short delay
    timerRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.loadingOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.pixelLoader}>
            <div className={styles.pixelLoaderInner}></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
