"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, BarChart2, Settings } from "lucide-react"
import styles from "./pixel-nav.module.css"

export default function PixelNav() {
  const [activeTab, setActiveTab] = useState("track")

  return (
    <div className={styles.navContainer}>
      <div className={styles.navBorder}>
        <nav className={styles.nav}>
          <div
            className={`${styles.navItem} ${activeTab === "track" ? styles.active : ""}`}
            onClick={() => setActiveTab("track")}
          >
            <div className={styles.pixelIcon}>T</div>
            <span>TRACK</span>
          </div>

          <div
            className={`${styles.navItem} ${activeTab === "history" ? styles.active : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Calendar size={16} />
            <span>HISTORY</span>
          </div>

          <div
            className={`${styles.navItem} ${activeTab === "stats" ? styles.active : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <BarChart2 size={16} />
            <span>STATS</span>
          </div>

          <div
            className={`${styles.navItem} ${activeTab === "settings" ? styles.active : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} />
            <span>SETTINGS</span>
          </div>

          <motion.div
            className={styles.activeIndicator}
            initial={false}
            animate={{
              left: `calc(${["0%", "25%", "50%", "75%"][["track", "history", "stats", "settings"].indexOf(activeTab)]} + 2px)`,
              width: `calc(25% - 4px)`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </nav>
      </div>

      <div className={styles.pixelCorner1}></div>
      <div className={styles.pixelCorner2}></div>
      <div className={styles.pixelCorner3}></div>
      <div className={styles.pixelCorner4}></div>
    </div>
  )
}
