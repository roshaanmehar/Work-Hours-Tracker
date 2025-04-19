"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Lock, X } from "lucide-react"
import styles from "./pin-login.module.css"

interface PinLoginProps {
  onSuccess: () => void
}

export default function PinLogin({ onSuccess }: PinLoginProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""])
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Mock PIN for demo purposes - in real app, this would be verified against a hashed value in the database
  const CORRECT_PIN = ["2", "2", "1", "6"]
  const MAX_ATTEMPTS = 3
  const LOCK_DURATION = 30 // seconds

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1)
      }, 1000)
    } else if (locked && lockTimer === 0) {
      setLocked(false)
      setAttempts(0)
      setError("") // Clear the error message when unlocking
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [locked, lockTimer])

  const handlePinChange = (index: number, value: string) => {
    if (locked) return

    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value

    setPin(newPin)
    setError("")

    // Auto-focus next input
    if (value && index < pin.length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }

    // Check if PIN is complete
    if (index === pin.length - 1 && value) {
      setTimeout(() => {
        verifyPin(newPin)
      }, 300)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return

    // Handle backspace
    if (e.key === "Backspace") {
      if (pin[index] === "" && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const verifyPin = (pinArray: string[]) => {
    // In a real app, this would make an API call to verify the PIN
    const isCorrect = pinArray.join("") === CORRECT_PIN.join("")

    if (isCorrect) {
      setError("")
      onSuccess()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setPin(["", "", "", ""])
      setError("Incorrect PIN. Please try again.")

      // Focus the first input after clearing
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }

      // Lock after max attempts
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true)
        setLockTimer(LOCK_DURATION)
        setError(`Too many attempts. Locked for ${LOCK_DURATION} seconds.`)
      }
    }
  }

  const clearPin = () => {
    setPin(["", "", "", ""])
    setError("")
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.lockIcon}>
          <Lock size={32} />
        </div>
        <h1 className={styles.title}>ENTER PIN</h1>

        <div className={styles.pinContainer}>
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={locked}
              className={styles.pinInput}
            />
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.errorMessage}>
            {error}
          </motion.div>
        )}

        {locked && (
          <div className={styles.lockedMessage}>
            Locked for <span className={styles.timer}>{lockTimer}</span> seconds
          </div>
        )}

        <button
          className={styles.clearButton}
          onClick={clearPin}
          disabled={locked || pin.every((digit) => digit === "")}
        >
          <X size={16} />
          <span>Clear</span>
        </button>

        <div></div>
      </div>
    </div>
  )
}
