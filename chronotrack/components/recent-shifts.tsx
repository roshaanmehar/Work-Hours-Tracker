"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export default function RecentShifts() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  // Get recent shifts (last 5)
  const recentShifts = [...shifts]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Shifts</h2>
        <p className="card-description">Your most recent work sessions</p>
      </div>
      <div className="card-content">
        {recentShifts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              opacity: "0.7",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: "0 auto 1rem" }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h3 style={{ marginBottom: "0.5rem", fontFamily: "var(--font-serif)" }}>No shifts yet</h3>
            <p>Start tracking your time to see your shifts here</p>
          </div>
        ) : (
          <div>
            {recentShifts.map((shift) => {
              const startDate = new Date(shift.startTime)
              const endDate = shift.endTime ? new Date(shift.endTime) : null
              const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
              const earnings = duration * 12.5

              return (
                <div
                  key={shift.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                      {format(startDate, "EEEE, MMMM d")}
                    </div>
                    <div style={{ fontSize: "0.875rem", opacity: "0.7" }}>
                      {format(startDate, "h:mm a")} - {endDate ? format(endDate, "h:mm a") : "In progress"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{formatDuration(duration)}</div>
                    <div style={{ fontSize: "0.875rem", opacity: "0.7" }}>{formatMoney(earnings)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="card-footer">
        <Link href="/history" className="button button-secondary" style={{ width: "100%" }}>
          View All History
        </Link>
      </div>
    </div>
  )
}
