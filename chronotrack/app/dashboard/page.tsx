"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, History, LineChart, Settings } from "lucide-react"

import { TimeTracker } from "@/components/time-tracker"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentShifts } from "@/components/recent-shifts"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeStore } from "@/lib/store"

export default function Dashboard() {
  const { loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Clock className="h-4 w-4 text-white" />
              <div className="absolute -inset-0.5 animate-pulse rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-sm" />
            </div>
            <h1 className="text-xl font-bold">Hours Tracker Pro</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6">
              <li>
                <Link href="/dashboard" className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                  <Clock className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <History className="h-4 w-4" />
                  History
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <LineChart className="h-4 w-4" />
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Clock className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">
        <Tabs defaultValue="tracker" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracker">Time Tracker</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="tracker" className="space-y-4">
            <TimeTracker />
          </TabsContent>
          <TabsContent value="stats" className="space-y-4">
            <DashboardStats />
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            <RecentShifts />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t bg-white py-6 dark:bg-slate-950">
        <div className="container text-center text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Hours Tracker Pro. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
