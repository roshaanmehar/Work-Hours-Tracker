"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  addMonths,
  startOfYear,
  endOfYear,
} from "date-fns"
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle, Calendar, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export default function AnalyticsPage() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  // Get date range based on selected period
  const getDateRange = () => {
    if (dateRange === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      }
    } else if (dateRange === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      }
    } else {
      return {
        start: startOfYear(currentDate),
        end: endOfYear(currentDate),
      }
    }
  }

  const { start, end } = getDateRange()

  // Navigate between periods
  const handlePrevious = () => {
    if (dateRange === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (dateRange === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))
    }
  }

  const handleNext = () => {
    if (dateRange === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (dateRange === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))
    }
  }

  // Prepare data for charts
  const prepareChartData = () => {
    if (dateRange === "week") {
      const days = eachDayOfInterval({ start, end })
      return days.map((day) => {
        const dayShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.startTime)
          return (
            shiftDate.getDate() === day.getDate() &&
            shiftDate.getMonth() === day.getMonth() &&
            shiftDate.getFullYear() === day.getFullYear()
          )
        })

        const hours = dayShifts.reduce((acc, shift) => {
          if (shift.endTime) {
            return acc + calculateDuration(shift.startTime, shift.endTime)
          }
          return acc
        }, 0)

        return {
          date: format(day, "EEE"),
          hours,
          earnings: hours * 12.5,
        }
      })
    } else if (dateRange === "month") {
      const days = eachDayOfInterval({ start, end })
      return days.map((day) => {
        const dayShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.startTime)
          return (
            shiftDate.getDate() === day.getDate() &&
            shiftDate.getMonth() === day.getMonth() &&
            shiftDate.getFullYear() === day.getFullYear()
          )
        })

        const hours = dayShifts.reduce((acc, shift) => {
          if (shift.endTime) {
            return acc + calculateDuration(shift.startTime, shift.endTime)
          }
          return acc
        }, 0)

        return {
          date: format(day, "d"),
          hours,
          earnings: hours * 12.5,
        }
      })
    } else {
      const months = eachMonthOfInterval({ start, end })
      return months.map((month) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        const monthShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.startTime)
          return shiftDate >= monthStart && shiftDate <= monthEnd
        })

        const hours = monthShifts.reduce((acc, shift) => {
          if (shift.endTime) {
            return acc + calculateDuration(shift.startTime, shift.endTime)
          }
          return acc
        }, 0)

        return {
          date: format(month, "MMM"),
          hours,
          earnings: hours * 12.5,
        }
      })
    }
  }

  const chartData = prepareChartData()

  // Calculate totals
  const totalHours = chartData.reduce((acc, item) => acc + item.hours, 0)
  const totalEarnings = totalHours * 12.5
  const averageHoursPerDay = totalHours / chartData.length || 0

  // Calculate period label
  const getPeriodLabel = () => {
    if (dateRange === "week") {
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    } else if (dateRange === "month") {
      return format(start, "MMMM yyyy")
    } else {
      return format(start, "yyyy")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="container flex h-16 items-center">
          <Link
            href="/dashboard"
            className="mr-4 flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">
        <Card>
          <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Work Analytics</CardTitle>
              <CardDescription>Visualize your work patterns and earnings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ArrowLeftCircle className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">{getPeriodLabel()}</span>
              </div>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <Tabs defaultValue="week" value={dateRange} onValueChange={setDateRange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(totalHours)}</div>
                  <p className="text-xs text-slate-500">Avg: {formatDuration(averageHoursPerDay)}/day</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(totalEarnings)}</div>
                  <p className="text-xs text-slate-500">Rate: £12.50/hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{chartData.filter((d) => d.hours > 0).length} days</div>
                  <p className="text-xs text-slate-500">
                    {Math.round((chartData.filter((d) => d.hours > 0).length / chartData.length) * 100)}% of period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">Hours Worked</h3>
                <div className="h-[300px] w-full rounded-xl bg-white p-4 dark:bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(2)} hours`, "Hours"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium">Earnings</h3>
                <div className="h-[300px] w-full rounded-xl bg-white p-4 dark:bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`£${value.toFixed(2)}`, "Earnings"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
