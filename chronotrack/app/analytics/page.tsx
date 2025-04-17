"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import type { TimeEntry } from "@/lib/types"
import { formatDuration } from "@/lib/utils"

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; hours: number; earnings: number }>>([])
  const [monthlyData, setMonthlyData] = useState<Array<{ day: number; hours: number; earnings: number }>>([])
  const [stats, setStats] = useState({
    totalHours: 0,
    weeklyHours: 0,
    monthlyHours: 0,
    averagePerDay: 0,
    totalEarnings: 0,
    regularHours: 0,
    overtimeHours: 0,
    regularEarnings: 0,
    overtimeEarnings: 0,
  })
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly")

  const HOURLY_RATE = 12.5
  const WEEKLY_TARGET_HOURS = 20

  useEffect(() => {
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const parsedEntries = JSON.parse(storedEntries) as TimeEntry[]
      setEntries(parsedEntries)

      // Process data for charts and stats
      processData(parsedEntries)
    }
  }, [])

  const processData = (entries: TimeEntry[]) => {
    const now = new Date()

    // Weekly data
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayOfWeek = now.getDay()

    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - ((dayOfWeek - i + 7) % 7))
      return {
        date: d,
        day: days[i],
        hours: 0,
        earnings: 0,
      }
    })

    // Monthly data
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const monthData = Array.from({ length: daysInMonth }, (_, i) => {
      return {
        date: new Date(currentYear, currentMonth, i + 1),
        day: i + 1,
        hours: 0,
        earnings: 0,
      }
    })

    // Calculate stats
    let totalDuration = 0
    let weeklyDuration = 0
    let monthlyDuration = 0
    const daysWithEntries = new Set()

    // Start of week and month
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Process entries
    entries.forEach((entry) => {
      const entryDate = new Date(entry.startTime)
      const duration = entry.duration || 0
      const hours = duration / 3600
      const earnings = hours * HOURLY_RATE

      // Total stats
      totalDuration += duration
      daysWithEntries.add(entryDate.toLocaleDateString())

      // Weekly stats
      if (entryDate >= startOfWeek) {
        weeklyDuration += duration

        const dayIndex = entryDate.getDay()
        weekData[dayIndex].hours += hours
        weekData[dayIndex].earnings += earnings
      }

      // Monthly stats
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        monthlyDuration += duration

        const dayIndex = entryDate.getDate() - 1
        monthData[dayIndex].hours += hours
        monthData[dayIndex].earnings += earnings
      }
    })

    // Calculate regular and overtime hours
    const weeklyHours = weeklyDuration / 3600
    const regularHours = Math.min(weeklyHours, WEEKLY_TARGET_HOURS)
    const overtimeHours = Math.max(0, weeklyHours - WEEKLY_TARGET_HOURS)

    // Calculate earnings
    const regularEarnings = regularHours * HOURLY_RATE
    const overtimeEarnings = overtimeHours * HOURLY_RATE * 1.5
    const totalEarnings = regularEarnings + overtimeEarnings

    // Set state
    setWeeklyData(weekData)
    setMonthlyData(monthData)
    setStats({
      totalHours: totalDuration / 3600,
      weeklyHours: weeklyDuration / 3600,
      monthlyHours: monthlyDuration / 3600,
      averagePerDay: daysWithEntries.size > 0 ? totalDuration / daysWithEntries.size / 3600 : 0,
      totalEarnings,
      regularHours,
      overtimeHours,
      regularEarnings,
      overtimeEarnings,
    })
  }

  const getMaxValue = () => {
    if (activeTab === "weekly") {
      return Math.max(...weeklyData.map((d) => d.hours)) + 1
    } else {
      return Math.max(...monthlyData.map((d) => d.hours)) + 1
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.grid}>
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className={styles.gridCell} style={{ animationDelay: `${Math.random() * 5}s` }} />
          ))}
        </div>
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <h1 className={styles.title}>Analytics</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatDuration(stats.weeklyHours * 3600)}</div>
            <div className={styles.statLabel}>This Week</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>${stats.totalEarnings.toFixed(2)}</div>
            <div className={styles.statLabel}>Earnings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatDuration(stats.averagePerDay * 3600)}</div>
            <div className={styles.statLabel}>Avg/Day</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatDuration(stats.monthlyHours * 3600)}</div>
            <div className={styles.statLabel}>This Month</div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2>Time Analysis</h2>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "weekly" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("weekly")}
              >
                Weekly
              </button>
              <button
                className={`${styles.tab} ${activeTab === "monthly" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className={styles.chartContainer}>
            {activeTab === "weekly" ? (
              <div className={styles.chart}>
                <div className={styles.chartYAxis}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.chartYLabel}>
                      {Math.round((getMaxValue() / 5) * (4 - i))}h
                    </div>
                  ))}
                </div>
                <div className={styles.chartBars}>
                  {weeklyData.map((day, i) => (
                    <div key={i} className={styles.chartBarGroup}>
                      <div
                        className={styles.chartBar}
                        style={{
                          height: `${(day.hours / getMaxValue()) * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        <div className={styles.chartTooltip}>
                          <div>{formatDuration(day.hours * 3600)}</div>
                          <div>${day.earnings.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className={styles.chartXLabel}>{day.day.substring(0, 3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.chart}>
                <div className={styles.chartYAxis}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.chartYLabel}>
                      {Math.round((getMaxValue() / 5) * (4 - i))}h
                    </div>
                  ))}
                </div>
                <div className={styles.chartBars}>
                  {monthlyData.map((day, i) => (
                    <div key={i} className={styles.chartBarGroup}>
                      <div
                        className={styles.chartBar}
                        style={{
                          height: `${(day.hours / getMaxValue()) * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      >
                        <div className={styles.chartTooltip}>
                          <div>{formatDuration(day.hours * 3600)}</div>
                          <div>${day.earnings.toFixed(2)}</div>
                        </div>
                      </div>
                      {i % 5 === 0 && <div className={styles.chartXLabel}>{day.day}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.earningsCard}>
          <h2>Weekly Earnings Breakdown</h2>
          <div className={styles.earningsBreakdown}>
            <div className={styles.earningsItem}>
              <div className={styles.earningsLabel}>Regular Hours ({stats.regularHours.toFixed(1)}h)</div>
              <div className={styles.earningsValue}>${stats.regularEarnings.toFixed(2)}</div>
            </div>
            <div className={styles.earningsItem}>
              <div className={styles.earningsLabel}>Overtime Hours ({stats.overtimeHours.toFixed(1)}h)</div>
              <div className={styles.earningsValue}>${stats.overtimeEarnings.toFixed(2)}</div>
            </div>
            <div className={`${styles.earningsItem} ${styles.earningsTotal}`}>
              <div className={styles.earningsLabel}>Total</div>
              <div className={styles.earningsValue}>${stats.totalEarnings.toFixed(2)}</div>
            </div>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>Weekly Target: {WEEKLY_TARGET_HOURS}h</span>
              <span>{Math.round((stats.weeklyHours / WEEKLY_TARGET_HOURS) * 100)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressRegular}
                style={{ width: `${Math.min((stats.regularHours / WEEKLY_TARGET_HOURS) * 100, 100)}%` }}
              ></div>
              <div
                className={styles.progressOvertime}
                style={{ width: `${Math.min((stats.weeklyHours / WEEKLY_TARGET_HOURS) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
