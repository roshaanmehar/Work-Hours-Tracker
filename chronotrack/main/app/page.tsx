"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Import only the specific icons you need
import { Play, Square, Coffee, RotateCcw, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import PinLogin from "@/components/pin-login"
import { useAuth } from "@/context/auth-context"
import styles from "./page.module.css"

type TrackingState = "idle" | "tracking" | "break"

export default function Home() {
  const { authenticated, resetSessionTimeout } = useAuth()
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
  const [availableJobs, setAvailableJobs] = useState([
    { id: 1, name: "Web Development", rate: 50 },
    { id: 2, name: "Design Work", rate: 45 },
    { id: 3, name: "Client Meeting", rate: 60 },
  ])

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

  // Call resetSessionTimeout only once when the component mounts
  useEffect(() => {
    if (authenticated) {
      resetSessionTimeout()
    }
  }, [authenticated, resetSessionTimeout]) // resetSessionTimeout is now memoized, so this is safe

  // Get suggested job based on day and time
  const getSuggestedJob = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTime = currentHour + currentMinutes / 60 // Convert to decimal time (e.g., 9:30 = 9.5)

    // Get day of week as string (0 = Sunday, 1 = Monday, etc.)
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = daysOfWeek[now.getDay()]

    // This would come from the database in a real implementation
    // For now, we'll use the mock rules from the admin page
    const jobRules = [
      { id: 1, days: "Monday-Friday", timeRange: "9:00-12:00", job: "Web Development" },
      { id: 2, days: "Monday-Friday", timeRange: "12:00-14:00", job: "Client Meeting" },
      { id: 3, days: "Monday-Friday", timeRange: "14:00-17:00", job: "Design Work" },
      { id: 4, days: "Saturday", timeRange: "10:00-16:00", job: "Web Development" },
      { id: 5, days: "Sunday", timeRange: "12:00-18:00", job: "Design Work" },
    ]

    // Find the first matching rule
    for (const rule of jobRules) {
      // Check if current day matches the rule
      const matchesDay = checkDayMatch(currentDay, rule.days)

      // If day matches, check if current time is within the time range
      if (matchesDay) {
        const [startTime, endTime] = parseTimeRange(rule.timeRange)
        if (currentTime >= startTime && currentTime < endTime) {
          // Find the job object that matches the rule
          const matchingJob = availableJobs.find((job) => job.name === rule.job)
          if (matchingJob) {
            return matchingJob
          }
        }
      }
    }

    // Default to first job if no rules match
    return availableJobs[0]
  }

  // Helper function to check if the current day matches the rule's day specification
  const checkDayMatch = (currentDay, ruleDays) => {
    if (ruleDays === "Weekends") {
      return currentDay === "Saturday" || currentDay === "Sunday"
    }

    if (ruleDays === "Monday-Friday") {
      return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(currentDay)
    }

    // Handle multiple days separated by commas
    if (ruleDays.includes(",")) {
      const days = ruleDays.split(",").map((d) => d.trim())
      return days.includes(currentDay)
    }

    // Single day match
    return ruleDays === currentDay
  }

  // Helper function to parse time range string (e.g., "9:00-17:00") into decimal hours
  const parseTimeRange = (timeRange) => {
    const [start, end] = timeRange.split("-")

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number)
      return hours + minutes / 60
    }

    return [parseTime(start), parseTime(end)]
  }

  const handleClockIn = () => {
    // Get suggested job
    const suggestedJob = getSuggestedJob()

    setState("tracking")
    setCurrentSession({
      startTime: new Date(),
      breakStartTime: null,
      totalBreakTime: 0,
      selectedJob: suggestedJob.name,
    })
  }

  const handleClockOut = () => {
    setState("idle")
    setCurrentSession({
      startTime: null,
      breakStartTime: null,
      totalBreakTime: 0,
      selectedJob: "Default Job",
    })
    setElapsedTime("00:00:00")
  }

  const handleBreak = () => {
    setState("break")
    setCurrentSession({
      ...currentSession,
      breakStartTime: new Date(),
    })
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
  }

  // Split time into digits for animation
  const [hours, minutes, seconds] = elapsedTime.split(":")

  if (!authenticated) {
    return <PinLogin />
  }

  return (
    <div className={styles.container}>
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
