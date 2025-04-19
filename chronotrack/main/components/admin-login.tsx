"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, X } from "lucide-react"
import styles from "./admin-login.module.css"

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  // Mock credentials for demo purposes
  const CORRECT_USERNAME = "admin"
  const CORRECT_PASSWORD = "password"
  const MAX_ATTEMPTS = 3
  const LOCK_DURATION = 60 // seconds

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (locked) return

    // In a real app, this would make an API call to verify the credentials
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      setError("")
      onSuccess()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError("Invalid username or password")

      // Lock after max attempts
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true)
        setLockTimer(LOCK_DURATION)
        setError(`Too many attempts. Locked for ${LOCK_DURATION} seconds.`)

        // Start countdown
        const interval = setInterval(() => {
          setLockTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setLocked(false)
              setAttempts(0)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }
  }

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Shield size={18} />
            <h2>Admin Authentication</h2>
          </div>
          <button className={styles.closeButton} onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={locked}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={locked}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {locked && (
            <div className={styles.lockedMessage}>
              Locked for <span className={styles.timer}>{lockTimer}</span> seconds
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.loginButton} disabled={locked || !username || !password}>
              Login
            </button>
          </div>

          <div className={styles.hint}>Demo credentials: admin / password</div>
        </form>
      </motion.div>
    </div>
  )
}
