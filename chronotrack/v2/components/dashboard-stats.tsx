"use client"

import { useEffect, useState } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export default function DashboardStats() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  // Get today's shifts
  const today = new Date()
  const todayShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime)
    return (
      shiftDate.getDate() === today.getDate() &&
      shiftDate.getMonth() === today.getMonth() &&
      shiftDate.getFullYear() === today.getFullYear()
    )
  })

  // Get this week's shifts
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime)
    return shiftDate >= weekStart && shiftDate <= weekEnd
  })

  // Get this month's shifts
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const monthShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime)
    return shiftDate >= monthStart && shiftDate <= monthEnd
  })

  // Calculate hours and earnings
  const calculateStats = (shiftsArray) => {
    const hours = shiftsArray.reduce((acc, shift) => {
      if (shift.endTime) {
        return acc + calculateDuration(shift.startTime, shift.endTime)
      }
      return acc
    }, 0)

    return {
      hours,
      earnings: hours * 12.5,
    }
  }

  const todayStats = calculateStats(todayShifts)
  const weekStats = calculateStats(weekShifts)
  const monthStats = calculateStats(monthShifts)

  // Calculate active shift if any
  const activeShift = shifts.find((shift) => !shift.endTime)
  const activeHours = activeShift ? calculateDuration(activeShift.startTime, new Date().toISOString()) : 0

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Currently Active</div>
        <div className="stat-value">{activeShift ? formatDuration(activeHours) : "Not tracking"}</div>
        {activeShift && (
          <div style={{ fontSize: "0.75rem", opacity: "0.7" }}>
            Started at {format(new Date(activeShift.startTime), "h:mm a")}
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label">Today</div>
        <div className="stat-value">{formatDuration(todayStats.hours)}</div>
        <div style={{ fontSize: "0.875rem", opacity: "0.7" }}>{formatMoney(todayStats.earnings)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">This Week</div>
        <div className="stat-value">{formatDuration(weekStats.hours)}</div>
        <div style={{ fontSize: "0.875rem", opacity: "0.7" }}>{formatMoney(weekStats.earnings)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">This Month</div>
        <div className="stat-value">{formatDuration(monthStats.hours)}</div>
        <div style={{ fontSize: "0.875rem", opacity: "0.7" }}>{formatMoney(monthStats.earnings)}</div>
      </div>
    </div>
  )
}
