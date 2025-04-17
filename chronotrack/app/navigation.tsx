"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link href="/" className={isActive("/") ? "active" : ""}>
          <div className="nav-item">Timer</div>
        </Link>

        <Link href="/history" className={isActive("/history") ? "active" : ""}>
          <div className="nav-item">History</div>
        </Link>

        <Link href="/analytics" className={isActive("/analytics") ? "active" : ""}>
          <div className="nav-item">Analytics</div>
        </Link>

        <Link href="/settings" className={isActive("/settings") ? "active" : ""}>
          <div className="nav-item">Settings</div>
        </Link>
      </div>

      <style jsx>{`
        .navigation {
          display: flex;
          justify-content: center;
          padding: 15px 0;
          border-bottom: 1px solid black;
          margin-bottom: 20px;
          background: white;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
        }
        
        .nav-item {
          padding: 8px 16px;
        }
        
        .active .nav-item {
          background: black;
          color: white;
        }
      `}</style>
    </nav>
  )
}
