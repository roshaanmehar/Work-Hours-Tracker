"use client"

import { Clock, Calendar, BarChart2, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import styles from "./navbar.module.css"

export default function Navbar({
  activePage,
}: { activePage: "track" | "history" | "analytics" | "settings" | "admin" }) {
  const pathname = usePathname()
  const isAdmin = true // This would be determined by authentication in a real app

  // If activePage is not provided, determine it from the pathname
  const currentPage =
    activePage ||
    (pathname === "/"
      ? "track"
      : pathname === "/history"
        ? "history"
        : pathname === "/analytics"
          ? "analytics"
          : pathname === "/settings"
            ? "settings"
            : pathname === "/admin"
              ? "admin"
              : "track")

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Link href="/" className={`${styles.navItem} ${currentPage === "track" ? styles.active : ""}`}>
        <Clock size={22} />
        <span>Track</span>
      </Link>
      <Link href="/history" className={`${styles.navItem} ${currentPage === "history" ? styles.active : ""}`}>
        <Calendar size={22} />
        <span>History</span>
      </Link>
      <Link href="/analytics" className={`${styles.navItem} ${currentPage === "analytics" ? styles.active : ""}`}>
        <BarChart2 size={22} />
        <span>Stats</span>
      </Link>
      <Link href="/settings" className={`${styles.navItem} ${currentPage === "settings" ? styles.active : ""}`}>
        <Settings size={22} />
        <span>Settings</span>
      </Link>

      {isAdmin && (
        <Link href="/admin" className={`${styles.navItem} ${currentPage === "admin" ? styles.active : ""}`}>
          <Shield size={22} />
          <span>Admin</span>
        </Link>
      )}
    </motion.nav>
  )
}
