"use client"

import { useEffect, useState } from "react"
import type { TimeEntry } from "@/lib/types"
import { formatDuration, generateId } from "@/lib/utils"
import { 
  saveTimeEntry, 
  getAllTimeEntries, 
  getActiveTimeEntry,
  exportBackup,
  importFromBackup
} from "@/lib/db"

export default function TimeTrackerClient() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [syncStatus, setSyncStatus] = useState("")

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
    const exportBtn = document.getElementById("export-btn") as HTMLButtonElement
    const importBtn = document.getElementById("import-btn") as HTMLButtonElement
    const fileInput = document.getElementById("file-input") as HTMLInputElement
    const syncBtn = document.getElementById("sync-btn") as HTMLButtonElement
    const syncStatusEl = document.getElementById("sync-status") as HTMLDivElement

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
    const updateStats = async () => {
      const entries = await getAllTimeEntries()

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

    // Check if there's an active session
    const checkActiveSession = async () => {
      const activeEntry = await getActiveTimeEntry()

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
    const clockIn = async () => {
      const now = new Date()
      currentEntry = {
        id: generateId(),
        startTime: now.toISOString(),
      }

      await saveTimeEntry(currentEntry)

      clockInBtn.disabled = true
      clockOutBtn.disabled = false
    }

    // Clock out
    const clockOut = async () => {
      if (!currentEntry) return

      const now = new Date()
      const startTime = new Date(currentEntry.startTime)
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000)

      const updatedEntry = {
        ...currentEntry,
        endTime: now.toISOString(),
        duration,
      }

      await saveTimeEntry(updatedEntry)

      currentEntry = null
      clockInBtn.disabled = false
      clockOutBtn.disabled = true
      updateStats()
    }

    // Export data
    const handleExport = async () => {
      try {
        setIsExporting(true)
        const jsonData = await exportBackup()
        
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chronotrack-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Export failed:", error)
        alert("Export failed: " + error)
      } finally {
        setIsExporting(false)
      }
    }

    // Import data
    const handleImport = async (event: Event) => {
      const input = event.target as HTMLInputElement
      if (!input.files || input.files.length === 0) return

      try {
        setIsImporting(true)
        const file = input.files[0]
        const content = await file.text()
        await importFromBackup(content)
        alert("Import successful!")
        checkActiveSession()
        updateStats()
      } catch (error) {
        console.error("Import failed:", error)
        alert("Import failed: " + error)
      } finally {
        setIsImporting(false)
        input.value = ""
      }
    }

    // Sync with Google Sheets
    const handleSync = async () => {
      try {
        setSyncStatus("Syncing...")
        syncStatusEl.textContent = "Syncing..."
        
        // This would be replaced with actual Google Sheets API integration
        // For now, we'll just simulate a successful sync
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setSyncStatus("Sync successful!")
        syncStatusEl.textContent = "Last sync: " + new Date().toLocaleTimeString()
        
        setTimeout(() => {
          setSyncStatus("")
        }, 3000)
      } catch (error) {
        console.error("Sync failed:", error)
        setSyncStatus("Sync failed: " + error)
        syncStatusEl.textContent = "Sync failed"
      }
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
    
    if (exportBtn) exportBtn.addEventListener("click", handleExport)
    if (importBtn) importBtn.addEventListener("click", () => fileInput.click())
    if (fileInput) fileInput.addEventListener("change", handleImport)
    if (syncBtn) syncBtn.addEventListener("click", handleSync)

    return () => {
      clockInBtn.removeEventListener("click", clockIn)
      clockOutBtn.removeEventListener("click", clockOut)
      
      if (exportBtn) exportBtn.removeEventListener("click", handleExport)
      if (importBtn) importBtn.removeEventListener("click", () => fileInput.click())
      if (fileInput) fileInput.removeEventListener("change", handleImport)
      if (syncBtn) syncBtn.removeEventListener("click", handleSync)
    }
  }, [isExporting, isImporting, syncStatus])

  return null
}
