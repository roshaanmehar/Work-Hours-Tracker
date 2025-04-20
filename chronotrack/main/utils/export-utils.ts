// Function to format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Function to format time as HH:MM:SS
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":")
}

// Function to calculate duration between two dates
export function calculateDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime()
  return formatTime(durationMs)
}

// Function to export data to CSV format
export function exportToCSV(data: any[], filename: string): void {
  // Convert data to CSV format
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          // Handle values that need quotes (strings with commas, etc.)
          const value = row[header]
          const valueStr = value === null || value === undefined ? "" : String(value)
          return valueStr.includes(",") ? `"${valueStr}"` : valueStr
        })
        .join(","),
    ),
  ]

  const csvContent = csvRows.join("\n")

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Function to prepare data for Google Sheets
export function prepareForGoogleSheets(timeEntries: any[]): any[] {
  return timeEntries.map((entry) => ({
    Date: entry.date,
    "Clock In": entry.clockIn,
    "Clock Out": entry.clockOut,
    Duration: entry.duration,
    Job: entry.job,
    "Rate (£/hr)": entry.rate,
    "Earnings (£)": entry.earnings,
    Breaks: entry.breaks.length > 0 ? entry.breaks.map((b: any) => `${b.start}-${b.end}`).join("; ") : "None",
  }))
}

// Function to prepare expense data for Google Sheets
export function prepareExpensesForGoogleSheets(expenses: any[]): any[] {
  return expenses.map((expense) => ({
    Date: expense.date,
    Category: expense.category,
    Description: expense.description,
    Amount: expense.amount.toFixed(2),
    Job: expense.job,
    Billable: expense.billable ? "Yes" : "No",
  }))
}

// Function to calculate weekly summary
export function calculateWeeklySummary(timeEntries: any[]): any[] {
  // Group entries by week
  const weeklyData: Record<string, any> = {}

  timeEntries.forEach((entry) => {
    const date = new Date(entry.date)
    // Get the week start date (Sunday)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = formatDate(weekStart)

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        weekStart: weekKey,
        weekEnd: formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)),
        totalHours: 0,
        totalEarnings: 0,
        jobBreakdown: {},
        entries: [],
      }
    }

    // Add hours and earnings
    const durationParts = entry.duration.split(":").map(Number)
    const hours = durationParts[0] + durationParts[1] / 60 + durationParts[2] / 3600

    weeklyData[weekKey].totalHours += hours
    weeklyData[weekKey].totalEarnings += entry.earnings

    // Add job breakdown
    if (!weeklyData[weekKey].jobBreakdown[entry.job]) {
      weeklyData[weekKey].jobBreakdown[entry.job] = {
        hours: 0,
        earnings: 0,
      }
    }

    weeklyData[weekKey].jobBreakdown[entry.job].hours += hours
    weeklyData[weekKey].jobBreakdown[entry.job].earnings += entry.earnings

    // Add entry to the week
    weeklyData[weekKey].entries.push(entry)
  })

  // Convert to array and sort by week
  return Object.values(weeklyData).sort(
    (a: any, b: any) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime(),
  )
}

// Function to calculate profit and loss
export function calculateProfitLoss(
  timeEntries: any[],
  expenses: any[],
): {
  totalEarnings: number
  totalExpenses: number
  profitLoss: number
  profitMargin: number
} {
  const totalEarnings = timeEntries.reduce((sum, entry) => sum + entry.earnings, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profitLoss = totalEarnings - totalExpenses
  const profitMargin = totalEarnings > 0 ? (profitLoss / totalEarnings) * 100 : 0

  return {
    totalEarnings,
    totalExpenses,
    profitLoss,
    profitMargin,
  }
}
