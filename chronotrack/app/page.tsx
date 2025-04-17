import Link from "next/link"
import styles from "./page.module.css"
import TimeTrackerClient from "./client"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.grid}>
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className={styles.gridCell} style={{ animationDelay: `${Math.random() * 5}s` }} />
          ))}
        </div>
      </div>
      
      <header className={styles.header}>
        <h1 className={styles.logo}>
          <span className={styles.logoText}>CHRONO</span>
          <span className={styles.logoAccent}>TRACK</span>
        </h1>
        <nav className={styles.nav}>
          <Link href="/analytics" className={styles.navLink}>
            Analytics
          </Link>
          <Link href="/history" className={styles.navLink}>
            History
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.clockContainer}>
            <div className={styles.clockFace}>
              <div className={styles.clockHand} id="seconds-hand"></div>
              <div className={styles.clockHand} id="minutes-hand"></div>
              <div className={styles.clockHand} id="hours-hand"></div>
              <div className={styles.clockCenter}></div>
            </div>
            <div className={styles.digitalTime} id="current-time">00:00:00</div>
            <div className={styles.date} id="current-date">Loading...</div>
          </div>

          <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.clockInButton}`} id="clock-in-btn">
              <span className={styles.buttonText}>CLOCK IN</span>
              <div className={styles.buttonEffect}></div>
            </button>
            <button className={`${styles.button} ${styles.clockOutButton}`} id="clock-out-btn" disabled>
              <span className={styles.buttonText}>CLOCK OUT</span>
              <div className={styles.buttonEffect}></div>
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>TODAY</span>
              <span className={styles.statValue} id="today-hours">0h 0m</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>THIS WEEK</span>
              <span className={styles.statValue} id="week-hours">0h 0m</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>EARNINGS</span>
              <span className={styles.statValue} id="earnings">$0.00</span>
            </div>
          </div>

          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>Weekly Target: 20h</span>
              <span id="progress-text">0%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressRegular} id="progress-regular"></div>
              <div className={styles.progressOvertime} id="progress-overtime"></div>
            </div>
          </div>
          
          <div className={styles.dataManagement}>
            <div className={styles.syncStatus} id="sync-status"></div>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton} id="export-btn">
                Export Data
              </button>
              <button className={styles.actionButton} id="import-btn">
                Import Data
              </button>
              <input type="file" id="file-input" className={styles.fileInput} accept=".json" />
              <button className={styles.actionButton} id="sync-btn">
                Sync to Sheets
              </button>
            </div>
          </div>
        </div>
      </main>
      <TimeTrackerClient />
    </div>
  )
}
