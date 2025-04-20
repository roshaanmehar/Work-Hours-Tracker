"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Square, Coffee, RotateCcw, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import PinLogin from "@/components/pin-login"
import { useAuth } from "@/context/auth-context"
import { useJobs, useSuggestedJob, useTodayTotal, useCreateTimeEntry, useUpdateTimeEntry } from "@/hooks/use-data"
import styles from "./page.module.css"

type TrackingState = "idle" | "tracking" | "break"

export default function Home() {
  const { authenticated, resetSessionTimeout } = useAuth()
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { data: suggestedJob, isLoading: suggestedJobLoading } = useSuggestedJob()
  const { data: todayTotal, isLoading: todayTotalLoading } = useTodayTotal()
  const { mutate: createTimeEntry } = useCreateTimeEntry()
  const { mutate: updateTimeEntry } = useUpdateTimeEntry()

  const [state, setState] = useState<TrackingState>("idle")
  const [currentSession, setCurrentSession] = useState<{
    id?: number
    startTime: Date | null
    breakStartTime: Date | null
    totalBreakTime: number
    selectedJob: number | null
  }>({
    startTime: null,
    breakStartTime: null,
    totalBreakTime: 0,
    selectedJob: null,
  })
  const [elapsedTime, setElapsedTime] = useState("00:00:00")

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
  }, [authenticated, resetSessionTimeout])

  const handleClockIn = async () => {
    // Use suggested job or first available job
    const jobId = suggestedJob?.id || (jobs && jobs.length > 0 ? jobs[0].id : null)

    if (!jobId) {
      console.error("No job available for clock in")
      return
    }

    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]
    const dateString = now.toISOString().split("T")[0]

    // Create time entry in database
    const entry = await createTimeEntry({
      user_id: "current-user-id", // This would come from auth in a real app
      date: dateString,
      clock_in: timeString,
      clock_out: null,
      duration: null,
      job_id: jobId,
      status: "active",
      breaks: [],
    })

    if (entry) {
      setState("tracking")
      setCurrentSession({
        id: entry.id,
        startTime: now,
        breakStartTime: null,
        totalBreakTime: 0,
        selectedJob: jobId,
      })
    }
  }

  const handleClockOut = async () => {
    if (!currentSession.id || !currentSession.startTime) return

    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]

    // Calculate duration
    let elapsed = now.getTime() - currentSession.startTime.getTime()
    elapsed -= currentSession.totalBreakTime
    const durationString = formatTime(elapsed)

    // Update time entry in database
    await updateTimeEntry(currentSession.id, {
      clock_out: timeString,
      duration: durationString,
      breaks: currentSession.breakStartTime ? [] : currentSession.breaks, // Clear any ongoing breaks
    })

    setState("idle")
    setCurrentSession({
      startTime: null,
      breakStartTime: null,
      totalBreakTime: 0,
      selectedJob: null,
    })
    setElapsedTime("00:00:00")
  }

  const handleBreak = async () => {
    if (!currentSession.id) return

    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]

    // Get current breaks array
    const currentBreaks = Array.isArray(currentSession.breaks) ? [...currentSession.breaks] : []

    // Add new break start
    const newBreak = {
      start: timeString,
      end: null,
      duration: null,
    }

    // Update time entry with new break
    await updateTimeEntry(currentSession.id, {
      breaks: [...currentBreaks, newBreak],
    })

    setState("break")
    setCurrentSession({
      ...currentSession,
      breakStartTime: now,
    })
  }

  const handleResumeWork = async () => {
    if (!currentSession.id || !currentSession.breakStartTime) return

    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]
    const breakDuration = now.getTime() - currentSession.breakStartTime.getTime()
    const breakDurationString = formatTime(breakDuration)

    // Get current breaks array
    const currentBreaks = Array.isArray(currentSession.breaks) ? [...currentSession.breaks] : []

    // Update the last break with end time and duration
    if (currentBreaks.length > 0) {
      const lastBreakIndex = currentBreaks.length - 1
      currentBreaks[lastBreakIndex] = {
        ...currentBreaks[lastBreakIndex],
        end: timeString,
        duration: breakDurationString,
      }
    }

    // Update time entry with updated breaks
    await updateTimeEntry(currentSession.id, {
      breaks: currentBreaks,
    })

    setState("tracking")
    setCurrentSession({
      ...currentSession,
      breakStartTime: null,
      totalBreakTime: currentSession.totalBreakTime + breakDuration,
    })
  }

  // Split time into digits for animation
  const [hours, minutes, seconds] = elapsedTime.split(":")

  // Get selected job name
  const getSelectedJobName = () => {
    if (!currentSession.selectedJob || !jobs) return "Unknown Job"
    const job = jobs.find((j) => j.id === currentSession.selectedJob)
    return job ? job.name : "Unknown Job"
  }

  if (!authenticated) {
    return <PinLogin />
  }

  // Show loading state
  if (jobsLoading || suggestedJobLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
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
            {state === "idle" ? "READY" : state === "tracking" ? `WORKING: ${getSelectedJobName()}` : "ON BREAK"}
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
              Today: <strong>{todayTotalLoading ? "Loading..." : todayTotal || "00:00:00"}</strong>
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
