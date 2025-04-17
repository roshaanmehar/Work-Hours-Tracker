"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Clock, Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export default function HistoryPage() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  const filteredShifts = shifts
    .filter((shift) => {
      if (filter === "all") return true
      if (filter === "today") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        return (
          shiftDate.getDate() === today.getDate() &&
          shiftDate.getMonth() === today.getMonth() &&
          shiftDate.getFullYear() === today.getFullYear()
        )
      }
      if (filter === "week") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        const diffTime = Math.abs(today.getTime() - shiftDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      }
      if (filter === "month") {
        const today = new Date()
        const shiftDate = new Date(shift.startTime)
        return shiftDate.getMonth() === today.getMonth() && shiftDate.getFullYear() === today.getFullYear()
      }
      return true
    })
    .filter((shift) => {
      if (!searchTerm) return true
      const date = format(new Date(shift.startTime), "PPP")
      return date.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const totalHours = filteredShifts.reduce((acc, shift) => {
    if (shift.endTime) {
      return acc + calculateDuration(shift.startTime, shift.endTime)
    }
    return acc
  }, 0)

  const totalEarnings = totalHours * 12.5

  const handleExport = () => {
    const csvContent = [
      ["Date", "Start Time", "End Time", "Duration", "Earnings"],
      ...filteredShifts.map((shift) => {
        const startDate = new Date(shift.startTime)
        const endDate = shift.endTime ? new Date(shift.endTime) : null
        const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
        const earnings = duration * 12.5

        return [
          format(startDate, "PPP"),
          format(startDate, "p"),
          endDate ? format(endDate, "p") : "In progress",
          formatDuration(duration),
          formatMoney(earnings),
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `hours-tracker-export-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="container flex h-16 items-center">
          <Link
            href="/dashboard"
            className="mr-4 flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">Shift History</h1>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">
        <Card>
          <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Shift History</CardTitle>
              <CardDescription>View and manage your past shifts</CardDescription>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
              <Button onClick={handleExport} variant="outline" size="icon" title="Export to CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <h3 className="text-sm font-medium opacity-80">Total Hours</h3>
                <p className="text-2xl font-bold">{formatDuration(totalHours)}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                <h3 className="text-sm font-medium opacity-80">Total Earnings</h3>
                <p className="text-2xl font-bold">{formatMoney(totalEarnings)}</p>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No shifts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShifts.map((shift) => {
                      const startDate = new Date(shift.startTime)
                      const endDate = shift.endTime ? new Date(shift.endTime) : null
                      const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
                      const earnings = duration * 12.5

                      return (
                        <TableRow key={shift.id}>
                          <TableCell className="font-medium">{format(startDate, "PPP")}</TableCell>
                          <TableCell>{format(startDate, "p")}</TableCell>
                          <TableCell>
                            {endDate ? (
                              format(endDate, "p")
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                                In progress
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatDuration(duration)}</TableCell>
                          <TableCell className="text-right">{formatMoney(earnings)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
