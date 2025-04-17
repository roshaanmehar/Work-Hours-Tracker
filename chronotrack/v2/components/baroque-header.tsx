import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

interface BaroqueHeaderProps {
  activePage: "dashboard" | "history" | "analytics" | "settings"
  scrolled: boolean
}

export default function BaroqueHeader({ activePage, scrolled }: BaroqueHeaderProps) {
  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-content">
        <Link href="/dashboard" className="logo">
          <div className="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span className="logo-text">Tempus</span>
        </Link>
        <nav className="nav">
          <Link href="/dashboard" className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}>
            Dashboard
          </Link>
          <Link href="/history" className={`nav-link ${activePage === "history" ? "active" : ""}`}>
            History
          </Link>
          <Link href="/analytics" className={`nav-link ${activePage === "analytics" ? "active" : ""}`}>
            Analytics
          </Link>
          <Link href="/settings" className={`nav-link ${activePage === "settings" ? "active" : ""}`}>
            Settings
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
