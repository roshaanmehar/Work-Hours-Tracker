"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import styles from "./pixel-button.module.css"

interface PixelButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "danger"
  size?: "normal" | "large"
}

export default function PixelButton({ children, onClick, variant = "primary", size = "normal" }: PixelButtonProps) {
  return (
    <motion.button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
    >
      <span className={styles.buttonFace}>
        <span className={styles.buttonText}>{children}</span>
      </span>
    </motion.button>
  )
}
