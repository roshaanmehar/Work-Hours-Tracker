import { supabase, handleSupabaseError } from "./supabase"
import type { TimeEntry, Job, JobRule, Expense, AuditLogEntry, User } from "@/types/supabase"

// Current user context - in a real app, this would come from auth
// For now, we'll use a placeholder
const CURRENT_USER_ID = "current-user-id"

// Time Entries
export async function getTimeEntries() {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, jobs(name, rate)")
      .eq("user_id", CURRENT_USER_ID)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function getTimeEntry(id: number) {
  try {
    const { data, error } = await supabase.from("time_entries").select("*, jobs(name, rate)").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createTimeEntry(entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .insert([{ ...entry, user_id: CURRENT_USER_ID }])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateTimeEntry(id: number, updates: Partial<TimeEntry>) {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteTimeEntry(id: number, reason: string) {
  try {
    // Soft delete by updating status
    const { data, error } = await supabase
      .from("time_entries")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
        deleted_by: CURRENT_USER_ID,
        reason,
      })
      .eq("id", id)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function getTodayTotal() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("time_entries")
      .select("duration")
      .eq("user_id", CURRENT_USER_ID)
      .eq("date", today)
      .eq("status", "active")

    if (error) throw error

    // Calculate total duration
    let totalSeconds = 0
    data?.forEach((entry) => {
      if (entry.duration) {
        const [hours, minutes, seconds] = entry.duration.split(":").map(Number)
        totalSeconds += hours * 3600 + minutes * 60 + seconds
      }
    })

    // Format as HH:MM:SS
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("Error getting today total:", error)
    return "00:00:00" // Fallback
  }
}

// Jobs
export async function getJobs() {
  try {
    const { data, error } = await supabase.from("jobs").select("*").order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createJob(job: Omit<Job, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("jobs").insert([job]).select()

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Added Job",
      details: `Added new job: ${job.name}`,
    })

    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateJob(id: number, updates: Partial<Job>) {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Updated Job",
      details: `Updated job: ${updates.name || id}`,
    })

    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteJob(id: number) {
  try {
    // Get job name for audit log
    const { data: job } = await supabase.from("jobs").select("name").eq("id", id).single()

    const { error } = await supabase.from("jobs").delete().eq("id", id)

    if (error) throw error

    // Log to audit
    if (job) {
      await createAuditLog({
        user_id: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
        action: "Deleted Job",
        details: `Deleted job: ${job.name}`,
      })
    }

    return true
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

// Job Rules
export async function getJobRules() {
  try {
    const { data, error } = await supabase.from("job_rules").select("*, jobs(name)").order("id")

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createJobRule(rule: Omit<JobRule, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("job_rules").insert([rule]).select()

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Added Job Rule",
      details: `Added new job rule for days: ${rule.days}`,
    })

    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateJobRule(id: number, updates: Partial<JobRule>) {
  try {
    const { data, error } = await supabase
      .from("job_rules")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Updated Job Rule",
      details: `Updated job rule: ${id}`,
    })

    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteJobRule(id: number) {
  try {
    const { error } = await supabase.from("job_rules").delete().eq("id", id)

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Deleted Job Rule",
      details: `Deleted job rule: ${id}`,
    })

    return true
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

// Expenses
export async function getExpenses() {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*, jobs(name)")
      .eq("user_id", CURRENT_USER_ID)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createExpense(expense: Omit<Expense, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert([{ ...expense, user_id: CURRENT_USER_ID }])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateExpense(id: number, updates: Partial<Expense>) {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteExpense(id: number) {
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

// Audit Log
export async function getAuditLog() {
  try {
    const { data, error } = await supabase.from("audit_log").select("*").order("timestamp", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createAuditLog(entry: Omit<AuditLogEntry, "id" | "created_at">) {
  try {
    const { data, error } = await supabase.from("audit_log").insert([entry]).select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error("Error creating audit log:", error)
    // Don't throw here to prevent cascading errors
    return null
  }
}

// User Settings
export async function getUserSettings() {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", CURRENT_USER_ID).single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateUserSettings(updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", CURRENT_USER_ID)
      .select()

    if (error) throw error

    // Log to audit
    await createAuditLog({
      user_id: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      action: "Updated Settings",
      details: `Updated user settings`,
    })

    return data?.[0]
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

// Authentication
export async function verifyPin(pin: string) {
  try {
    const { data, error } = await supabase.from("users").select("id").eq("pin", pin).single()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error("Error verifying PIN:", error)
    return false
  }
}

export async function verifyAdminCredentials(username: string, password: string) {
  try {
    // In a real app, you would use a secure password verification method
    // This is just a placeholder for demonstration
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .eq("password_hash", password) // This is insecure, just for demo
      .single()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error("Error verifying admin credentials:", error)
    return false
  }
}

// Helper function to get suggested job based on current time and day
export async function getSuggestedJob() {
  try {
    // Get all job rules
    const { data: rules, error } = await supabase.from("job_rules").select("*, jobs(id, name, rate)")

    if (error) throw error

    if (!rules || rules.length === 0) {
      // Fallback to first job if no rules
      const { data: jobs } = await supabase.from("jobs").select("*").limit(1)

      return jobs?.[0] || null
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTime = currentHour + currentMinutes / 60 // Convert to decimal time

    // Get day of week as string (0 = Sunday, 1 = Monday, etc.)
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = daysOfWeek[now.getDay()]

    // Find matching rule
    for (const rule of rules) {
      // Check if current day matches the rule
      const matchesDay = checkDayMatch(currentDay, rule.days)

      if (matchesDay) {
        // Parse time range
        const [startTime, endTime] = parseTimeRange(rule.time_range)

        if (currentTime >= startTime && currentTime < endTime) {
          // Return the job from the rule
          return rule.jobs
        }
      }
    }

    // Fallback to first job if no matching rule
    const { data: jobs } = await supabase.from("jobs").select("*").limit(1)

    return jobs?.[0] || null
  } catch (error) {
    console.error("Error getting suggested job:", error)
    return null
  }
}

// Helper function to check if the current day matches the rule's day specification
function checkDayMatch(currentDay: string, ruleDays: string) {
  if (ruleDays === "Weekends") {
    return currentDay === "Saturday" || currentDay === "Sunday"
  }

  if (ruleDays === "Monday-Friday") {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(currentDay)
  }

  // Handle multiple days separated by commas
  if (ruleDays.includes(",")) {
    const days = ruleDays.split(",").map((d) => d.trim())
    return days.includes(currentDay)
  }

  // Single day match
  return ruleDays === currentDay
}

// Helper function to parse time range string (e.g., "9:00-17:00") into decimal hours
function parseTimeRange(timeRange: string) {
  const [start, end] = timeRange.split("-")

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours + minutes / 60
  }

  return [parseTime(start), parseTime(end)]
}
