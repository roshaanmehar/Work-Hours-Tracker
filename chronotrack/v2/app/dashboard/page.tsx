"use client"

import { useState } from "react"
import LuciferHeader from "@/components/lucifer-header"
import LuciferFooter from "@/components/lucifer-footer"
import TimeTracker from "@/components/time-tracker"
import RecentShifts from "@/components/recent-shifts"
import DashboardStats from "@/components/dashboard-stats"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("tracker")

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <LuciferHeader activePage="dashboard" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="lucifer-border p-8 relative">
            <div className="flex border-b border-[#d4af37] mb-8">
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${activeTab === "tracker" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setActiveTab("tracker")}
              >
                Time Tracker
              </div>
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${activeTab === "stats" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                Stats
              </div>
              <div
                className={`px-8 py-4 text-lg font-serif font-semibold cursor-pointer relative ${activeTab === "recent" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : ""}`}
                onClick={() => setActiveTab("recent")}
              >
                Recent
              </div>
            </div>

            <div className={`${activeTab === "tracker" ? "block" : "hidden"} animate-fadeIn`}>
              <TimeTracker />
            </div>

            <div className={`${activeTab === "stats" ? "block" : "hidden"} animate-fadeIn`}>
              <div className="card lucifer-border chiaroscuro">
                <div className="hidden-message absolute bottom-4 right-4">Numbers never lie, but they do deceive</div>
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Statistics</h2>
                  <p className="text-lg opacity-70 italic">Your time tracking overview</p>
                </div>
                <DashboardStats />
              </div>
            </div>

            <div className={`${activeTab === "recent" ? "block" : "hidden"} animate-fadeIn`}>
              <RecentShifts />
            </div>
          </div>
        </div>
      </main>

      <LuciferFooter />
    </div>
  )
}
