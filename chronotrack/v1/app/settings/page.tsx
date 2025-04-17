"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTimeStore } from "@/lib/store"
import ThemeToggle from "@/components/theme-toggle"

export default function SettingsPage() {
  const { clearAllData, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [hourlyRate, setHourlyRate] = useState("12.50")
  const [darkMode, setDarkMode] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)

    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Get hourly rate from local storage
    const storedRate = localStorage.getItem("hourlyRate")
    if (storedRate) {
      setHourlyRate(storedRate)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadData])

  if (!mounted) {
    return null
  }

  const handleSaveSettings = () => {
    // Save hourly rate to local storage
    localStorage.setItem("hourlyRate", hourlyRate)

    alert("Settings saved successfully")
  }

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleClearData = () => {
    clearAllData()
    setShowConfirmation(false)

    alert("All data has been cleared")
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
            <span className="logo-text">Tempus</span>
          </Link>
          <nav className="nav">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/history" className="nav-link">
              History
            </Link>
            <Link href="/analytics" className="nav-link">
              Analytics
            </Link>
            <Link href="/settings" className="nav-link active">
              Settings
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="card baroque-border">
            <div className="ornament ornament-1"></div>
            <div className="ornament ornament-2"></div>
            <div className="card-header">
              <h2 className="card-title">Settings</h2>
              <p className="card-description">Manage your app preferences</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label className="label" htmlFor="hourlyRate">
                  Hourly Rate (£)
                </label>
                <input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  className="input"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: "0.7" }}>
                  This rate will be used to calculate your earnings
                </p>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="darkMode">
                  Dark Mode
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input id="darkMode" type="checkbox" checked={darkMode} onChange={handleToggleDarkMode} />
                  <span>Enable dark mode</span>
                </div>
              </div>

              <div className="baroque-divider"></div>

              <div className="form-group">
                <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-serif)" }}>Data Management</h3>
                <p style={{ fontSize: "0.875rem", marginBottom: "1rem", opacity: "0.7" }}>
                  Clear all your time tracking data. This action cannot be undone.
                </p>

                {showConfirmation ? (
                  <div
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--primary)",
                      borderRadius: "4px",
                      marginBottom: "1rem",
                    }}
                  >
                    <p style={{ marginBottom: "1rem", fontWeight: "500" }}>
                      Are you sure you want to delete all your data?
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="button button-primary" onClick={handleClearData}>
                        Yes, delete everything
                      </button>
                      <button className="button button-secondary" onClick={() => setShowConfirmation(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="button button-primary" onClick={() => setShowConfirmation(true)}>
                    Clear All Data
                  </button>
                )}
              </div>
            </div>
            <div className="card-footer">
              <button className="button button-primary" onClick={handleSaveSettings}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="baroque-divider"></div>
          <p>&copy; {new Date().getFullYear()} Tempus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
