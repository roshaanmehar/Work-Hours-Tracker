"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import type { TimeEntry } from "@/lib/types"
import { formatDate, formatDuration } from "@/lib/utils"

export default function HistoryPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [groupedEntries, setGroupedEntries] = useState<Record<string, TimeEntry[]>>({})
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  useEffect(() => {
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const parsedEntries = JSON.parse(storedEntries) as TimeEntry[]
      setEntries(parsedEntries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()))
    }
  }, [])

  useEffect(() => {
    const grouped = entries.reduce(
      (acc, entry) => {
        const date = new Date(entry.startTime).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(entry)
        return acc
      },
      {} as Record<string, TimeEntry[]>,
    )

    setGroupedEntries(grouped)
  }, [entries])

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    setEntries(updatedEntries)
    localStorage.setItem("timeEntries", JSON.stringify(updatedEntries))
  }

  const toggleEntryDetails = (id: string) => {
    if (selectedEntry === id) {
      setSelectedEntry(null)
    } else {
      setSelectedEntry(id)
    }
  }

  const calculateEarnings = (duration: number) => {
    const hours = duration / 3600
    return (hours * 12.5).toFixed(2)
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
        <h1 className={styles.title}>Time History</h1>
      </header>

      <main className={styles.main}>
        {Object.keys(groupedEntries).length > 0 ? (
          <div className={styles.timeline}>
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date} className={styles.timelineDay}>
                <div className={styles.timelineDate}>
                  <div className={styles.timelineDateDot}></div>
                  <h2>{formatDate(new Date(dayEntries[0].startTime))}</h2>
                </div>
                <div className={styles.timelineEntries}>
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`${styles.timelineEntry} ${selectedEntry === entry.id ? styles.expanded : ""}`}
                      onClick={() => toggleEntryDetails(entry.id)}
                    >
                      <div className={styles.timelineEntryHeader}>
                        <div className={styles.timelineEntryTime}>
                          {new Date(entry.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                          {entry.endTime
                            ? new Date(entry.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : " In progress"}
                        </div>
                        <div className={styles.timelineEntryDuration}>{formatDuration(entry.duration || 0)}</div>
                      </div>

                      <div className={styles.timelineEntryDetails}>
                        <div className={styles.timelineEntryDetail}>
                          <span>Start:</span>
                          <span>{new Date(entry.startTime).toLocaleString()}</span>
                        </div>
                        {entry.endTime && (
                          <div className={styles.timelineEntryDetail}>
                            <span>End:</span>
                            <span>{new Date(entry.endTime).toLocaleString()}</span>
                          </div>
                        )}
                        <div className={styles.timelineEntryDetail}>
                          <span>Duration:</span>
                          <span>{formatDuration(entry.duration || 0)}</span>
                        </div>
                        <div className={styles.timelineEntryDetail}>
                          <span>Earnings:</span>
                          <span>${calculateEarnings(entry.duration || 0)}</span>
                        </div>
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEntry(entry.id)
                          }}
                        >
                          Delete Entry
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No time entries yet</h2>
            <p>Start tracking your time to see your history here.</p>
            <Link href="/" className={styles.button}>
              Go to Timer
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
