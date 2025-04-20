import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/auth-context"
import AuthCheck from "@/components/auth-check"
import Preload from "@/components/preload"
import PageLoader from "@/components/page-loader"
import "./globals.css"

// Remove the Press_Start_2P font import and replace with a standard font-family
// that will be defined in globals.css

export const metadata: Metadata = {
  title: "Pixel Time Tracker",
  description: "Retro pixel art time tracking application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthCheck>
            {/* Add the page loader for transition effects */}
            <PageLoader />
            {children}
            <Preload />
          </AuthCheck>
          <div className="scanlines"></div>
        </AuthProvider>
      </body>
    </html>
  )
}
