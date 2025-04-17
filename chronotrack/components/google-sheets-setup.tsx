"use client"

import { useState, useEffect } from "react"
import { useGoogleSheets } from "@/lib/google-sheets"
import { getAllTimeEntries, getSettings } from "@/components/database"

export default function GoogleSheetsSetup() {
  const [apiKey, setApiKey] = useState("")
  const [clientId, setClientId] = useState("")
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState("")

  // Load saved credentials from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem("gs_apiKey")
      const savedClientId = localStorage.getItem("gs_clientId")
      const savedSpreadsheetId = localStorage.getItem("gs_spreadsheetId")

      if (savedApiKey && savedClientId && savedSpreadsheetId) {
        setApiKey(savedApiKey)
        setClientId(savedClientId)
        setSpreadsheetId(savedSpreadsheetId)
        setIsConfigured(true)
      }
    }
  }, [])

  const sheets = useGoogleSheets({
    apiKey,
    clientId,
    spreadsheetId,
  })

  const saveConfiguration = () => {
    if (!apiKey || !clientId || !spreadsheetId) {
      setMessage("Please fill in all fields.")
      return
    }

    localStorage.setItem("gs_apiKey", apiKey)
    localStorage.setItem("gs_clientId", clientId)
    localStorage.setItem("gs_spreadsheetId", spreadsheetId)

    setIsConfigured(true)
    setMessage("Configuration saved successfully!")
  }

  const signIn = async () => {
    try {
      await sheets.signIn()
      setMessage("Signed in to Google successfully!")
    } catch (error) {
      setMessage(`Error signing in: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const exportDataToSheets = async () => {
    try {
      setIsSyncing(true)
      setMessage("Syncing data to Google Sheets...")

      // Get all time entries and settings
      const entries = await getAllTimeEntries()
      const settings = await getSettings()

      // Prepare data for export
      const headers = ["ID", "Start Time", "End Time", "Duration (hrs)", "Description", "Project", "Tags", "Earnings"]
      const data = [headers]

      entries.forEach((entry) => {
        const startTime = new Date(entry.startTime)
        const endTime = entry.endTime ? new Date(entry.endTime) : null
        const durationMs = endTime ? endTime.getTime() - startTime.getTime() : 0
        const durationHrs = durationMs / (1000 * 60 * 60)
        const earnings = durationHrs * (settings?.hourlyRate || 0)

        data.push([
          entry.id,
          startTime.toISOString(),
          endTime ? endTime.toISOString() : "In progress",
          durationHrs.toFixed(2),
          entry.description || "",
          entry.project || "",
          (entry.tags || []).join(", "),
          earnings.toFixed(2),
        ])
      })

      // Export to Google Sheets
      const response = await sheets.exportData("Sheet1!A1", data)

      setMessage("Data synced successfully!")
    } catch (error) {
      setMessage(`Error syncing data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSyncing(false)
    }
  }

  if (sheets.error) {
    return (
      <div className="google-sheets-setup">
        <h2>Google Sheets Setup</h2>
        <div className="error-message">Error initializing Google Sheets: {sheets.error.message}</div>
      </div>
    )
  }

  return (
    <div className="google-sheets-setup">
      <h2>Google Sheets Integration</h2>

      {!isConfigured ? (
        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="apiKey">API Key:</label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google API Key"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientId">Client ID:</label>
            <input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your Google Client ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="spreadsheetId">Spreadsheet ID:</label>
            <input
              id="spreadsheetId"
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Enter your Google Spreadsheet ID"
            />
          </div>

          <button className="save-button" onClick={saveConfiguration}>
            Save Configuration
          </button>
        </div>
      ) : (
        <div className="sync-controls">
          <p>
            Google Sheets configured successfully.
            {sheets.isInitialized
              ? sheets.isAuthenticated
                ? " You are signed in."
                : " Please sign in to sync data."
              : " Initializing..."}
          </p>

          {sheets.isInitialized && !sheets.isAuthenticated && (
            <button className="sign-in-button" onClick={signIn}>
              Sign in to Google
            </button>
          )}

          {sheets.isAuthenticated && (
            <button className="sync-button" onClick={exportDataToSheets} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Sync Data to Google Sheets"}
            </button>
          )}
        </div>
      )}

      {message && <div className="message">{message}</div>}

      <style jsx>{`
        .google-sheets-setup {
          padding: 20px;
          background: white;
          border: 1px solid black;
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 0;
          border-bottom: 1px solid black;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
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
        
        button {
          background: black;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          margin-top: 10px;
          margin-right: 10px;
        }
        
        button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        
        .error-message {
          color: red;
          margin-top: 15px;
        }
        
        .message {
          margin-top: 15px;
          padding: 10px;
          border: 1px solid black;
        }
      `}</style>
    </div>
  )
}
