"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Clock, Calendar } from "lucide-react"
import Navbar from "@/components/navbar"
import { useAuth } from "@/context/auth-context"
import { useTimeEntries } from "@/hooks/use-data"
import type { TimeEntry, Break } from "@/types/supabase"
import styles from "./page.module.css"

export default function HistoryPage() {
  const { authenticated, resetSessionTimeout } = useAuth()
  const { data: timeEntries, isLoading, error, refresh } = useTimeEntries()
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [dateRange, setDateRange] = useState("week")

  // Call resetSessionTimeout only once when the component mounts
  useEffect(() => {
    if (authenticated) {
      resetSessionTimeout()
    }
  }, [authenticated, resetSessionTimeout])

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  // Filter entries based on date range
  const filteredEntries = timeEntries?.filter((entry) => {
    const entryDate = new Date(entry.date)

    if (dateRange === "week") {
      // Current week (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    } else if (dateRange === "month") {
      // Current month (last 30 days)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return entryDate >= monthAgo
    }

    return true // "all" filter
  })

  // Group entries by date
  const entriesByDate =
    filteredEntries?.reduce(
      (acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(entry)
        return acc
      },
      {} as Record<string, TimeEntry[]>,
    ) || {}

  // Sort dates in descending order
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Time History</h1>
        </header>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading time entries...</p>
        </div>
        <Navbar activePage="history" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Time History</h1>
        </header>
        <div className={styles.errorState}>
          <p>Error loading time entries: {error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
        <Navbar activePage="history" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Time History</h1>
        <div className={styles.headerActions}>
          <button
            className={`${styles.filterButton} ${dateRange === "week" ? styles.active : ""}`}
            onClick={() => setDateRange("week")}
          >
            <span>This Week</span>
          </button>
          <button
            className={`${styles.filterButton} ${dateRange === "month" ? styles.active : ""}`}
            onClick={() => setDateRange("month")}
          >
            <span>This Month</span>
          </button>
          <button
            className={`${styles.filterButton} ${dateRange === "all" ? styles.active : ""}`}
            onClick={() => setDateRange("all")}
          >
            <span>All Time</span>
          </button>
        </div>
      </header>

      <div className={styles.entriesList}>
        {sortedDates.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} />
            <p>No time entries found</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <Calendar size={16} />
                <h2>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
              </div>

              {entriesByDate[date].map((entry) => (
                <motion.div
                  key={entry.id}
                  className={styles.entryCard}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.entryHeader} onClick={() => toggleExpand(entry.id)}>
                    <div className={styles.entryTime}>
                      <span className={styles.timeRange}>
                        {entry.clock_in} - {entry.clock_out || "In Progress"}
                      </span>
                      <span className={styles.duration}>{entry.duration || "Calculating..."}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedEntry === entry.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.expandIcon}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {expandedEntry === entry.id && (
                      <motion.div
                        className={styles.entryDetails}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {entry.breaks && Array.isArray(entry.breaks) && entry.breaks.length > 0 && (
                          <div className={styles.breaksList}>
                            <h4>Breaks ({entry.breaks.length})</h4>
                            {(entry.breaks as Break[]).map((breakItem, index) => (
                              <div key={index} className={styles.breakItem}>
                                <span>
                                  {breakItem.start} - {breakItem.end || "In Progress"}
                                </span>
                                <span>{breakItem.duration || "Calculating..."}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

      <Navbar activePage="history" />
    </div>
  )
}
