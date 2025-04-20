"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import PinLogin from "@/components/pin-login"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { authenticated, resetSessionTimeout } = useAuth()
  const pathname = usePathname()

  // Reset session timeout on route change, but only once when the path changes
  useEffect(() => {
    if (authenticated) {
      resetSessionTimeout()
    }
  }, [pathname, authenticated, resetSessionTimeout])

  if (!authenticated) {
    return <PinLogin />
  }

  return <>{children}</>
}
