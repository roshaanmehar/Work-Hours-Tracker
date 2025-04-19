"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Filter, Database, AlertTriangle, Search, Eye, EyeOff } from "lucide-react"
import Navbar from "@/components/navbar"
import styles from "./page.module.css"

// Mock data for master database records
const masterRecords = [
  {
    id: 1,
    date: "2025-04-19",
    clockIn: "09:15:00",
    clockOut: "12:30:00",
    duration: "03:15:00",
    status: "active",
    user: "John Doe",
    breaks: [{ start: "10:30:00", end: "10:45:00", duration: "00:15:00" }],
  },
  {
    id: 2,
    date: "2025-04-19",
    clockIn: "13:30:00",
    clockOut: "17:45:00",
    duration: "04:15:00",
    status: "active",
    user: "John Doe",
    breaks: [{ start: "15:00:00", end: "15:20:00", duration: "00:20:00" }],
  },
  {
    id: 3,
    date: "2025-04-18",
    clockIn: "08:45:00",
    clockOut: "16:30:00",
    duration: "07:45:00",
    status: "modified",
    user: "John Doe",
    originalData: {
      clockIn: "09:00:00",
      clockOut: "16:00:00",
      duration: "07:00:00",
    },
    modifiedAt: "2025-04-18 17:30:00",
    modifiedBy: "John Doe",
    reason: "Forgot to clock in on time",
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
    user: "John Doe",
    deletedAt: "2025-04-17 18:30:00",
    deletedBy: "John Doe",
    reason: "Accidental entry",
    breaks: [],
  },
  {
    id: 5,
    date: "2025-04-16",
    clockIn: "08:30:00",
    clockOut: "16:45:00",
    duration: "08:15:00",
    status: "active",
    user: "Jane Smith",
    breaks: [{ start: "12:15:00", end: "13:00:00", duration: "00:45:00" }],
  },
]

export default function AdminPage() {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleted, setShowDeleted] = useState(true)

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  // Filter and search records
  const filteredRecords = masterRecords.filter((record) => {
    if (!showDeleted && record.status === "deleted") return false
    if (filter !== "all" && record.status !== filter) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.user.toLowerCase().includes(searchLower) ||
        record.date.includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <button className={styles.toggleButton} onClick={() => setShowDeleted(!showDeleted)}>
            {showDeleted ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>{showDeleted ? "Hide" : "Show"} Deleted</span>
          </button>
          <button className={styles.filterButton} onClick={() => setShowFilterMenu(!showFilterMenu)}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </header>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user, date, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

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

      <div className={styles.databaseInfo}>
        <Database size={20} />
        <h2>Master Database Records</h2>
        <div className={styles.warningBadge}>
          <AlertTriangle size={14} />
          <span>Admin Only</span>
        </div>
      </div>

      <div className={styles.entriesList}>
        {filteredRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <Database size={48} />
            <p>No records found</p>
          </div>
        ) : (
          filteredRecords.map((entry) => (
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
                  <p>{entry.user}</p>
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
                    <div className={styles.detailRow}>
                      <span>Duration:</span>
                      <span>{entry.duration}</span>
                    </div>

                    {entry.status === "modified" && (
                      <div className={styles.modificationInfo}>
                        <h4>Modification Details</h4>
                        <div className={styles.detailRow}>
                          <span>Original Clock In:</span>
                          <span>{entry.originalData.clockIn}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Original Clock Out:</span>
                          <span>{entry.originalData.clockOut}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Modified At:</span>
                          <span>{entry.modifiedAt}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Modified By:</span>
                          <span>{entry.modifiedBy}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Reason:</span>
                          <span>{entry.reason}</span>
                        </div>
                      </div>
                    )}

                    {entry.status === "deleted" && (
                      <div className={styles.deletionInfo}>
                        <h4>Deletion Details</h4>
                        <div className={styles.detailRow}>
                          <span>Deleted At:</span>
                          <span>{entry.deletedAt}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Deleted By:</span>
                          <span>{entry.deletedBy}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Reason:</span>
                          <span>{entry.reason}</span>
                        </div>
                      </div>
                    )}

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

      <Navbar activePage="admin" />
    </div>
  )
}
