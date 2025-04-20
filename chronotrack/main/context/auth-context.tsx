"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"

interface AuthContextType {
  authenticated: boolean
  setAuthenticated: (value: boolean) => void
  resetSessionTimeout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Use localStorage to persist authentication state
const AUTH_STORAGE_KEY = "time-tracker-auth"
const LAST_ACTIVITY_KEY = "time-tracker-last-activity"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticatedState] = useState(false)
  // Use ref instead of state to avoid re-renders
  const lastActivityRef = useRef<number>(Date.now())

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      const storedLastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)

      if (storedAuth === "true") {
        // Check if the session has timed out
        const lastActivityTime = storedLastActivity ? Number.parseInt(storedLastActivity, 10) : 0
        const now = Date.now()
        const inactiveTime = now - lastActivityTime

        // If inactive for more than 90 seconds, log out
        if (inactiveTime > 90 * 1000) {
          setAuthenticatedState(false)
          localStorage.removeItem(AUTH_STORAGE_KEY)
          localStorage.removeItem(LAST_ACTIVITY_KEY)
        } else {
          setAuthenticatedState(true)
          lastActivityRef.current = lastActivityTime
        }
      }
    }
  }, [])

  // Update localStorage when auth state changes
  const setAuthenticated = useCallback((value: boolean) => {
    setAuthenticatedState(value)
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true")
        const now = Date.now()
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
        lastActivityRef.current = now
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(LAST_ACTIVITY_KEY)
      }
    }
  }, [])

  // Reset the session timeout without causing re-renders
  const resetSessionTimeout = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    if (typeof window !== "undefined" && authenticated) {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    }
  }, [authenticated])

  // Check for session timeout
  useEffect(() => {
    if (!authenticated) return

    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const now = Date.now()
        const inactiveTime = now - lastActivityRef.current

        // If inactive for more than 90 seconds, log out
        if (inactiveTime > 90 * 1000) {
          setAuthenticated(false)
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [authenticated, setAuthenticated])

  // Add global click handler to reset timeout on any user activity
  useEffect(() => {
    if (!authenticated) return

    const handleActivity = () => {
      resetSessionTimeout()
    }

    window.addEventListener("click", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    return () => {
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
    }
  }, [authenticated, resetSessionTimeout])

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, resetSessionTimeout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
