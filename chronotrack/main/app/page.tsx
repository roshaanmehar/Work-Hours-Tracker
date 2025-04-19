"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Square, Coffee, RotateCcw } from "lucide-react"
import Navbar from "@/components/navbar"
import { useSound } from "use-sound"
import styles from "./page.module.css"

type TrackingState = "idle" | "tracking" | "break"

export default function Home() {
  const [state, setState] = useState<TrackingState>("idle")
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date | null
    breakStartTime: Date | null
    totalBreakTime: number
  }>({
    startTime: null,
    breakStartTime: null,
    totalBreakTime: 0,
  })
  const [elapsedTime, setElapsedTime] = useState("00:00:00")
  const [todayTotal, setTodayTotal] = useState("03:45:12")

  // Sound effects
  const [playClockIn] = useSound("/sounds/clock-in.mp3", { volume: 0.5 })
  const [playClockOut] = useSound("/sounds/clock-out.mp3", { volume: 0.5 })
  const [playBreak] = useSound("/sounds/break.mp3", { volume: 0.5 })
  const [playResume] = useSound("/sounds/resume.mp3", { volume: 0.5 })

  // Format time as HH:MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  // Update elapsed time every second
  useEffect(() => {
    if (state === "idle" || !currentSession.startTime) return

    const intervalId = setInterval(() => {
      const now = new Date()
      let elapsed = now.getTime() - currentSession.startTime!.getTime()

      // Subtract break time if on break
      if (state === "break" && currentSession.breakStartTime) {
        const breakTime = now.getTime() - currentSession.breakStartTime.getTime()
        elapsed -= breakTime
      }

      // Subtract total break time from previous breaks
      elapsed -= currentSession.totalBreakTime

      setElapsedTime(formatTime(elapsed))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [state, currentSession])

  const handleClockIn = () => {
    setState("tracking")
    setCurrentSession({
      startTime: new Date(),
      breakStartTime: null,
      totalBreakTime: 0,
    })
    playClockIn()
  }

  const handleClockOut = () => {
    setState("idle")
    setCurrentSession({
      startTime: null,
      breakStartTime: null,
      totalBreakTime: 0,
    })
    setElapsedTime("00:00:00")
    playClockOut()
  }

  const handleBreak = () => {
    setState("break")
    setCurrentSession({
      ...currentSession,
      breakStartTime: new Date(),
    })
    playBreak()
  }

  const handleResumeWork = () => {
    if (!currentSession.breakStartTime) return

    const now = new Date()
    const breakDuration = now.getTime() - currentSession.breakStartTime.getTime()

    setState("tracking")
    setCurrentSession({
      ...currentSession,
      breakStartTime: null,
      totalBreakTime: currentSession.totalBreakTime + breakDuration,
    })
    playResume()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Time Tracker</h1>
      </div>

      <div className={styles.status}>
        <motion.div
          className={styles.statusIndicator}
          animate={{
            backgroundColor: state === "idle" ? "#444" : state === "tracking" ? "#e5b80b" : "#e63946",
          }}
        />
        <p>
          {state === "idle" && "Not clocked in"}
          {state === "tracking" && "Currently working"}
          {state === "break" && "On break"}
        </p>
      </div>

      <div className={styles.timeDisplay}>
        <motion.h2
          key={elapsedTime}
          initial={{ opacity: 0.8, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {elapsedTime}
        </motion.h2>
        <p>Current session</p>
      </div>

      <div className={styles.actions}>
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.button
              key="clock-in"
              className={`${styles.button} ${styles.primary}`}
              onClick={handleClockIn}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Play size={20} />
              Clock In
            </motion.button>
          )}

          {state === "tracking" && (
            <motion.div
              key="tracking-actions"
              className={styles.actionGroup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleBreak}
                whileTap={{ scale: 0.95 }}
              >
                <Coffee size={20} />
                Take Break
              </motion.button>

              <motion.button
                className={`${styles.button} ${styles.danger}`}
                onClick={handleClockOut}
                whileTap={{ scale: 0.95 }}
              >
                <Square size={20} />
                Clock Out
              </motion.button>
            </motion.div>
          )}

          {state === "break" && (
            <motion.div
              key="break-actions"
              className={styles.actionGroup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className={`${styles.button} ${styles.primary}`}
                onClick={handleResumeWork}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={20} />
                Resume Work
              </motion.button>

              <motion.button
                className={`${styles.button} ${styles.danger}`}
                onClick={handleClockOut}
                whileTap={{ scale: 0.95 }}
              >
                <Square size={20} />
                Clock Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.summary}>
        <h3>Today's Summary</h3>
        <p>
          Total time worked: <strong>{todayTotal}</strong>
        </p>
      </div>

      <Navbar activePage="track" />
    </div>
  )
}
