import type React from "react"
import { Playfair_Display, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

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

export const metadata = {
  title: "Infernal Chronos - Lucifer's Time Keeper",
  description: "A devilishly elegant time tracking application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${cormorant.variable}`}>
        {/* Hidden feathers */}
        <div className="feather" style={{ left: "10%" }}></div>
        <div className="feather" style={{ left: "30%" }}></div>
        <div className="feather" style={{ left: "50%" }}></div>
        <div className="feather" style={{ left: "70%" }}></div>
        <div className="feather" style={{ left: "90%" }}></div>
        {children}
      </body>
    </html>
  )
}
