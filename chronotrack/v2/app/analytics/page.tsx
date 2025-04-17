"use client"

import { useEffect, useState, useRef } from "react"
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
import LuciferHeader from "@/components/lucifer-header"
import LuciferFooter from "@/components/lucifer-footer"

export default function AnalyticsPage() {
  const { shifts, hourlyRate } = useTimeStore()
  const [dateRange, setDateRange] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const hoursChartRef = useRef<HTMLCanvasElement>(null)
  const earningsChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (shifts.length > 0) {
      renderCharts()
    }
  }, [shifts, dateRange, currentDate])

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
          earnings: hours * hourlyRate,
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
          earnings: hours * hourlyRate,
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
          earnings: hours * hourlyRate,
        }
      })
    }
  }

  const chartData = prepareChartData()

  // Calculate totals
  const totalHours = chartData.reduce((acc, item) => acc + item.hours, 0)
  const totalEarnings = totalHours * hourlyRate
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

  // Render charts using canvas with chiaroscuro effect
  const renderCharts = () => {
    if (!hoursChartRef.current || !earningsChartRef.current) return

    const hoursCanvas = hoursChartRef.current
    const earningsCanvas = earningsChartRef.current
    const hoursCtx = hoursCanvas.getContext("2d")
    const earningsCtx = earningsCanvas.getContext("2d")

    if (!hoursCtx || !earningsCtx) return

    // Clear canvases
    hoursCtx.clearRect(0, 0, hoursCanvas.width, hoursCanvas.height)
    earningsCtx.clearRect(0, 0, earningsCanvas.width, earningsCanvas.height)

    // Set canvas dimensions
    const canvasWidth = hoursCanvas.width
    const canvasHeight = hoursCanvas.height
    const padding = 60
    const chartWidth = canvasWidth - padding * 2
    const chartHeight = canvasHeight - padding * 2

    // Find max values
    const maxHours = Math.max(...chartData.map((d) => d.hours), 8) // At least 8 hours for scale
    const maxEarnings = Math.max(...chartData.map((d) => d.earnings), 100) // At least £100 for scale

    // Draw hours chart with chiaroscuro effect
    hoursCtx.fillStyle = "#121218" // Dark background
    hoursCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add dramatic lighting effect (chiaroscuro)
    const gradient = hoursCtx.createRadialGradient(
      canvasWidth * 0.3,
      canvasHeight * 0.3,
      0,
      canvasWidth * 0.3,
      canvasHeight * 0.3,
      canvasWidth * 0.7,
    )
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)")
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.05)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    hoursCtx.fillStyle = gradient
    hoursCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add pentagram pattern (very subtle)
    const patternImg = new Image()
    patternImg.crossOrigin = "anonymous"
    patternImg.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20,0 L24,16 L40,16 L28,26 L32,40 L20,32 L8,40 L12,26 L0,16 L16,16 Z' fill='%23d4af37' fillOpacity='0.03'/%3E%3C/svg%3E"

    patternImg.onload = () => {
      const pattern = hoursCtx.createPattern(patternImg, "repeat")
      if (pattern) {
        hoursCtx.fillStyle = pattern
        hoursCtx.globalAlpha = 0.1
        hoursCtx.fillRect(0, 0, canvasWidth, canvasHeight)
        hoursCtx.globalAlpha = 1.0
      }

      // Draw axes
      hoursCtx.strokeStyle = "#3a3428"
      hoursCtx.lineWidth = 1
      hoursCtx.beginPath()
      hoursCtx.moveTo(padding, padding)
      hoursCtx.lineTo(padding, canvasHeight - padding)
      hoursCtx.lineTo(canvasWidth - padding, canvasHeight - padding)
      hoursCtx.stroke()

      // Draw bars with dramatic lighting
      const barWidth = chartWidth / chartData.length - 10

      chartData.forEach((item, index) => {
        const x = padding + index * (chartWidth / chartData.length) + (chartWidth / chartData.length - barWidth) / 2
        const barHeight = (item.hours / maxHours) * chartHeight
        const y = canvasHeight - padding - barHeight

        // Create gradient for chiaroscuro effect
        const barGradient = hoursCtx.createLinearGradient(x, y, x + barWidth, y + barHeight)
        barGradient.addColorStop(0, "#8b0000") // Dark red
        barGradient.addColorStop(0.5, "#a52a2a") // Medium red
        barGradient.addColorStop(1, "#d4af37") // Gold

        hoursCtx.fillStyle = barGradient
        hoursCtx.fillRect(x, y, barWidth, barHeight)

        // Add highlight to create depth
        hoursCtx.fillStyle = "rgba(255, 255, 255, 0.2)"
        hoursCtx.fillRect(x, y, barWidth * 0.3, barHeight)

        // Add labels
        hoursCtx.fillStyle = "#f8f5f0"
        hoursCtx.font = "12px var(--font-sans)"
        hoursCtx.textAlign = "center"
        hoursCtx.fillText(item.date, x + barWidth / 2, canvasHeight - padding + 20)

        if (item.hours > 0) {
          hoursCtx.fillText(item.hours.toFixed(1), x + barWidth / 2, y - 10)
        }
      })

      // Draw title with dramatic shadow
      hoursCtx.fillStyle = "#d4af37"
      hoursCtx.font = "16px var(--font-serif)"
      hoursCtx.textAlign = "center"
      hoursCtx.shadowColor = "rgba(212, 175, 55, 0.5)"
      hoursCtx.shadowBlur = 10
      hoursCtx.fillText("Hours Worked", canvasWidth / 2, 40)
      hoursCtx.shadowBlur = 0

      // Hidden pentagram in chart (very subtle)
      hoursCtx.fillStyle = "rgba(139, 0, 0, 0.05)"
      hoursCtx.font = "40px serif"
      hoursCtx.fillText("⛧", canvasWidth / 2, canvasHeight / 2)
    }

    // Draw earnings chart with chiaroscuro effect
    earningsCtx.fillStyle = "#121218" // Dark background
    earningsCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add dramatic lighting effect (chiaroscuro)
    const earningsGradient = earningsCtx.createRadialGradient(
      canvasWidth * 0.7,
      canvasHeight * 0.3,
      0,
      canvasWidth * 0.7,
      canvasHeight * 0.3,
      canvasWidth * 0.7,
    )
    earningsGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)")
    earningsGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.05)")
    earningsGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    earningsCtx.fillStyle = earningsGradient
    earningsCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add pentagram pattern (very subtle)
    const earningsPatternImg = new Image()
    earningsPatternImg.crossOrigin = "anonymous"
    earningsPatternImg.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20,0 L24,16 L40,16 L28,26 L32,40 L20,32 L8,40 L12,26 L0,16 L16,16 Z' fill='%23d4af37' fillOpacity='0.03'/%3E%3C/svg%3E"

    earningsPatternImg.onload = () => {
      const pattern = earningsCtx.createPattern(earningsPatternImg, "repeat")
      if (pattern) {
        earningsCtx.fillStyle = pattern
        earningsCtx.globalAlpha = 0.1
        earningsCtx.fillRect(0, 0, canvasWidth, canvasHeight)
        earningsCtx.globalAlpha = 1.0
      }

      // Draw axes
      earningsCtx.strokeStyle = "#3a3428"
      earningsCtx.lineWidth = 1
      earningsCtx.beginPath()
      earningsCtx.moveTo(padding, padding)
      earningsCtx.lineTo(padding, canvasHeight - padding)
      earningsCtx.lineTo(canvasWidth - padding, canvasHeight - padding)
      earningsCtx.stroke()

      // Draw line with dramatic lighting
      earningsCtx.strokeStyle = "#d4af37"
      earningsCtx.lineWidth = 3
      earningsCtx.beginPath()

      // Add shadow for dramatic effect
      earningsCtx.shadowColor = "rgba(212, 175, 55, 0.5)"
      earningsCtx.shadowBlur = 10

      chartData.forEach((item, index) => {
        const x = padding + index * (chartWidth / chartData.length) + chartWidth / chartData.length / 2
        const y = canvasHeight - padding - (item.earnings / maxEarnings) * chartHeight

        if (index === 0) {
          earningsCtx.moveTo(x, y)
        } else {
          earningsCtx.lineTo(x, y)
        }
      })

      earningsCtx.stroke()
      earningsCtx.shadowBlur = 0

      // Add data points with glow effect
      chartData.forEach((item, index) => {
        const x = padding + index * (chartWidth / chartData.length) + chartWidth / chartData.length / 2
        const y = canvasHeight - padding - (item.earnings / maxEarnings) * chartHeight

        // Glow effect
        earningsCtx.shadowColor = "rgba(212, 175, 55, 0.7)"
        earningsCtx.shadowBlur = 15
        earningsCtx.fillStyle = "#8b0000"
        earningsCtx.beginPath()
        earningsCtx.arc(x, y, 5, 0, Math.PI * 2)
        earningsCtx.fill()
        earningsCtx.shadowBlur = 0

        // Add labels
        earningsCtx.fillStyle = "#f8f5f0"
        earningsCtx.font = "12px var(--font-sans)"
        earningsCtx.textAlign = "center"
        earningsCtx.fillText(item.date, x, canvasHeight - padding + 20)

        if (item.earnings > 0) {
          earningsCtx.fillText(`£${item.earnings.toFixed(2)}`, x, y - 15)
        }
      })

      // Draw title with dramatic shadow
      earningsCtx.fillStyle = "#d4af37"
      earningsCtx.font = "16px var(--font-serif)"
      earningsCtx.textAlign = "center"
      earningsCtx.shadowColor = "rgba(212, 175, 55, 0.5)"
      earningsCtx.shadowBlur = 10
      earningsCtx.fillText("Earnings", canvasWidth / 2, 40)
      earningsCtx.shadowBlur = 0

      // Hidden feather in chart (very subtle)
      earningsCtx.fillStyle = "rgba(212, 175, 55, 0.05)"
      earningsCtx.beginPath()
      earningsCtx.moveTo(canvasWidth / 2, canvasHeight / 2 - 20)
      earningsCtx.bezierCurveTo(
        canvasWidth / 2 + 20,
        canvasHeight / 2,
        canvasWidth / 2 - 20,
        canvasHeight / 2 + 20,
        canvasWidth / 2,
        canvasHeight / 2 + 40,
      )
      earningsCtx.fill()
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <LuciferHeader activePage="analytics" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="card lucifer-border chiaroscuro p-8">
            <div className="hidden-message absolute top-4 right-4">Numbers are the language of the divine</div>
            <div className="hidden-message absolute bottom-4 left-4">Time is the currency of mortality</div>

            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Work Analytics</h2>
              <p className="text-lg opacity-70 italic">Visualize your work patterns and earnings</p>
            </div>

            <div className="flex border-b border-[#d4af37] mb-6">
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${dateRange === "week" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setDateRange("week")}
              >
                Week
              </div>
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${dateRange === "month" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setDateRange("month")}
              >
                Month
              </div>
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${dateRange === "year" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setDateRange("year")}
              >
                Year
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 mb-6">
              <button
                className="hellfire-btn bg-transparent border border-[#d4af37] px-4 py-2 text-foreground hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-300"
                onClick={handlePrevious}
              >
                Previous
              </button>
              <div className="font-serif text-xl text-[#d4af37]">{getPeriodLabel()}</div>
              <button
                className="hellfire-btn bg-transparent border border-[#d4af37] px-4 py-2 text-foreground hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-300"
                onClick={handleNext}
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="stat-card chiaroscuro">
                <div className="stat-label">Total Hours</div>
                <div className="stat-value">{formatDuration(totalHours)}</div>
              </div>
              <div className="stat-card chiaroscuro">
                <div className="stat-label">Total Earnings</div>
                <div className="stat-value">{formatMoney(totalEarnings)}</div>
              </div>
              <div className="stat-card chiaroscuro">
                <div className="stat-label">Average Hours</div>
                <div className="stat-value">{formatDuration(averageHoursPerDay)}</div>
              </div>
            </div>

            <div className="relative border border-[#d4af37] p-4 mb-8 chiaroscuro">
              <canvas ref={hoursChartRef} width="800" height="300"></canvas>
            </div>

            <div className="relative border border-[#d4af37] p-4 chiaroscuro">
              <canvas ref={earningsChartRef} width="800" height="300"></canvas>
            </div>
          </div>
        </div>
      </main>

      <LuciferFooter />
    </div>
  )
}
