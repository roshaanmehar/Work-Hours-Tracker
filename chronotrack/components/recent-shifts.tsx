"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimeStore } from "@/lib/store"
import { calculateDuration, formatDuration, formatMoney } from "@/lib/utils"

export function RecentShifts() {
  const { shifts, loadData } = useTimeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)
  }, [loadData])

  if (!mounted) {
    return null
  }

  // Get recent shifts (last 5)
  const recentShifts = [...shifts]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Shifts</CardTitle>
        <CardDescription>Your most recent work sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {recentShifts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <Clock className="mb-2 h-10 w-10 text-slate-300" />
            <h3 className="mb-1 text-lg font-medium">No shifts yet</h3>
            <p className="text-sm text-slate-500">Start tracking your time to see your shifts here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentShifts.map((shift) => {
              const startDate = new Date(shift.startTime)
              const endDate = shift.endTime ? new Date(shift.endTime) : null
              const duration = shift.endTime ? calculateDuration(shift.startTime, shift.endTime) : 0
              const earnings = duration * 12.5

              return (
                <div key={shift.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="font-medium">{format(startDate, "EEEE, MMMM d")}</div>
                    <div className="text-sm text-slate-500">
                      {format(startDate, "h:mm a")} - {endDate ? format(endDate, "h:mm a") : "In progress"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatDuration(duration)}</div>
                    <div className="text-sm text-slate-500">{formatMoney(earnings)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/history" className="flex items-center justify-center gap-1">
            View All History
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
