"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, Award } from "lucide-react"
import Navbar from "@/components/navbar"
import styles from "./page.module.css"
import { useAuth } from "@/context/auth-context"

// Mock data - would be fetched from backend in real implementation
const weeklyData = [
  { day: "Mon", hours: 7.5, breaks: 0.5 },
  { day: "Tue", hours: 8.2, breaks: 0.75 },
  { day: "Wed", hours: 6.8, breaks: 1.0 },
  { day: "Thu", hours: 8.0, breaks: 0.5 },
  { day: "Fri", hours: 7.2, breaks: 0.75 },
  { day: "Sat", hours: 4.5, breaks: 0.25 },
  { day: "Sun", hours: 0, breaks: 0 },
]

const monthlyData = [
  { week: "Week 1", hours: 38.5, breaks: 3.0 },
  { week: "Week 2", hours: 42.0, breaks: 3.5 },
  { week: "Week 3", hours: 36.8, breaks: 2.8 },
  { week: "Week 4", hours: 40.2, breaks: 3.2 },
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("week")
  const [showBreaks, setShowBreaks] = useState(true)
  const chartRef = useRef(null)
  const { resetSessionTimeout } = useAuth()

  // Call resetSessionTimeout only once when the component mounts
  useEffect(() => {
    resetSessionTimeout()
  }, [resetSessionTimeout]) // resetSessionTimeout is now memoized, so this is safe

  // Calculate statistics
  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const totalBreaks = weeklyData.reduce((sum, day) => sum + day.breaks, 0)
  const averageHours = totalHours / weeklyData.filter((day) => day.hours > 0).length
  const maxHours = Math.max(...weeklyData.map((day) => day.hours))
  const streakDays = 5 // Mock data - would be calculated from actual data

  // Productivity score calculation (mock)
  const productivityScore = Math.round((averageHours / 8) * 100)

  // Draw circular progress chart
  useEffect(() => {
    if (!chartRef.current) return

    const canvas = chartRef.current
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.lineWidth = 15
    ctx.strokeStyle = "#333"
    ctx.stroke()

    // Draw progress arc
    const progress = productivityScore / 100
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI)
    ctx.lineWidth = 15
    ctx.lineCap = "round"
    ctx.strokeStyle = getScoreColor(productivityScore)
    ctx.stroke()

    // Draw text
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#f0f0f0"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${productivityScore}%`, centerX, centerY)

    ctx.font = "14px Arial"
    ctx.fillStyle = "#aaa"
    ctx.fillText("Productivity", centerX, centerY + 25)
  }, [productivityScore])

  const getScoreColor = (score) => {
    if (score >= 80) return "#4caf50"
    if (score >= 60) return "#e5b80b"
    return "#e63946"
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Analytics</h1>
      </header>

      <div className={styles.timeframeSelector}>
        <button
          className={`${styles.timeframeButton} ${timeframe === "week" ? styles.active : ""}`}
          onClick={() => setTimeframe("week")}
        >
          This Week
        </button>
        <button
          className={`${styles.timeframeButton} ${timeframe === "month" ? styles.active : ""}`}
          onClick={() => setTimeframe("month")}
        >
          This Month
        </button>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={20} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Hours</h3>
            <p>{totalHours.toFixed(1)}h</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.statInfo}>
            <h3>Daily Average</h3>
            <p>{averageHours.toFixed(1)}h</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Award size={20} />
          </div>
          <div className={styles.statInfo}>
            <h3>Streak</h3>
            <p>{streakDays} days</p>
          </div>
        </div>
      </div>

      <div className={styles.productivitySection}>
        <h2>Productivity Score</h2>
        <div className={styles.scoreContainer}>
          <canvas ref={chartRef} width={200} height={200} className={styles.scoreChart}></canvas>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2>{timeframe === "week" ? "Weekly Overview" : "Monthly Overview"}</h2>
          <label className={styles.toggleContainer}>
            <input
              type="checkbox"
              checked={showBreaks}
              onChange={() => setShowBreaks(!showBreaks)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleLabel}>Show Breaks</span>
          </label>
        </div>

        <div className={styles.chart}>
          {timeframe === "week"
            ? weeklyData.map((day, index) => (
                <div key={index} className={styles.chartColumn}>
                  {showBreaks && day.breaks > 0 && (
                    <motion.div
                      className={styles.breakBar}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.breaks / maxHours) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  )}
                  <motion.div
                    className={styles.chartBar}
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                      backgroundColor: day.hours === 0 ? "#333" : "#e5b80b",
                    }}
                  />
                  <div className={styles.chartLabel}>
                    <span>{day.day}</span>
                    <span className={styles.chartValue}>{day.hours > 0 ? `${day.hours}h` : "-"}</span>
                  </div>
                </div>
              ))
            : monthlyData.map((week, index) => (
                <div key={index} className={styles.chartColumn}>
                  {showBreaks && week.breaks > 0 && (
                    <motion.div
                      className={styles.breakBar}
                      initial={{ height: 0 }}
                      animate={{ height: `${(week.breaks / Math.max(...monthlyData.map((w) => w.hours))) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  )}
                  <motion.div
                    className={styles.chartBar}
                    initial={{ height: 0 }}
                    animate={{ height: `${(week.hours / Math.max(...monthlyData.map((w) => w.hours))) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <div className={styles.chartLabel}>
                    <span>{week.week}</span>
                    <span className={styles.chartValue}>{week.hours}h</span>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className={styles.heatmapContainer}>
        <h2>Work Pattern</h2>
        <div className={styles.heatmap}>
          <div className={styles.heatmapLabels}>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>
          <div className={styles.heatmapGrid}>
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className={styles.heatmapRow}>
                {Array.from({ length: 24 }).map((_, hourIndex) => {
                  // Generate random intensity for demo purposes
                  // In real app, this would be based on actual work data
                  const intensity = Math.random()
                  let opacity = 0

                  if (dayIndex < 5 && hourIndex >= 8 && hourIndex <= 18) {
                    opacity = intensity * 0.8
                  } else if ((dayIndex === 5 || dayIndex === 6) && hourIndex >= 10 && hourIndex <= 16) {
                    opacity = intensity * 0.4
                  }

                  return (
                    <div
                      key={hourIndex}
                      className={styles.heatmapCell}
                      style={{
                        backgroundColor: `rgba(229, 184, 11, ${opacity})`,
                      }}
                      title={`${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayIndex]} ${hourIndex}:00 - ${hourIndex + 1}:00`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heatmapLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ opacity: 0.2 }}></div>
            <span>Light activity</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ opacity: 0.5 }}></div>
            <span>Medium activity</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ opacity: 0.8 }}></div>
            <span>Heavy activity</span>
          </div>
        </div>
      </div>

      <Navbar activePage="analytics" />
    </div>
  )
}
