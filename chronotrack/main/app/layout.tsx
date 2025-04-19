import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body>
        <div className="scanlines"></div>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
