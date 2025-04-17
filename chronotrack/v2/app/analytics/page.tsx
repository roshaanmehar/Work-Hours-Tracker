"use client"

import { useEffect, useState, useRef } from "react"
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
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"
import ThemeToggle from "@/components/theme-toggle"

export default function AnalyticsPage() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)
  const hoursChartRef = useRef(null)
  const earningsChartRef = useRef(null)

  useEffect(() => {
    loadData()
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadData])

  useEffect(() => {
    if (mounted && shifts.length > 0) {
      renderCharts()
    }
  }, [mounted, shifts, dateRange, currentDate])

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
          fullDate: format(day, "yyyy-MM-dd"),
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
          fullDate: format(day, "yyyy-MM-dd"),
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
          fullDate: format(month, "yyyy-MM"),
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

  // Render charts using canvas
  const renderCharts = () => {
    if (!hoursChartRef.current || !earningsChartRef.current) return

    const hoursCanvas = hoursChartRef.current
    const earningsCanvas = earningsChartRef.current
    const hoursCtx = hoursCanvas.getContext("2d")
    const earningsCtx = earningsCanvas.getContext("2d")

    // Clear canvases
    hoursCtx.clearRect(0, 0, hoursCanvas.width, hoursCanvas.height)
    earningsCtx.clearRect(0, 0, earningsCanvas.width, earningsCanvas.height)

    // Set canvas dimensions
    const canvasWidth = hoursCanvas.width
    const canvasHeight = hoursCanvas.height
    const padding = 40
    const chartWidth = canvasWidth - padding * 2
    const chartHeight = canvasHeight - padding * 2

    // Find max values
    const maxHours = Math.max(...chartData.map((d) => d.hours), 8) // At least 8 hours for scale
    const maxEarnings = Math.max(...chartData.map((d) => d.earnings), 100) // At least £100 for scale

    // Draw hours chart
    hoursCtx.fillStyle = "#f8f5f0"
    hoursCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw axes
    hoursCtx.strokeStyle = "#d0c8b0"
    hoursCtx.lineWidth = 1
    hoursCtx.beginPath()
    hoursCtx.moveTo(padding, padding)
    hoursCtx.lineTo(padding, canvasHeight - padding)
    hoursCtx.lineTo(canvasWidth - padding, canvasHeight - padding)
    hoursCtx.stroke()

    // Draw bars
    const barWidth = chartWidth / chartData.length - 10

    chartData.forEach((item, index) => {
      const x = padding + index * (chartWidth / chartData.length) + (chartWidth / chartData.length - barWidth) / 2
      const barHeight = (item.hours / maxHours) * chartHeight
      const y = canvasHeight - padding - barHeight

      // Create gradient
      const gradient = hoursCtx.createLinearGradient(x, y, x, canvasHeight - padding)
      gradient.addColorStop(0, "#8b0000")
      gradient.addColorStop(1, "#d4af37")

      hoursCtx.fillStyle = gradient
      hoursCtx.fillRect(x, y, barWidth, barHeight)

      // Add labels
      hoursCtx.fillStyle = "#1a1814"
      hoursCtx.font = "12px var(--font-sans)"
      hoursCtx.textAlign = "center"
      hoursCtx.fillText(item.date, x + barWidth / 2, canvasHeight - padding + 20)

      if (item.hours > 0) {
        hoursCtx.fillText(item.hours.toFixed(1), x + barWidth / 2, y - 10)
      }
    })

    // Draw title
    hoursCtx.fillStyle = "#1a1814"
    hoursCtx.font = "16px var(--font-serif)"
    hoursCtx.textAlign = "center"
    hoursCtx.fillText("Hours Worked", canvasWidth / 2, 20)

    // Draw earnings chart (line chart)
    earningsCtx.fillStyle = "#f8f5f0"
    earningsCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw axes
    earningsCtx.strokeStyle = "#d0c8b0"
    earningsCtx.lineWidth = 1
    earningsCtx.beginPath()
    earningsCtx.moveTo(padding, padding)
    earningsCtx.lineTo(padding, canvasHeight - padding)
    earningsCtx.lineTo(canvasWidth - padding, canvasHeight - padding)
    earningsCtx.stroke()

    // Draw line
    earningsCtx.strokeStyle = "#d4af37"
    earningsCtx.lineWidth = 2
    earningsCtx.beginPath()

    chartData.forEach((item, index) => {
      const x = padding + index * (chartWidth / chartData.length) + chartWidth / chartData.length / 2
      const y = canvasHeight - padding - (item.earnings / maxEarnings) * chartHeight

      if (index === 0) {
        earningsCtx.moveTo(x, y)
      } else {
        earningsCtx.lineTo(x, y)
      }

      // Add data points
      earningsCtx.fillStyle = "#8b0000"
      earningsCtx.beginPath()
      earningsCtx.arc(x, y, 4, 0, Math.PI * 2)
      earningsCtx.fill()

      // Add labels
      earningsCtx.fillStyle = "#1a1814"
      earningsCtx.font = "12px var(--font-sans)"
      earningsCtx.textAlign = "center"
      earningsCtx.fillText(item.date, x, canvasHeight - padding + 20)

      if (item.earnings > 0) {
        earningsCtx.fillText(`£${item.earnings.toFixed(2)}`, x, y - 10)
      }
    })

    earningsCtx.stroke()

    // Draw title
    earningsCtx.fillStyle = "#1a1814"
    earningsCtx.font = "16px var(--font-serif)"
    earningsCtx.textAlign = "center"
    earningsCtx.fillText("Earnings", canvasWidth / 2, 20)
  }

  return (
    <div className="page">
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="container header-content">
          <Link href="/dashboard" className="logo">
            <div className="logo-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className="logo-text">Tempus</span>
          </Link>
          <nav className="nav">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/history" className="nav-link">
              History
            </Link>
            <Link href="/analytics" className="nav-link active">
              Analytics
            </Link>
            <Link href="/settings" className="nav-link">
              Settings
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="card baroque-border">
            <div className="ornament ornament-1"></div>
            <div className="ornament ornament-2"></div>
            <div className="card-header">
              <h2 className="card-title">Work Analytics</h2>
              <p className="card-description">Visualize your work patterns and earnings</p>
            </div>
            <div className="card-content">
              <div className="tabs">
                <div className={`tab ${dateRange === "week" ? "active" : ""}`} onClick={() => setDateRange("week")}>
                  Week
                </div>
                <div className={`tab ${dateRange === "month" ? "active" : ""}`} onClick={() => setDateRange("month")}>
                  Month
                </div>
                <div className={`tab ${dateRange === "year" ? "active" : ""}`} onClick={() => setDateRange("year")}>
                  Year
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  margin: "1rem 0",
                }}
              >
                <button className="button button-secondary" onClick={handlePrevious}>
                  Previous
                </button>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem" }}>{getPeriodLabel()}</div>
                <button className="button button-secondary" onClick={handleNext}>
                  Next
                </button>
              </div>

              <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                <div className="stat-card">
                  <div className="stat-label">Total Hours</div>
                  <div className="stat-value">{formatDuration(totalHours)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Earnings</div>
                  <div className="stat-value">{formatMoney(totalEarnings)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Hours</div>
                  <div className="stat-value">{formatDuration(averageHoursPerDay)}</div>
                </div>
              </div>

              <div className="chart-container">
                <canvas ref={hoursChartRef} width="800" height="300"></canvas>
              </div>

              <div className="chart-container">
                <canvas ref={earningsChartRef} width="800" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="baroque-divider"></div>
          <p>&copy; {new Date().getFullYear()} Tempus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
