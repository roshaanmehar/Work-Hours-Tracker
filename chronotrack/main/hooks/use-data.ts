"use client"

import { useState, useEffect, useCallback } from "react"
import * as dataService from "@/lib/data-service"
import type { TimeEntry, Job, JobRule, Expense, AuditLogEntry, User } from "@/types/supabase"

// Generic hook for data fetching with loading and error states
function useData<T>(fetchFn: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    fetchData()
  }, [...dependencies, fetchData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refresh }
}

// Specific hooks for different data types
export function useTimeEntries() {
  return useData<TimeEntry[]>(dataService.getTimeEntries)
}

export function useTimeEntry(id: number) {
  return useData<TimeEntry>(() => dataService.getTimeEntry(id), [id])
}

export function useTodayTotal() {
  return useData<string>(dataService.getTodayTotal)
}

export function useJobs() {
  return useData<Job[]>(dataService.getJobs)
}

export function useJobRules() {
  return useData<JobRule[]>(dataService.getJobRules)
}

export function useExpenses() {
  return useData<Expense[]>(dataService.getExpenses)
}

export function useAuditLog() {
  return useData<AuditLogEntry[]>(dataService.getAuditLog)
}

export function useUserSettings() {
  return useData<User>(dataService.getUserSettings)
}

export function useSuggestedJob() {
  return useData<Job | null>(dataService.getSuggestedJob)
}

// Mutation hooks
export function useCreateTimeEntry() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.createTimeEntry(entry)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateTimeEntry() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number, updates: Partial<TimeEntry>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.updateTimeEntry(id, updates)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useDeleteTimeEntry() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number, reason: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.deleteTimeEntry(id, reason)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

// Similar hooks for other mutations
export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.createJob(job)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateJob() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number, updates: Partial<Job>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.updateJob(id, updates)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useDeleteJob() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.deleteJob(id)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useCreateJobRule() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (rule: Omit<JobRule, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.createJobRule(rule)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateJobRule() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number, updates: Partial<JobRule>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.updateJobRule(id, updates)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useDeleteJobRule() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.deleteJobRule(id)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useCreateExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (expense: Omit<Expense, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.createExpense(expense)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number, updates: Partial<Expense>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.updateExpense(id, updates)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useDeleteExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.deleteExpense(id)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateUserSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (updates: Partial<User>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.updateUserSettings(updates)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useVerifyPin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (pin: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.verifyPin(pin)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { verify, isLoading, error }
}

export function useVerifyAdminCredentials() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await dataService.verifyAdminCredentials(username, password)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { verify, isLoading, error }
}
