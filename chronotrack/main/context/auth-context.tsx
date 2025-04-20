"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  authenticated: boolean
  setAuthenticated: (value: boolean) => void
  resetSessionTimeout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Reset the session timeout
  const resetSessionTimeout = () => {
    setLastActivity(Date.now())
  }

  // Check for session timeout
  useEffect(() => {
    if (!authenticated) return

    const interval = setInterval(() => {
      const now = Date.now()
      const inactiveTime = now - lastActivity

      // If inactive for more than 90 seconds, log out
      if (inactiveTime > 90 * 1000) {
        setAuthenticated(false)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [authenticated, lastActivity])

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
  }, [authenticated])

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
