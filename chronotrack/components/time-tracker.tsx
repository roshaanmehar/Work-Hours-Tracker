"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Clock, Pause, Play, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTimeStore } from "@/lib/store"
import { formatDuration, formatMoney } from "@/lib/utils"

export function TimeTracker() {
  const { addShift, updateShift, shifts, loadData } = useTimeStore()
  const [isTracking, setIsTracking] = useState(false)
  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Check if there's an active shift
  useEffect(() => {
    loadData()

    const activeShift = shifts.find((shift) => !shift.endTime)
    if (activeShift) {
      setIsTracking(true)
      setCurrentShiftId(activeShift.id)
      setStartTime(new Date(activeShift.startTime))

      // Start the timer
      const interval = setInterval(() => {
        const now = new Date()
        const start = new Date(activeShift.startTime)
        const diffInHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60)
        setElapsedTime(diffInHours)
        setEarnings(diffInHours * 12.5)
      }, 1000)

      setTimerInterval(interval)
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [loadData, shifts])

  const handleStartTracking = () => {
    const now = new Date()
    const id = crypto.randomUUID()

    addShift({
      id,
      startTime: now.toISOString(),
      endTime: null,
      notes: "",
    })

    setIsTracking(true)
    setCurrentShiftId(id)
    setStartTime(now)
    setElapsedTime(0)
    setEarnings(0)

    // Start the timer
    const interval = setInterval(() => {
      const currentTime = new Date()
      const diffInHours = (currentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      setElapsedTime(diffInHours)
      setEarnings(diffInHours * 12.5)
    }, 1000)

    setTimerInterval(interval)
  }

  const handleStopTracking = () => {
    if (timerInterval) clearInterval(timerInterval)

    if (currentShiftId) {
      const now = new Date()

      updateShift(currentShiftId, {
        endTime: now.toISOString(),
      })
    }

    setIsTracking(false)
    setCurrentShiftId(null)
    setTimerInterval(null)
  }

  const handlePauseTracking = () => {
    // This would be implemented in a real app
    // For now, we'll just stop tracking
    handleStopTracking()
  }

  return (
    <Card className="overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Clock className="h-6 w-6 text-purple-500" />
          Time Tracker
        </CardTitle>
        <CardDescription>Track your working hours and earnings</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-white/50 p-6 text-center backdrop-blur-sm dark:bg-slate-900/50">
          <div className="text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
            {formatDuration(elapsedTime)}
          </div>
          <div className="text-lg font-medium text-slate-500">{formatMoney(earnings)}</div>
          {startTime && <div className="mt-2 text-sm text-slate-500">Started at {format(startTime, "h:mm a")}</div>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress today</span>
            <span className="font-medium">{Math.min(Math.round((elapsedTime / 8) * 100), 100)}%</span>
          </div>
          <Progress value={Math.min((elapsedTime / 8) * 100, 100)} className="h-2" />
          <p className="text-xs text-slate-500">Based on 8 hour workday</p>
        </div>
      </CardContent>
      <CardFooter className="relative flex gap-4">
        {isTracking ? (
          <>
            <Button variant="outline" className="flex-1" onClick={handlePauseTracking}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleStopTracking}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </>
        ) : (
          <Button
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={handleStartTracking}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Tracking
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
