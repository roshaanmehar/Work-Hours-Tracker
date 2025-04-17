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
            <span className="logo-text">Tempus</span>
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
          <div className="tabs">
            <div className={`tab ${activeTab === "tracker" ? "active" : ""}`} onClick={() => setActiveTab("tracker")}>
              Time Tracker
            </div>
            <div className={`tab ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
              Stats
            </div>
            <div className={`tab ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>
              Recent
            </div>
          </div>

          <div className={`tab-content ${activeTab === "tracker" ? "active" : ""}`}>
            <TimeTracker />
          </div>

          <div className={`tab-content ${activeTab === "stats" ? "active" : ""}`}>
            <DashboardStats />
          </div>

          <div className={`tab-content ${activeTab === "recent" ? "active" : ""}`}>
            <RecentShifts />
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
