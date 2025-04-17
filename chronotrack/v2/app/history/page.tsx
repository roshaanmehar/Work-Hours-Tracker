"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"
import ThemeToggle from "@/components/theme-toggle"

export default function HistoryPage() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadData])

  if (!mounted) {
    return null
  }

  const filteredShifts = shifts
    .filter((shift) => {
      if (filter === "all") return true
      if (filter === "today") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        return (
          shiftDate.getDate() === today.getDate() &&
          shiftDate.getMonth() === today.getMonth() &&
          shiftDate.getFullYear() === today.getFullYear()
        )
      }
      if (filter === "week") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        const diffTime = Math.abs(today.getTime() - shiftDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      }
      if (filter === "month") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        return shiftDate.getMonth() === today.getMonth() && shiftDate.getFullYear() === today.getFullYear()
      }
      return true
    })
    .filter((shift) => {
      if (!searchTerm) return true
      const date = format(new Date(shift.startTime), "PPP")
      return date.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const totalHours = filteredShifts.reduce((acc, shift) => {
    if (shift.endTime) {
      return acc + calculateDuration(shift.startTime, shift.endTime)
    }
    return acc
  }, 0)

  const totalEarnings = totalHours * 12.5

  const handleExport = () => {
    const csvContent = [
      ["Date", "Start Time", "End Time", "Duration", "Earnings"],
      ...filteredShifts.map((shift) => {
        const startDate = new Date(shift.startTime)
        const endDate = shift.endTime ? new Date(shift.endTime) : null
        const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
        const earnings = duration * 12.5

        return [
          format(startDate, "PPP"),
          format(startDate, "p"),
          endDate ? format(endDate, "p") : "In progress",
          formatDuration(duration),
          formatMoney(earnings),
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `infernal-chronos-export-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <span className="logo-text">Infernal Chronos</span>
          </Link>
          <nav className="nav">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/history" className="nav-link active">
              History
            </Link>
            <Link href="/analytics" className="nav-link">
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
          <div className="card lucifer-border chiaroscuro">
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>

            <div className="card-header">
              <h2 className="card-title">Shift History</h2>
              <p className="card-description">View and manage your past shifts</p>
            </div>
            <div className="card-content">
              <div className="form-group" style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
                <div>
                  <label className="label" htmlFor="filter">
                    Filter Period
                  </label>
                  <select id="filter" className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="search">
                    Search Records
                  </label>
                  <input
                    id="search"
                    type="text"
                    className="input"
                    placeholder="Search by date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                  <button onClick={handleExport} className="button button-secondary">
                    Export to CSV
                  </button>
                </div>
              </div>

              <div className="stats-grid" style={{ marginBottom: "3rem" }}>
                <div className="stat-card chiaroscuro">
                  <div className="stat-label">Total Hours</div>
                  <div className="stat-value">{formatDuration(totalHours)}</div>
                </div>
                <div className="stat-card chiaroscuro">
                  <div className="stat-label">Total Earnings</div>
                  <div className="stat-value">{formatMoney(totalEarnings)}</div>
                </div>
              </div>

              <div className="infernal-scroll">
                {filteredShifts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 0" }}>
                    <p style={{ fontSize: "1.5rem", fontFamily: "var(--font-serif)" }}>No shifts found</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Duration</th>
                        <th>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShifts.map((shift) => {
                        const startDate = new Date(shift.startTime)
                        const endDate = shift.endTime ? new Date(shift.endTime) : null
                        const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
                        const earnings = duration * 12.5

                        return (
                          <tr key={shift.id}>
                            <td>{format(startDate, "PPP")}</td>
                            <td>{format(startDate, "p")}</td>
                            <td>
                              {endDate ? (
                                format(endDate, "p")
                              ) : (
                                <span className="badge badge-warning">In progress</span>
                              )}
                            </td>
                            <td>{formatDuration(duration)}</td>
                            <td>{formatMoney(earnings)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="hidden-message hidden-message-1">Every second counts in the ledger of sin</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="infernal-divider"></div>
          <div className="infernal-medallion">
            <div className="medallion-content">IC</div>
          </div>
          <p>&copy; {new Date().getFullYear()} Infernal Chronos. All rights reserved.</p>
          <div className="piano-keys">
            <div className="piano-key"></div>
            <div className="piano-key black"></div>
            <div className="piano-key"></div>
            <div className="piano-key black"></div>
            <div className="piano-key"></div>
            <div className="piano-key"></div>
            <div className="piano-key black"></div>
            <div className="piano-key"></div>
            <div className="piano-key black"></div>
            <div className="piano-key"></div>
            <div className="piano-key black"></div>
            <div className="piano-key"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
