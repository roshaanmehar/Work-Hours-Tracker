"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { useTimeStore } from "@/lib/store"
import { formatDuration, formatMoney } from "@/lib/utils"

export default function TimeTracker() {
  const { addShift, updateShift, shifts, loadData } = useTimeStore()
  const [isTracking, setIsTracking] = useState(false)
  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  const hourHandRef = useRef<HTMLDivElement>(null)
  const minuteHandRef = useRef<HTMLDivElement>(null)
  const secondHandRef = useRef<HTMLDivElement>(null)

  // Check if there's an active shift
  useEffect(() => {
    loadData()

    const activeShift = shifts.find((shift) => !shift.endTime)
    if (activeShift) {
      setIsTracking(true)
      setCurrentShiftId(activeShift.id)
      setStartTime(new Date(activeShift.startTime))

      // Start the timer
      const interval = setInterval(() => {
        const now = new Date()
        const start = new Date(activeShift.startTime)
        const diffInHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60)
        setElapsedTime(diffInHours)
        setEarnings(diffInHours * 12.5)
      }, 1000)

      setTimerInterval(interval)
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [loadData, shifts])

  // Update clock hands
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = now.getHours() % 12
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      const hourDegrees = hours * 30 + minutes * 0.5
      const minuteDegrees = minutes * 6
      const secondDegrees = seconds * 6

      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourDegrees}deg)`
      }

      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minuteDegrees}deg)`
      }

      if (secondHandRef.current) {
        secondHandRef.current.style.transform = `rotate(${secondDegrees}deg)`
      }
    }

    updateClock() // Initial update

    const clockInterval = setInterval(updateClock, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  const handleStartTracking = () => {
    const now = new Date()
    const id = crypto.randomUUID()

    addShift({
      id,
      startTime: now.toISOString(),
      endTime: null,
      notes: "",
    })

    setIsTracking(true)
    setCurrentShiftId(id)
    setStartTime(now)
    setElapsedTime(0)
    setEarnings(0)

    // Start the timer
    const interval = setInterval(() => {
      const currentTime = new Date()
      const diffInHours = (currentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      setElapsedTime(diffInHours)
      setEarnings(diffInHours * 12.5)
    }, 1000)

    setTimerInterval(interval)
  }

  const handleStopTracking = () => {
    if (timerInterval) clearInterval(timerInterval)

    if (currentShiftId) {
      const now = new Date()

      updateShift(currentShiftId, {
        endTime: now.toISOString(),
      })
    }

    setIsTracking(false)
    setCurrentShiftId(null)
    setTimerInterval(null)
  }

  return (
    <div className="card baroque-border">
      <div className="ornament ornament-1"></div>
      <div className="ornament ornament-2"></div>
      <div className="card-header">
        <h2 className="card-title">Time Tracker</h2>
        <p className="card-description">Track your working hours and earnings</p>
      </div>
      <div className="card-content" style={{ textAlign: "center" }}>
        <div className="baroque-clock">
          <div className="clock-face">
            <div className="clock-numbers">
              <div className="clock-number clock-number-1">
                <span>1</span>
              </div>
              <div className="clock-number clock-number-2">
                <span>2</span>
              </div>
              <div className="clock-number clock-number-3">
                <span>3</span>
              </div>
              <div className="clock-number clock-number-4">
                <span>4</span>
              </div>
              <div className="clock-number clock-number-5">
                <span>5</span>
              </div>
              <div className="clock-number clock-number-6">
                <span>6</span>
              </div>
              <div className="clock-number clock-number-7">
                <span>7</span>
              </div>
              <div className="clock-number clock-number-8">
                <span>8</span>
              </div>
              <div className="clock-number clock-number-9">
                <span>9</span>
              </div>
              <div className="clock-number clock-number-10">
                <span>10</span>
              </div>
              <div className="clock-number clock-number-11">
                <span>11</span>
              </div>
              <div className="clock-number clock-number-12">
                <span>12</span>
              </div>
            </div>
            <div ref={hourHandRef} className="clock-hand clock-hand-hour"></div>
            <div ref={minuteHandRef} className="clock-hand clock-hand-minute"></div>
            <div ref={secondHandRef} className="clock-hand clock-hand-second"></div>
            <div className="clock-center"></div>
          </div>
        </div>

        <div className="timer-display">{formatDuration(elapsedTime)}</div>

        <div style={{ fontSize: "1.5rem", marginBottom: "1rem", fontFamily: "var(--font-serif)" }}>
          {formatMoney(earnings)}
        </div>

        {startTime && (
          <div style={{ marginBottom: "1rem", fontSize: "0.875rem", opacity: "0.7" }}>
            Started at {format(startTime, "h:mm a")}
          </div>
        )}

        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(Math.round((elapsedTime / 8) * 100), 100)}%` }}
          ></div>
        </div>
        <div style={{ fontSize: "0.75rem", opacity: "0.7", textAlign: "right", marginBottom: "2rem" }}>
          {Math.min(Math.round((elapsedTime / 8) * 100), 100)}% of 8-hour workday
        </div>

        <div className="timer-controls">
          {isTracking ? (
            <button className="button button-primary button-large" onClick={handleStopTracking}>
              Stop Tracking
            </button>
          ) : (
            <button className="button button-primary button-large animate-pulse" onClick={handleStartTracking}>
              Start Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
