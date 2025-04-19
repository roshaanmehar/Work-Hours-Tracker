"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Square, Coffee, RotateCcw, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import PinLogin from "@/components/pin-login"
import { useSound } from "use-sound"
import styles from "./page.module.css"

type TrackingState = "idle" | "tracking" | "break"

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false)
  const [state, setState] = useState<TrackingState>("idle")
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date | null
    breakStartTime: Date | null
    totalBreakTime: number
    selectedJob: string
  }>({
    startTime: null,
    breakStartTime: null,
    totalBreakTime: 0,
    selectedJob: "Default Job",
  })
  const [elapsedTime, setElapsedTime] = useState("00:00:00")
  const [todayTotal, setTodayTotal] = useState("03:45:12")
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null)
  const [availableJobs, setAvailableJobs] = useState([
    { id: 1, name: "Web Development", rate: 50 },
    { id: 2, name: "Design Work", rate: 45 },
    { id: 3, name: "Client Meeting", rate: 60 },
  ])

  // Sound effects
  const [playClockIn] = useSound("/sounds/clock-in.mp3", { volume: 0.5 })
  const [playClockOut] = useSound("/sounds/clock-out.mp3", { volume: 0.5 })
  const [playBreak] = useSound("/sounds/break.mp3", { volume: 0.5 })
  const [playResume] = useSound("/sounds/resume.mp3", { volume: 0.5 })

  // Session timeout handler - reset after 90 seconds of inactivity
  useEffect(() => {
    if (!authenticated) return

    const timeout = setTimeout(() => {
      setAuthenticated(false)
    }, 90 * 1000)

    // Cleanup on unmount
    return () => {
      clearTimeout(timeout)
    }
  }, [authenticated])

  // Replace the resetSessionTimeout function with this:
  const resetSessionTimeout = () => {
    // This function just triggers a re-render which will reset the timeout
    // through the useEffect above
    setAuthenticated(true)
  }

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

  // Get suggested job based on day and time
  const getSuggestedJob = () => {
    // This would be based on rules from the database
    // For now, just return a default job based on current hour
    const hour = new Date().getHours()

    if (hour >= 9 && hour < 12) {
      return availableJobs[0] // Web Development in the morning
    } else if (hour >= 12 && hour < 14) {
      return availableJobs[2] // Client Meeting around lunch
    } else {
      return availableJobs[1] // Design Work in the afternoon
    }
  }

  const handleClockIn = () => {
    resetSessionTimeout()

    // Get suggested job
    const suggestedJob = getSuggestedJob()

    setState("tracking")
    setCurrentSession({
      startTime: new Date(),
      breakStartTime: null,
      totalBreakTime: 0,
      selectedJob: suggestedJob.name,
    })
    playClockIn()
  }

  const handleClockOut = () => {
    resetSessionTimeout()
    setState("idle")
    setCurrentSession({
      startTime: null,
      breakStartTime: null,
      totalBreakTime: 0,
      selectedJob: "Default Job",
    })
    setElapsedTime("00:00:00")
    playClockOut()
  }

  const handleBreak = () => {
    resetSessionTimeout()
    setState("break")
    setCurrentSession({
      ...currentSession,
      breakStartTime: new Date(),
    })
    playBreak()
  }

  const handleResumeWork = () => {
    resetSessionTimeout()
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

  const handlePinSuccess = () => {
    setAuthenticated(true)
  }

  // Split time into digits for animation
  const [hours, minutes, seconds] = elapsedTime.split(":")

  if (!authenticated) {
    return <PinLogin onSuccess={handlePinSuccess} />
  }

  return (
    <div className={styles.container} onClick={resetSessionTimeout}>
      <div className={styles.mainContent}>
        <div className={styles.timeDisplayContainer}>
          <div
            className={styles.statusBadge}
            style={{
              backgroundColor: state === "idle" ? "#333" : state === "tracking" ? "#e5b80b" : "#b22222",
            }}
          >
            {state === "idle" ? "READY" : state === "tracking" ? `WORKING: ${currentSession.selectedJob}` : "ON BREAK"}
          </div>

          <div className={styles.pixelTimeDisplay}>
            <div className={styles.timeUnit}>
              <div className={styles.timeDigits}>
                <motion.span
                  key={`h1-${hours[0]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {hours[0]}
                </motion.span>
                <motion.span
                  key={`h2-${hours[1]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  {hours[1]}
                </motion.span>
              </div>
              <span className={styles.timeLabel}>HOURS</span>
            </div>

            <div className={styles.timeSeparator}>:</div>

            <div className={styles.timeUnit}>
              <div className={styles.timeDigits}>
                <motion.span
                  key={`m1-${minutes[0]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {minutes[0]}
                </motion.span>
                <motion.span
                  key={`m2-${minutes[1]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  {minutes[1]}
                </motion.span>
              </div>
              <span className={styles.timeLabel}>MINUTES</span>
            </div>

            <div className={styles.timeSeparator}>:</div>

            <div className={styles.timeUnit}>
              <div className={styles.timeDigits}>
                <motion.span
                  key={`s1-${seconds[0]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {seconds[0]}
                </motion.span>
                <motion.span
                  key={`s2-${seconds[1]}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  {seconds[1]}
                </motion.span>
              </div>
              <span className={styles.timeLabel}>SECONDS</span>
            </div>
          </div>

          <div className={styles.todaySummary}>
            <Clock size={16} />
            <span>
              Today: <strong>{todayTotal}</strong>
            </span>
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.button
                key="clock-in"
                className={styles.clockInButton}
                onClick={handleClockIn}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.buttonIcon}>
                  <Play size={24} />
                </div>
                <div className={styles.buttonText}>CLOCK IN</div>
              </motion.button>
            )}

            {state === "tracking" && (
              <motion.div
                key="tracking-actions"
                className={styles.actionButtonsGroup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  className={styles.breakButton}
                  onClick={handleBreak}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.buttonIcon}>
                    <Coffee size={20} />
                  </div>
                  <div className={styles.buttonText}>BREAK</div>
                </motion.button>

                <motion.button
                  className={styles.clockOutButton}
                  onClick={handleClockOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.buttonIcon}>
                    <Square size={20} />
                  </div>
                  <div className={styles.buttonText}>CLOCK OUT</div>
                </motion.button>
              </motion.div>
            )}

            {state === "break" && (
              <motion.div
                key="break-actions"
                className={styles.actionButtonsGroup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  className={styles.resumeButton}
                  onClick={handleResumeWork}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.buttonIcon}>
                    <RotateCcw size={20} />
                  </div>
                  <div className={styles.buttonText}>RESUME</div>
                </motion.button>

                <motion.button
                  className={styles.clockOutButton}
                  onClick={handleClockOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.buttonIcon}>
                    <Square size={20} />
                  </div>
                  <div className={styles.buttonText}>CLOCK OUT</div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Navbar activePage="track" />
    </div>
  )
}
