"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import styles from "./page-transition.module.css"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [key, setKey] = useState(pathname)

  // Update children when route changes
  useEffect(() => {
    // Skip animation on initial load
    if (key !== pathname && pathname !== "/") {
      setIsLoading(true)

      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        setDisplayChildren(children)
        setKey(pathname)
        setIsLoading(false)
      })
    } else {
      // Immediately update children on initial load
      setDisplayChildren(children)
    }
  }, [pathname, searchParams, children, key])

  return (
    <>
      {/* Loading indicator - only show during actual navigation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={styles.loadingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }} // Faster transition
          >
            <div className={styles.pixelLoader}>
              <div className={styles.pixelLoaderInner}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }} // Faster transition
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
