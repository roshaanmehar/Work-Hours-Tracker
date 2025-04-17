"use client"

import { useEffect } from "react"
import type { TimeEntry } from "@/lib/types"
import { formatDuration, generateId } from "@/lib/utils"

export default function TimeTrackerClient() {
  useEffect(() => {
    const clockInBtn = document.getElementById("clock-in-btn") as HTMLButtonElement
    const clockOutBtn = document.getElementById("clock-out-btn") as HTMLButtonElement
    const currentTimeEl = document.getElementById("current-time") as HTMLDivElement
    const currentDateEl = document.getElementById("current-date") as HTMLDivElement
    const todayHoursEl = document.getElementById("today-hours") as HTMLSpanElement
    const weekHoursEl = document.getElementById("week-hours") as HTMLSpanElement
    const earningsEl = document.getElementById("earnings") as HTMLSpanElement
    const progressRegularEl = document.getElementById("progress-regular") as HTMLDivElement
    const progressOvertimeEl = document.getElementById("progress-overtime") as HTMLDivElement
    const progressTextEl = document.getElementById("progress-text") as HTMLSpanElement

    // Clock hands
    const hoursHandEl = document.getElementById("hours-hand") as HTMLDivElement
    const minutesHandEl = document.getElementById("minutes-hand") as HTMLDivElement
    const secondsHandEl = document.getElementById("seconds-hand") as HTMLDivElement

    const HOURLY_RATE = 12.5
    const WEEKLY_TARGET_HOURS = 20
    const SECONDS_IN_HOUR = 3600

    let currentEntry: TimeEntry | null = null

    // Update analog clock
    const updateAnalogClock = () => {
      const now = new Date()
      const hours = now.getHours() % 12
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      const hoursDegrees = hours * 30 + minutes * 0.5
      const minutesDegrees = minutes * 6
      const secondsDegrees = seconds * 6

      hoursHandEl.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`
      minutesHandEl.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`
      secondsHandEl.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`
    }

    // Update digital clock
    const updateDigitalClock = () => {
      const now = new Date()
      currentTimeEl.textContent = now.toLocaleTimeString()
      currentDateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    // Calculate earnings
    const calculateEarnings = (entries: TimeEntry[]) => {
      // Get current week's entries
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const weekEntries = entries.filter((entry) => new Date(entry.startTime) >= startOfWeek)

      // Calculate total hours
      const totalSeconds = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
      const totalHours = totalSeconds / SECONDS_IN_HOUR

      // Calculate regular and overtime hours
      const regularHours = Math.min(totalHours, WEEKLY_TARGET_HOURS)
      const overtimeHours = Math.max(0, totalHours - WEEKLY_TARGET_HOURS)

      // Calculate earnings
      const regularEarnings = regularHours * HOURLY_RATE
      const overtimeEarnings = overtimeHours * HOURLY_RATE * 1.5 // 1.5x for overtime
      const totalEarnings = regularEarnings + overtimeEarnings

      // Update progress bar
      const regularPercentage = (regularHours / WEEKLY_TARGET_HOURS) * 100
      const overtimePercentage = (overtimeHours / WEEKLY_TARGET_HOURS) * 100

      progressRegularEl.style.width = `${Math.min(regularPercentage, 100)}%`
      progressOvertimeEl.style.width = `${regularPercentage + overtimePercentage}%`
      progressTextEl.textContent = `${Math.round(regularPercentage + overtimePercentage)}%`

      return totalEarnings.toFixed(2)
    }

    // Update stats
    const updateStats = () => {
      const entries = getTimeEntries()

      // Calculate today's hours
      const today = new Date().toLocaleDateString()
      const todayEntries = entries.filter((entry) => new Date(entry.startTime).toLocaleDateString() === today)
      const todayDuration = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
      todayHoursEl.textContent = formatDuration(todayDuration)

      // Calculate this week's hours
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const weekEntries = entries.filter((entry) => new Date(entry.startTime) >= startOfWeek)
      const weekDuration = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
      weekHoursEl.textContent = formatDuration(weekDuration)

      // Calculate earnings
      const earnings = calculateEarnings(entries)
      earningsEl.textContent = `$${earnings}`
    }

    // Get time entries from localStorage
    const getTimeEntries = (): TimeEntry[] => {
      const entries = localStorage.getItem("timeEntries")
      return entries ? JSON.parse(entries) : []
    }

    // Save time entries to localStorage
    const saveTimeEntries = (entries: TimeEntry[]) => {
      localStorage.setItem("timeEntries", JSON.stringify(entries))
    }

    // Check if there's an active session
    const checkActiveSession = () => {
      const entries = getTimeEntries()
      const activeEntry = entries.find((entry) => !entry.endTime)

      if (activeEntry) {
        currentEntry = activeEntry
        clockInBtn.disabled = true
        clockOutBtn.disabled = false
      } else {
        currentEntry = null
        clockInBtn.disabled = false
        clockOutBtn.disabled = true
      }
    }

    // Clock in
    const clockIn = () => {
      const now = new Date()
      currentEntry = {
        id: generateId(),
        startTime: now.toISOString(),
      }

      const entries = getTimeEntries()
      entries.push(currentEntry)
      saveTimeEntries(entries)

      clockInBtn.disabled = true
      clockOutBtn.disabled = false
    }

    // Clock out
    const clockOut = () => {
      if (!currentEntry) return

      const now = new Date()
      const entries = getTimeEntries()
      const entryIndex = entries.findIndex((e) => e.id === currentEntry?.id)

      if (entryIndex !== -1) {
        const startTime = new Date(entries[entryIndex].startTime)
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000)

        entries[entryIndex] = {
          ...entries[entryIndex],
          endTime: now.toISOString(),
          duration,
        }

        saveTimeEntries(entries)
      }

      currentEntry = null
      clockInBtn.disabled = false
      clockOutBtn.disabled = true
      updateStats()
    }

    // Initialize
    updateDigitalClock()
    updateAnalogClock()
    setInterval(() => {
      updateDigitalClock()
      updateAnalogClock()
    }, 1000)
    checkActiveSession()
    updateStats()

    // Event listeners
    clockInBtn.addEventListener("click", clockIn)
    clockOutBtn.addEventListener("click", clockOut)

    return () => {
      clockInBtn.removeEventListener("click", clockIn)
      clockOutBtn.removeEventListener("click", clockOut)
    }
  }, [])

  return null
}
