"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTimeStore } from "@/lib/store"
import ThemeToggle from "@/components/theme-toggle"
import TimeTracker from "@/components/time-tracker"
import RecentShifts from "@/components/recent-shifts"
import DashboardStats from "@/components/dashboard-stats"

export default function Dashboard() {
  const { loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("tracker")
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
            <Link href="/dashboard" className="nav-link active">
              Dashboard
            </Link>
            <Link href="/history" className="nav-link">
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
          <div className="lucifer-frame">
            <div className="tabs">
              <div className={`tab ${activeTab === "tracker" ? "active" : ""}`} onClick={() => setActiveTab("tracker")}>
                <span className="flourish flourish-1"></span>
                Time Tracker
                <span className="flourish flourish-2"></span>
              </div>
              <div className={`tab ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
                <span className="flourish flourish-1"></span>
                Stats
                <span className="flourish flourish-2"></span>
              </div>
              <div className={`tab ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>
                <span className="flourish flourish-1"></span>
                Recent
                <span className="flourish flourish-2"></span>
              </div>
            </div>

            <div className={`tab-content ${activeTab === "tracker" ? "active" : ""}`}>
              <TimeTracker />
              <div className="hidden-message hidden-message-1">Time is the devil's playground</div>
            </div>

            <div className={`tab-content ${activeTab === "stats" ? "active" : ""}`}>
              <DashboardStats />
              <div className="hidden-message hidden-message-2">Numbers never lie, but they do deceive</div>
            </div>

            <div className={`tab-content ${activeTab === "recent" ? "active" : ""}`}>
              <RecentShifts />
              <div className="hidden-message hidden-message-1">The past is written in blood</div>
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
