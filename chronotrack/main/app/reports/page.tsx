"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Download, Filter, FileSpreadsheet, Printer, ChevronDown, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import PinLogin from "@/components/pin-login"
import { useAuth } from "@/context/auth-context"
import styles from "./page.module.css"

// Mock data for time entries
const mockEntries = [
  {
    id: 1,
    date: "2025-04-19",
    clockIn: "09:15:00",
    clockOut: "12:30:00",
    duration: "03:15:00",
    job: "Web Development",
    rate: 50,
    earnings: 162.5,
    breaks: [{ start: "10:30:00", end: "10:45:00", duration: "00:15:00" }],
  },
  {
    id: 2,
    date: "2025-04-19",
    clockIn: "13:30:00",
    clockOut: "17:45:00",
    duration: "04:15:00",
    job: "Web Development",
    rate: 50,
    earnings: 212.5,
    breaks: [{ start: "15:00:00", end: "15:20:00", duration: "00:20:00" }],
  },
  {
    id: 3,
    date: "2025-04-18",
    clockIn: "08:45:00",
    clockOut: "16:30:00",
    duration: "07:45:00",
    job: "Design Work",
    rate: 45,
    earnings: 348.75,
    breaks: [
      { start: "12:00:00", end: "12:45:00", duration: "00:45:00" },
      { start: "14:30:00", end: "14:45:00", duration: "00:15:00" },
    ],
  },
  {
    id: 5,
    date: "2025-04-16",
    clockIn: "08:30:00",
    clockOut: "16:45:00",
    duration: "08:15:00",
    job: "Client Meeting",
    rate: 60,
    earnings: 495,
    breaks: [{ start: "12:15:00", end: "13:00:00", duration: "00:45:00" }],
  },
  {
    id: 6,
    date: "2025-04-15",
    clockIn: "09:00:00",
    clockOut: "17:30:00",
    duration: "08:30:00",
    job: "Web Development",
    rate: 50,
    earnings: 425,
    breaks: [{ start: "12:00:00", end: "13:00:00", duration: "01:00:00" }],
  },
  {
    id: 7,
    date: "2025-04-14",
    clockIn: "08:45:00",
    clockOut: "16:15:00",
    duration: "07:30:00",
    job: "Design Work",
    rate: 45,
    earnings: 337.5,
    breaks: [{ start: "12:30:00", end: "13:15:00", duration: "00:45:00" }],
  },
]

