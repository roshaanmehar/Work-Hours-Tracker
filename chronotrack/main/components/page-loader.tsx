"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import styles from "./page-transition.module.css"

export default function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(true)

  useEffect(() => {
    // Show loading state when route changes
    setIsLoading(true)
    setIsComplete(false)
    
    // Hide loading state after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // Mark as complete after transition
      setTimeout(() => {
        setIsComplete(true)
      }, 300)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Don't render anything if loading is complete
  if (isComplete) return null

  return (
    <motion.div
      className={styles.loadingOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.7 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.pixelLoader}>
        <div className={styles.pixelLoaderInner}></div>
      </div>
    </motion.div>
  )
}
