"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"
import LuciferHeader from "@/components/lucifer-header"
import LuciferFooter from "@/components/lucifer-footer"

export default function HistoryPage() {
  const { shifts, hourlyRate } = useTimeStore()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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

  const totalEarnings = totalHours * hourlyRate

  const handleExport = () => {
    const csvContent = [
      ["Date", "Start Time", "End Time", "Duration", "Earnings"],
      ...filteredShifts.map((shift) => {
        const startDate = new Date(shift.startTime)
        const endDate = shift.endTime ? new Date(shift.endTime) : null
        const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
        const earnings = duration * hourlyRate

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <LuciferHeader activePage="history" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="card lucifer-border chiaroscuro p-8">
            <div className="hidden-message absolute top-4 right-4">Every second counts in the ledger of sin</div>

            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Shift History</h2>
              <p className="text-lg opacity-70 italic">View and manage your past shifts</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-1/4">
                <label className="block text-[#d4af37] text-lg font-serif mb-2" htmlFor="filter">
                  Filter Period
                </label>
                <select
                  id="filter"
                  className="w-full p-3 border border-[#d4af37] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-[#d4af37]"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="md:w-2/4">
                <label className="block text-[#d4af37] text-lg font-serif mb-2" htmlFor="search">
                  Search Records
                </label>
                <input
                  id="search"
                  type="text"
                  className="w-full p-3 border border-[#d4af37] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-[#d4af37]"
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="md:w-1/4 flex items-end">
                <button
                  onClick={handleExport}
                  className="hellfire-btn w-full bg-transparent border border-[#d4af37] p-3 text-foreground hover:bg-[rgba(212,175,55,0.1)] transition-colors duration-300"
                >
                  Export to CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="stat-card chiaroscuro">
                <div className="stat-label">Total Hours</div>
                <div className="stat-value">{formatDuration(totalHours)}</div>
              </div>
              <div className="stat-card chiaroscuro">
                <div className="stat-label">Total Earnings</div>
                <div className="stat-value">{formatMoney(totalEarnings)}</div>
              </div>
            </div>

            <div className="relative border border-[#d4af37] p-6 chiaroscuro">
              {filteredShifts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl font-serif">No shifts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="infernal-table w-full">
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
                        const earnings = duration * hourlyRate

                        return (
                          <tr key={shift.id} className="relative">
                            <td>{format(startDate, "PPP")}</td>
                            <td>{format(startDate, "p")}</td>
                            <td>
                              {endDate ? (
                                format(endDate, "p")
                              ) : (
                                <span className="inline-block px-3 py-1 text-xs bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[#f59e0b]">
                                  In progress
                                </span>
                              )}
                            </td>
                            <td>{formatDuration(duration)}</td>
                            <td>{formatMoney(earnings)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <LuciferFooter />
    </div>
  )
}
