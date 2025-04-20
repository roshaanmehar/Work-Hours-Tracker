import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"

// Initialize the Press Start 2P font
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
})

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
    <html lang="en" className={pixelFont.variable}>
      <body>
        <AuthProvider>
          {children}
          <div className="scanlines"></div>
        </AuthProvider>
      </body>
    </html>
  )
}
