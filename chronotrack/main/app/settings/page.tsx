"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw, Download, User, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import styles from "./page.module.css"

export default function SettingsPage() {
  const [timeZone, setTimeZone] = useState("America/New_York")
  const [syncStatus, setSyncStatus] = useState("Last synced: 10 minutes ago")
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = () => {
    setIsSyncing(true)
    setSyncStatus("Syncing...")

    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false)
      setSyncStatus("Last synced: Just now")
    }, 2000)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={18} />
          <h2>User Settings</h2>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" className={styles.input} defaultValue="John Doe" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" className={styles.input} defaultValue="john.doe@example.com" />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Clock size={18} />
          <h2>Time Settings</h2>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="timezone">Time Zone</label>
          <select
            id="timezone"
            className={styles.select}
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="format">Time Format</label>
          <select id="format" className={styles.select} defaultValue="12h">
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <RefreshCw size={18} />
          <h2>Sync Settings</h2>
        </div>

        <p className={styles.syncStatus}>{syncStatus}</p>

        <div className={styles.buttonGroup}>
          <motion.button className={styles.button} onClick={handleSync} whileTap={{ scale: 0.95 }} disabled={isSyncing}>
            {isSyncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <RefreshCw size={16} />
              </motion.div>
            ) : (
              <RefreshCw size={16} />
            )}
            Sync Now
          </motion.button>

          <motion.button className={styles.button} whileTap={{ scale: 0.95 }}>
            <Download size={16} />
            Export Data
          </motion.button>
        </div>
      </div>

      <div className={styles.saveButtonContainer}>
        <motion.button className={`${styles.button} ${styles.saveButton}`} whileTap={{ scale: 0.95 }}>
          <Save size={16} />
          Save Settings
        </motion.button>
      </div>

      <Navbar activePage="settings" />
    </div>
  )
}
