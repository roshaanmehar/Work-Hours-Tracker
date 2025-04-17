"use client"

import { useEffect, useState } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Clock, DollarSign, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export function DashboardStats() {
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Currently Active</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-500" />
            <div className="text-2xl font-bold">{activeShift ? formatDuration(activeHours) : "Not tracking"}</div>
          </div>
          {activeShift && (
            <p className="mt-1 text-xs text-slate-500">
              Started at {format(new Date(activeShift.startTime), "h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatDuration(todayStats.hours)}</div>
              <p className="text-xs text-slate-500">{formatMoney(todayStats.earnings)}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">This Week</CardTitle>
          <CardDescription className="text-xs">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatDuration(weekStats.hours)}</div>
              <p className="text-xs text-slate-500">{formatMoney(weekStats.earnings)}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">This Month</CardTitle>
          <CardDescription className="text-xs">{format(monthStart, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatDuration(monthStats.hours)}</div>
              <p className="text-xs text-slate-500">{formatMoney(monthStats.earnings)}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
