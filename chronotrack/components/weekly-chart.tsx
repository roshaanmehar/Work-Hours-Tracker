"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { TimeEntry } from "@/lib/types"
import { formatDuration } from "@/lib/utils"

interface WeeklyChartProps {
  entries: TimeEntry[]
}

export function WeeklyChart({ entries }: WeeklyChartProps) {
  const [data, setData] = useState<Array<{ name: string; hours: number }>>([])

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const now = new Date()
    const dayOfWeek = now.getDay()

    // Create array for the last 7 days
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - ((dayOfWeek - i + 7) % 7))
      return {
        date: d,
        name: days[i],
        hours: 0,
      }
    })

    // Fill in hours for each day
    entries.forEach((entry) => {
      const entryDate = new Date(entry.startTime)
      const dayIndex = weekData.findIndex(
        (d) =>
          d.date.getDate() === entryDate.getDate() &&
          d.date.getMonth() === entryDate.getMonth() &&
          d.date.getFullYear() === entryDate.getFullYear(),
      )

      if (dayIndex !== -1) {
        weekData[dayIndex].hours += (entry.duration || 0) / 3600
      }
    })

    setData(weekData)
  }, [entries])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>{formatDuration(payload[0].value * 3600)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${Math.round(value)}h`} domain={[0, "dataMax + 1"]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" fill="#ec4899" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
