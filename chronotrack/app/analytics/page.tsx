"use client"

import { useState, useEffect } from "react"
import { getAllTimeEntries, getSettings } from "@/components/database"
import { exportToGoogleSheets, prepareTimeEntriesForSheets } from "@/lib/google-sheets"

export default function AnalyticsPage() {
  const [timeEntries, setTimeEntries] = useState([])
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("weekly")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date(),
  })
  const [customStartDate, setCustomStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
  )
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split("T")[0])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const entries = await getAllTimeEntries()
        const userSettings = await getSettings()

        setTimeEntries(entries)
        setSettings(userSettings)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Update date range when report type changes
  useEffect(() => {
    const now = new Date()
    let start = new Date()

    switch (reportType) {
      case "daily":
        start = new Date(now)
        start.setHours(0, 0, 0, 0)
        setDateRange({ start, end: now })
        break

      case "weekly":
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        setDateRange({ start, end: now })
        break

      case "monthly":
        start = new Date(now)
        start.setMonth(now.getMonth() - 1)
        setDateRange({ start, end: now })
        break

      case "custom":
        setDateRange({
          start: new Date(customStartDate),
          end: new Date(customEndDate),
        })
        break
    }
  }, [reportType, customStartDate, customEndDate])

  // Handle custom date changes
  const handleCustomDateChange = () => {
    setDateRange({
      start: new Date(customStartDate),
      end: new Date(customEndDate),
    })
  }

  // Filter entries by current date range
  const filteredEntries = timeEntries.filter((entry) => {
    const startTime = new Date(entry.startTime)
    return startTime >= dateRange.start && startTime <= dateRange.end
  })

  // Calculate totals
  const totalDuration = filteredEntries.reduce((total, entry) => {
    if (!entry.endTime) return total

    const startTime = new Date(entry.startTime)
    const endTime = new Date(entry.endTime)
    return total + (endTime.getTime() - startTime.getTime())
  }, 0)

  const totalHours = totalDuration / (1000 * 60 * 60)
  const totalEarnings = totalHours * (settings?.hourlyRate || 0)

  // Sync to Google Sheets
  const syncToGoogleSheets = async () => {
    try {
      setIsSyncing(true)
      setSyncMessage("Syncing to Google Sheets...")

      const spreadsheetId = localStorage.getItem("gs_spreadsheetId")
      const apiKey = localStorage.getItem("gs_apiKey")

      if (!spreadsheetId || !apiKey) {
        setSyncMessage("Please set up Google Sheets in Settings first.")
        return
      }

      const data = prepareTimeEntriesForSheets(filteredEntries, settings)
      await exportToGoogleSheets(spreadsheetId, apiKey, data)

      setSyncMessage("Data synced to Google Sheets successfully!")
    } catch (error) {
      console.error("Error syncing to Google Sheets:", error)
      setSyncMessage(`Error syncing: ${error.message || "Unknown error"}`)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="analytics-page">
        <h1>Analytics</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      <div className="report-controls">
        <div className="report-type-selector">
          <label>Report Type:</label>
          <div className="button-group">
            <button onClick={() => setReportType("daily")} className={reportType === "daily" ? "active" : ""}>
              Daily
            </button>
            <button onClick={() => setReportType("weekly")} className={reportType === "weekly" ? "active" : ""}>
              Weekly
            </button>
            <button onClick={() => setReportType("monthly")} className={reportType === "monthly" ? "active" : ""}>
              Monthly
            </button>
            <button onClick={() => setReportType("custom")} className={reportType === "custom" ? "active" : ""}>
              Custom
            </button>
          </div>
        </div>

        {reportType === "custom" && (
          <div className="custom-date-range">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <div className="date-input-group">
                <label htmlFor="end-date">End Date:</label>
                <input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>

            <button className="update-button" onClick={handleCustomDateChange}>
              Update Date Range
            </button>
          </div>
        )}
      </div>

      <div className="report-preview">
        <div className="report-header">
          <h2>Time Tracking Report</h2>
          <p className="date-range">
            {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
          </p>
        </div>

        <div className="report-summary">
          <div className="summary-item">
            <h3>Total Hours</h3>
            <p className="summary-value">{totalHours.toFixed(2)} hrs</p>
          </div>

          <div className="summary-item">
            <h3>Total Earnings</h3>
            <p className="summary-value">
              {settings?.currency || "$"}
              {totalEarnings.toFixed(2)}
            </p>
          </div>

          <div className="summary-item">
            <h3>Entries</h3>
            <p className="summary-value">{filteredEntries.length}</p>
          </div>
        </div>

        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const startTime = new Date(entry.startTime)
                const endTime = entry.endTime ? new Date(entry.endTime) : null
                const duration = endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : 0
                const earnings = duration * (settings?.hourlyRate || 0)

                return (
                  <tr key={entry.id}>
                    <td>{startTime.toLocaleDateString()}</td>
                    <td>{startTime.toLocaleTimeString()}</td>
                    <td>{endTime ? endTime.toLocaleTimeString() : "In progress"}</td>
                    <td>{duration.toFixed(2)} hrs</td>
                    <td>{entry.description || "N/A"}</td>
                    <td>
                      {settings?.currency || "$"}
                      {earnings.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sync-section">
        <button className="sync-button" onClick={syncToGoogleSheets} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync to Google Sheets"}
        </button>

        {syncMessage && <div className="sync-message">{syncMessage}</div>}
      </div>

      <style jsx>{`
        .analytics-page {
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 20px;
          border-bottom: 1px solid black;
          padding-bottom: 10px;
        }
        
        .report-controls {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid black;
          background: white;
        }
        
        .report-type-selector {
          margin-bottom: 15px;
        }
        
        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 5px;
        }
        
        .button-group button {
          background: white;
          border: 1px solid black;
          padding: 8px 15px;
          cursor: pointer;
        }
        
        .button-group button.active {
          background: black;
          color: white;
        }
        
        .custom-date-range {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
        }
        
        .date-inputs {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .date-input-group {
          flex: 1;
          min-width: 150px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 8px;
          border: 1px solid black;
          background: white;
        }
        
        .update-button {
          background: black;
          color: white;
          border: none;
          padding: 8px 15px;
          cursor: pointer;
        }
        
        .report-preview {
          margin-bottom: 20px;
          padding: 20px;
          border: 1px solid black;
          background: white;
        }
        
        .report-header {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .report-header h2 {
          margin-bottom: 5px;
        }
        
        .date-range {
          font-style: italic;
        }
        
        .report-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid black;
        }
        
        .summary-item {
          text-align: center;
          flex: 1;
        }
        
        .summary-item h3 {
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .report-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background: #f0f0f0;
        }
        
        .sync-section {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid black;
          background: white;
        }
        
        .sync-button {
          background: black;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
        }
        
        .sync-button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        
        .sync-message {
          margin-top: 15px;
          padding: 10px;
          border: 1px solid black;
        }
      `}</style>
    </div>
  )
}
