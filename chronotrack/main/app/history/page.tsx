"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Filter, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import styles from "./page.module.css"

// Mock data - would be fetched from backend in real implementation
const mockEntries = [
  {
    id: 1,
    date: "2025-04-19",
    clockIn: "09:15:00",
    clockOut: "12:30:00",
    duration: "03:15:00",
    status: "active",
    breaks: [{ start: "10:30:00", end: "10:45:00", duration: "00:15:00" }],
  },
  {
    id: 2,
    date: "2025-04-19",
    clockIn: "13:30:00",
    clockOut: "17:45:00",
    duration: "04:15:00",
    status: "active",
    breaks: [{ start: "15:00:00", end: "15:20:00", duration: "00:20:00" }],
  },
  {
    id: 3,
    date: "2025-04-18",
    clockIn: "08:45:00",
    clockOut: "16:30:00",
    duration: "07:45:00",
    status: "modified",
    breaks: [
      { start: "12:00:00", end: "12:45:00", duration: "00:45:00" },
      { start: "14:30:00", end: "14:45:00", duration: "00:15:00" },
    ],
  },
  {
    id: 4,
    date: "2025-04-17",
    clockIn: "09:00:00",
    clockOut: "17:00:00",
    duration: "08:00:00",
    status: "deleted",
    breaks: [],
  },
]

export default function HistoryPage() {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  const filteredEntries = filter === "all" ? mockEntries : mockEntries.filter((entry) => entry.status === filter)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>History</h1>
        <button className={styles.filterButton} onClick={() => setShowFilterMenu(!showFilterMenu)}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </header>

      <AnimatePresence>
        {showFilterMenu && (
          <motion.div
            className={styles.filterMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${filter === "all" ? styles.active : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`${styles.filterTab} ${filter === "active" ? styles.active : ""}`}
                onClick={() => setFilter("active")}
              >
                Active
              </button>
              <button
                className={`${styles.filterTab} ${filter === "modified" ? styles.active : ""}`}
                onClick={() => setFilter("modified")}
              >
                Modified
              </button>
              <button
                className={`${styles.filterTab} ${filter === "deleted" ? styles.active : ""}`}
                onClick={() => setFilter("deleted")}
              >
                Deleted
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.entriesList}>
        {filteredEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} />
            <p>No time entries found</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              className={`${styles.entryCard} ${styles[entry.status]}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.entryHeader} onClick={() => toggleExpand(entry.id)}>
                <div className={styles.entryDate}>
                  <h3>
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <span className={styles.statusBadge}>{entry.status}</span>
                </div>
                <div className={styles.entryTime}>
                  <p>{entry.duration}</p>
                  <motion.div animate={{ rotate: expandedEntry === entry.id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={16} />
                  </motion.div>
                </div>
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
                    <div className={styles.detailRow}>
                      <span>Clock In:</span>
                      <span>{entry.clockIn}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Clock Out:</span>
                      <span>{entry.clockOut}</span>
                    </div>

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
          ))
        )}
      </div>

      <Navbar activePage="history" />
    </div>
  )
}