export default function ReportsPage() {
  const { authenticated } = useAuth()
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState("week")
  const [jobFilter, setJobFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const reportRef = useRef<HTMLDivElement>(null)

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  // Filter and sort entries
  const filteredEntries = mockEntries.filter((entry) => {
    // Filter by job
    if (jobFilter !== "all" && entry.job !== jobFilter) return false

    // Filter by date range
    if (startDate && endDate) {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Include the entire end day
      if (entryDate < start || entryDate > end) return false
    } else if (dateRange === "week") {
      // Current week (last 7 days)
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      if (entryDate < weekAgo) return false
    } else if (dateRange === "month") {
      // Current month (last 30 days)
      const entryDate = new Date(entry.date)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      if (entryDate < monthAgo) return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        entry.job.toLowerCase().includes(searchLower) ||
        entry.date.includes(searchLower) ||
        entry.clockIn.includes(searchLower) ||
        entry.clockOut.includes(searchLower)
      )
    }

    return true
  })

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date + "T" + a.clockIn)
      const dateB = new Date(b.date + "T" + b.clockIn)
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    } else if (sortBy === "duration") {
      const durationA = a.duration
        .split(":")
        .reduce((acc, time, i) => acc + Number.parseInt(time) * Math.pow(60, 2 - i), 0)
      const durationB = b.duration
        .split(":")
        .reduce((acc, time, i) => acc + Number.parseInt(time) * Math.pow(60, 2 - i), 0)
      return sortOrder === "asc" ? durationA - durationB : durationB - durationA
    } else if (sortBy === "earnings") {
      return sortOrder === "asc" ? a.earnings - b.earnings : b.earnings - a.earnings
    }
    return 0
  })

  // Group entries by date
  const entriesByDate = sortedEntries.reduce(
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

  // Sort dates
  const sortedDates = Object.keys(entriesByDate).sort(
    (a, b) => (sortOrder === "asc" ? 1 : -1) * (new Date(b).getTime() - new Date(a).getTime()),
  )

  // Calculate totals
  const totalHours = filteredEntries.reduce((sum, entry) => {
    const [hours, minutes] = entry.duration.split(":").map(Number)
    return sum + hours + minutes / 60
  }, 0)

  const totalEarnings = filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0)

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Date", "Job", "Clock In", "Clock Out", "Duration", "Rate", "Earnings"]
    const rows = filteredEntries.map((entry) => [
      entry.date,
      entry.job,
      entry.clockIn,
      entry.clockOut,
      entry.duration,
      `${entry.rate.toFixed(2)}`,
      `${entry.earnings.toFixed(2)}`,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `time-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print report
  const printReport = () => {
    window.print()
  }

  if (!authenticated) {
    return <PinLogin />
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Time Reports</h1>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className={styles.actionButton} onClick={exportToCSV}>
            <FileSpreadsheet size={18} />
            <span>Export</span>
          </button>
          <button className={styles.actionButton} onClick={printReport}>
            <Printer size={18} />
            <span>Print</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filtersPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Date Range</label>
                <div className={styles.buttonGroup}>
                  <button
                    className={`${styles.filterButton} ${dateRange === "week" ? styles.active : ""}`}
                    onClick={() => {
                      setDateRange("week")
                      setStartDate("")
                      setEndDate("")
                    }}
                  >
                    This Week
                  </button>
                  <button
                    className={`${styles.filterButton} ${dateRange === "month" ? styles.active : ""}`}
                    onClick={() => {
                      setDateRange("month")
                      setStartDate("")
                      setEndDate("")
                    }}
                  >
                    This Month
                  </button>
                  <button
                    className={`${styles.filterButton} ${dateRange === "custom" ? styles.active : ""}`}
                    onClick={() => setDateRange("custom")}
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Job</label>
                <select className={styles.select} value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                  <option value="all">All Jobs</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Design Work">Design Work</option>
                  <option value="Client Meeting">Client Meeting</option>
                </select>
              </div>
            </div>

            {dateRange === "custom" && (
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Sort By</label>
                <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date">Date</option>
                  <option value="duration">Duration</option>
                  <option value="earnings">Earnings</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Order</label>
                <select className={styles.select} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Search</label>
                <div className={styles.searchBar}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Clock size={20} />
          </div>
          <div className={styles.summaryContent}>
            <h3>Total Hours</h3>
            <p>{totalHours.toFixed(2)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Download size={20} />
          </div>
          <div className={styles.summaryContent}>
            <h3>Total Earnings</h3>
            <p>£{totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className={styles.reportContent} ref={reportRef}>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.entryHeader} onClick={() => toggleExpand(entry.id)}>
                      <div className={styles.entryInfo}>
                        <div className={styles.entryTime}>
                          <span className={styles.timeRange}>
                            {entry.clockIn} - {entry.clockOut}
                          </span>
                          <span className={styles.duration}>{entry.duration}</span>
                        </div>
                        <div className={styles.entryJob}>
                          <span className={styles.jobName}>{entry.job}</span>
                          <span className={styles.jobRate}>£{entry.rate.toFixed(2)}/hr</span>
                        </div>
                      </div>
                      <div className={styles.entryEarnings}>
                        <span className={styles.earningsLabel}>Earnings</span>
                        <span className={styles.earningsValue}>£{entry.earnings.toFixed(2)}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedEntry === entry.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
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
                          transition={{ duration: 0.2 }}
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
                          <div className={styles.entryCalculation}>
                            <div className={styles.calculationRow}>
                              <span>Duration</span>
                              <span>{entry.duration}</span>
                            </div>
                            <div className={styles.calculationRow}>
                              <span>Rate</span>
                              <span>£{entry.rate.toFixed(2)}/hr</span>
                            </div>
                            <div className={styles.calculationRow}>
                              <span>Total</span>
                              <span>£{entry.earnings.toFixed(2)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <Navbar activePage="reports" />
    </div>
  )
}
