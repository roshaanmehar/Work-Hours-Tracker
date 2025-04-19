"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw, Download, User, Clock, Shield, Key } from "lucide-react"
import Navbar from "@/components/navbar"
import AdminLogin from "@/components/admin-login"
import styles from "./page.module.css"

export default function SettingsPage() {
  const [timeZone, setTimeZone] = useState("America/New_York")
  const [syncStatus, setSyncStatus] = useState("Last synced: 10 minutes ago")
  const [isSyncing, setIsSyncing] = useState(false)
  const [showAdminSection, setShowAdminSection] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null)

  // Session timeout handler - reset after 90 seconds of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Redirect to login page
      window.location.href = "/"
    }, 90 * 1000)

    // Cleanup on unmount
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const resetSessionTimeout = () => {
    // No need to do anything here since we're using a single timeout
    // that gets cleared on component unmount
  }

  const handleSync = () => {
    resetSessionTimeout()
    setIsSyncing(true)
    setSyncStatus("Syncing...")

    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false)
      setSyncStatus("Last synced: Just now")
    }, 2000)
  }

  const handleAdminLogin = () => {
    setAdminAuthenticated(true)
    setShowAdminSection(false)
  }

  return (
    <div className={styles.container} onClick={resetSessionTimeout}>
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
          <Key size={18} />
          <h2>Security</h2>
        </div>

        <div className={styles.buttonGroup}>
          <motion.button className={styles.button} whileTap={{ scale: 0.95 }}>
            Change PIN
          </motion.button>
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

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Shield size={18} />
          <h2>Admin Access</h2>
        </div>

        {adminAuthenticated ? (
          <div className={styles.adminSection}>
            <div className={styles.adminMessage}>You are authenticated as an administrator.</div>

            <div className={styles.adminPanel}>
              <h3>Job Management</h3>
              <div className={styles.jobList}>
                <div className={styles.jobItem}>
                  <div className={styles.jobDetails}>
                    <span className={styles.jobName}>Web Development</span>
                    <span className={styles.jobRate}>$50/hr</span>
                  </div>
                  <div className={styles.jobActions}>
                    <button className={styles.smallButton}>Edit</button>
                    <button className={styles.smallButton}>Delete</button>
                  </div>
                </div>

                <div className={styles.jobItem}>
                  <div className={styles.jobDetails}>
                    <span className={styles.jobName}>Design Work</span>
                    <span className={styles.jobRate}>$45/hr</span>
                  </div>
                  <div className={styles.jobActions}>
                    <button className={styles.smallButton}>Edit</button>
                    <button className={styles.smallButton}>Delete</button>
                  </div>
                </div>

                <div className={styles.jobItem}>
                  <div className={styles.jobDetails}>
                    <span className={styles.jobName}>Client Meeting</span>
                    <span className={styles.jobRate}>$60/hr</span>
                  </div>
                  <div className={styles.jobActions}>
                    <button className={styles.smallButton}>Edit</button>
                    <button className={styles.smallButton}>Delete</button>
                  </div>
                </div>
              </div>

              <button className={styles.addButton}>+ Add New Job</button>

              <h3>Default Job Rules</h3>
              <div className={styles.rulesList}>
                <div className={styles.ruleItem}>
                  <div className={styles.ruleDetails}>
                    <span>Monday-Friday, 9:00-12:00</span>
                    <span className={styles.jobName}>Web Development</span>
                  </div>
                  <div className={styles.ruleActions}>
                    <button className={styles.smallButton}>Edit</button>
                    <button className={styles.smallButton}>Delete</button>
                  </div>
                </div>

                <div className={styles.ruleItem}>
                  <div className={styles.ruleDetails}>
                    <span>Monday-Friday, 12:00-14:00</span>
                    <span className={styles.jobName}>Client Meeting</span>
                  </div>
                  <div className={styles.ruleActions}>
                    <button className={styles.smallButton}>Edit</button>
                    <button className={styles.smallButton}>Delete</button>
                  </div>
                </div>
              </div>

              <button className={styles.addButton}>+ Add New Rule</button>

              <h3>Audit Log</h3>
              <div className={styles.auditLog}>
                <div className={styles.logEntry}>
                  <span className={styles.logTime}>2025-04-20 09:15:22</span>
                  <span className={styles.logAction}>Clock In</span>
                  <span className={styles.logDetails}>Job: Web Development</span>
                </div>

                <div className={styles.logEntry}>
                  <span className={styles.logTime}>2025-04-20 12:30:45</span>
                  <span className={styles.logAction}>Clock Out</span>
                  <span className={styles.logDetails}>Duration: 03:15:23</span>
                </div>

                <div className={styles.logEntry}>
                  <span className={styles.logTime}>2025-04-19 16:42:10</span>
                  <span className={styles.logAction}>Modified Entry</span>
                  <span className={styles.logDetails}>Changed clock-in time from 09:00 to 08:45</span>
                </div>
              </div>

              <button className={styles.viewMoreButton}>View Full Audit Log</button>
            </div>
          </div>
        ) : (
          <div className={styles.adminLoginPrompt}>
            <p>Admin authentication required to access job management, default job rules, and audit logs.</p>
            <motion.button
              className={styles.adminButton}
              onClick={() => setShowAdminSection(true)}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={16} />
              Authenticate as Admin
            </motion.button>
          </div>
        )}
      </div>

      {showAdminSection && <AdminLogin onSuccess={handleAdminLogin} onCancel={() => setShowAdminSection(false)} />}

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
