"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { TimeEntry } from "@/lib/types"
import { formatDuration } from "@/lib/utils"

interface MonthlyChartProps {
  entries: TimeEntry[]
}

export function MonthlyChart({ entries }: MonthlyChartProps) {
  const [data, setData] = useState<Array<{ name: string; hours: number }>>([])

  useEffect(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Create array for each day in the current month
    const monthData = Array.from({ length: daysInMonth }, (_, i) => {
      return {
        date: new Date(currentYear, currentMonth, i + 1),
        name: `${i + 1}`,
        hours: 0,
      }
    })

    // Fill in hours for each day
    entries.forEach((entry) => {
      const entryDate = new Date(entry.startTime)
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        const dayIndex = entryDate.getDate() - 1
        monthData[dayIndex].hours += (entry.duration || 0) / 3600
      }
    })

    setData(monthData)
  }, [entries])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = new Date()
      date.setDate(Number.parseInt(payload[0].payload.name))
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-sm">
          <p className="font-medium">{date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
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
          <XAxis dataKey="name" interval={Math.ceil(data.length / 15)} />
          <YAxis tickFormatter={(value) => `${Math.round(value)}h`} domain={[0, "dataMax + 1"]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" fill="#ec4899" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
