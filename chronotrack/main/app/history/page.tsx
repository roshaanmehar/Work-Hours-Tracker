"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Clock, Calendar } from "lucide-react"
import Navbar from "@/components/navbar"
import styles from "./page.module.css"

// Mock data - would be fetched from backend in real implementation
// Modified to show only final records without modification indicators
const mockEntries = [
  {
    id: 1,
    date: "2025-04-19",
    clockIn: "09:15:00",
    clockOut: "12:30:00",
    duration: "03:15:00",
    breaks: [{ start: "10:30:00", end: "10:45:00", duration: "00:15:00" }],
  },
  {
    id: 2,
    date: "2025-04-19",
    clockIn: "13:30:00",
    clockOut: "17:45:00",
    duration: "04:15:00",
    breaks: [{ start: "15:00:00", end: "15:20:00", duration: "00:20:00" }],
  },
  {
    id: 3,
    date: "2025-04-18",
    clockIn: "08:45:00", // This is the modified time (was 09:00:00)
    clockOut: "16:30:00", // This is the modified time (was 16:00:00)
    duration: "07:45:00", // This is the modified duration (was 07:00:00)
    breaks: [
      { start: "12:00:00", end: "12:45:00", duration: "00:45:00" },
      { start: "14:30:00", end: "14:45:00", duration: "00:15:00" },
    ],
  },
  // Removed deleted entry
  {
    id: 5,
    date: "2025-04-16",
    clockIn: "08:30:00",
    clockOut: "16:45:00",
    duration: "08:15:00",
    breaks: [{ start: "12:15:00", end: "13:00:00", duration: "00:45:00" }],
  },
]

export default function HistoryPage() {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [dateRange, setDateRange] = useState("week")

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  // Group entries by date
  const entriesByDate = mockEntries.reduce(
    (acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry)
      return acc
    },
    {} as Record<string, typeof mockEntries>,
  )

  // Sort dates in descending order
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

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
                        {entry.clockIn} - {entry.clockOut}
                      </span>
                      <span className={styles.duration}>{entry.duration}</span>
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
                        {entry.breaks.length > 0 && (
                          <div className={styles.breaksList}>
                            <h4>Breaks ({entry.breaks.length})</h4>
                            {entry.breaks.map((breakItem, index) => (
                              <div key={index} className={styles.breakItem}>
                                <span>
                                  {breakItem.start} - {breakItem.end}
                                </span>
                                <span>{breakItem.duration}</span>
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
