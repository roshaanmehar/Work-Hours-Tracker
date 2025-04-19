"use client"

import { useEffect, useState } from "react"
import styles from "./pixel-clock.module.css"

interface PixelClockProps {
  time: string
}

export default function PixelClock({ time }: PixelClockProps) {
  const [blink, setBlink] = useState(true)

  // Blink the colon
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((prev) => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const [hours, minutes, seconds] = time.split(":")

  return (
    <div className={styles.clockContainer}>
      <div className={styles.clockBorder}>
        <div className={styles.clockInner}>
          <div className={styles.clockDigits}>
            <div className={styles.digitGroup}>
              <div className={styles.digit}>{hours[0]}</div>
              <div className={styles.digit}>{hours[1]}</div>
            </div>

            <div className={`${styles.separator} ${blink ? styles.visible : ""}`}>:</div>

            <div className={styles.digitGroup}>
              <div className={styles.digit}>{minutes[0]}</div>
              <div className={styles.digit}>{minutes[1]}</div>
            </div>

            <div className={`${styles.separator} ${blink ? styles.visible : ""}`}>:</div>

            <div className={styles.digitGroup}>
              <div className={styles.digit}>{seconds[0]}</div>
              <div className={styles.digit}>{seconds[1]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
