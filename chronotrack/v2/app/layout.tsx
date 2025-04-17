import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Infernal Chronos - Lucifer's Time Keeper",
  description: "A devilishly elegant time tracking application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Hidden feathers */}
          <div className="feather" style={{ left: "10%" }}></div>
          <div className="feather" style={{ left: "30%" }}></div>
          <div className="feather" style={{ left: "50%" }}></div>
          <div className="feather" style={{ left: "70%" }}></div>
          <div className="feather" style={{ left: "90%" }}></div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
