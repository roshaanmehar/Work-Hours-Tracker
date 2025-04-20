"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Key } from 'lucide-react'
import { useAuth } from "@/context/auth-context"
import styles from "./admin-login.module.css"

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const { adminLogin } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      setError("Please enter your password")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      const success = await adminLogin(password)
      
      if (success) {
        onSuccess()
      } else {
        setError("Invalid password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
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
        <button className={styles.closeButton} onClick={onCancel}>
          <X size={20} />
        </button>

        <div className={styles.iconContainer}>
          <Key size={32} />
        </div>

        <h2 className={styles.title}>Admin Authentication</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
