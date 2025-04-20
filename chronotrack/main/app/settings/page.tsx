"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, AlertTriangle } from "lucide-react"
import Navbar from "@/components/navbar"
import AdminLogin from "@/components/admin-login"
import { useAuth } from "@/context/auth-context"
import styles from "./page.module.css"

export default function SettingsPage() {
  const { authenticated } = useAuth()
  const [showAdminSection, setShowAdminSection] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)

  const handleAdminLogin = () => {
    setAdminAuthenticated(true)
    setShowAdminSection(false)
  }

  if (!authenticated) {
    return null // This will be handled by the layout component
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
      </header>

      {adminAuthenticated ? (
        <div className={styles.adminMessage}>
          <Shield size={20} />
          <p>You are authenticated as an administrator.</p>
          <p>Please go to the Admin panel to manage all settings.</p>
        </div>
      ) : (
        <div className={styles.section}>
          <div className={styles.restrictedMessage}>
            <AlertTriangle size={24} />
            <h2>Admin Access Required</h2>
            <p>All settings can only be accessed and modified through the Admin panel.</p>
            <p>Please authenticate as an administrator to manage settings.</p>

            <motion.button
              className={styles.adminButton}
              onClick={() => setShowAdminSection(true)}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={16} />
              Authenticate as Admin
            </motion.button>
          </div>
        </div>
      )}

      {showAdminSection && <AdminLogin onSuccess={handleAdminLogin} onCancel={() => setShowAdminSection(false)} />}

      <Navbar activePage="settings" />
    </div>
  )
}
