"use client"

import { useState, useEffect } from "react"
import { saveSettings, getSettings, initDB } from "@/components/database"
import GoogleSheetsSetup from "@/components/google-sheets-setup"

export default function SettingsPage() {
  const [hourlyRate, setHourlyRate] = useState(0)
  const [overtimeRate, setOvertimeRate] = useState(0)
  const [overtimeThreshold, setOvertimeThreshold] = useState(8)
  const [currency, setCurrency] = useState("$")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await initDB()
        const settings = await getSettings()

        if (settings) {
          setHourlyRate(settings.hourlyRate || 0)
          setOvertimeRate(settings.overtimeRate || 0)
          setOvertimeThreshold(settings.overtimeThreshold || 8)
          setCurrency(settings.currency || "$")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading settings:", error)
        setMessage("Error loading settings. Please try again.")
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      await saveSettings({
        id: "user-settings",
        hourlyRate,
        overtimeRate,
        overtimeThreshold,
        currency,
      })

      setMessage("Settings saved successfully!")

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Error saving settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="settings-page">
        <h1>Settings</h1>
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Pay Settings</h2>

        <div className="form-group">
          <label htmlFor="currency">Currency Symbol:</label>
          <input
            id="currency"
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate:</label>
          <input
            id="hourlyRate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number.parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="overtimeRate">Overtime Rate:</label>
          <input
            id="overtimeRate"
            type="number"
            value={overtimeRate}
            onChange={(e) => setOvertimeRate(Number.parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="overtimeThreshold">Overtime Threshold (hours):</label>
          <input
            id="overtimeThreshold"
            type="number"
            value={overtimeThreshold}
            onChange={(e) => setOvertimeThreshold(Number.parseFloat(e.target.value) || 0)}
            min="0"
            step="0.5"
          />
        </div>

        <button className="save-button" onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {message && <div className="message">{message}</div>}
      </div>

      <GoogleSheetsSetup />

      <style jsx>{`
        .settings-page {
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 20px;
          border-bottom: 1px solid black;
          padding-bottom: 10px;
        }
        
        .settings-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid black;
          background: white;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          border-bottom: 1px solid black;
          padding-bottom: 10px;
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
        
        .save-button {
          background: black;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
        }
        
        .save-button:disabled {
          background: #666;
          cursor: not-allowed;
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
