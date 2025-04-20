"use client"

import { Clock, Calendar, BarChart2, Shield, DollarSign, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./navbar.module.css"

export default function Navbar({
  activePage,
}: {
  activePage: "track" | "history" | "analytics" | "admin" | "expenses" | "reports"
}) {
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
          : pathname === "/admin"
            ? "admin"
            : pathname === "/expenses"
              ? "expenses"
              : pathname === "/reports"
                ? "reports"
                : "track")

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={`${styles.navItem} ${currentPage === "track" ? styles.active : ""}`} prefetch={true}>
        <Clock size={22} />
        <span>Track</span>
      </Link>
      <Link
        href="/history"
        className={`${styles.navItem} ${currentPage === "history" ? styles.active : ""}`}
        prefetch={true}
      >
        <Calendar size={22} />
        <span>History</span>
      </Link>
      <Link
        href="/reports"
        className={`${styles.navItem} ${currentPage === "reports" ? styles.active : ""}`}
        prefetch={true}
      >
        <FileText size={22} />
        <span>Reports</span>
      </Link>
      <Link
        href="/expenses"
        className={`${styles.navItem} ${currentPage === "expenses" ? styles.active : ""}`}
        prefetch={true}
      >
        <DollarSign size={22} />
        <span>Expenses</span>
      </Link>
      <Link
        href="/analytics"
        className={`${styles.navItem} ${currentPage === "analytics" ? styles.active : ""}`}
        prefetch={true}
      >
        <BarChart2 size={22} />
        <span>Stats</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className={`${styles.navItem} ${currentPage === "admin" ? styles.active : ""}`}
          prefetch={true}
        >
          <Shield size={22} />
          <span>Admin</span>
        </Link>
      )}
    </nav>
  )
}
