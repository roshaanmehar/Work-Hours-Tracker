"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Filter,
  Database,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  User,
  Clock,
  Settings,
  Save,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Trash2,
  Key,
} from "lucide-react"
import Navbar from "@/components/navbar"
import AdminLogin from "@/components/admin-login"
import { useAuth } from "@/context/auth-context"
import styles from "./page.module.css"

// Mock data for master database records
const masterRecords = [
  {
    id: 1,
    date: "2025-04-19",
    clockIn: "09:15:00",
    clockOut: "12:30:00",
    duration: "03:15:00",
    status: "active",
    user: "John Doe",
    breaks: [{ start: "10:30:00", end: "10:45:00", duration: "00:15:00" }],
  },
  {
    id: 2,
    date: "2025-04-19",
    clockIn: "13:30:00",
    clockOut: "17:45:00",
    duration: "04:15:00",
    status: "active",
    user: "John Doe",
    breaks: [{ start: "15:00:00", end: "15:20:00", duration: "00:20:00" }],
  },
  {
    id: 3,
    date: "2025-04-18",
    clockIn: "08:45:00",
    clockOut: "16:30:00",
    duration: "07:45:00",
    status: "modified",
    user: "John Doe",
    originalData: {
      clockIn: "09:00:00",
      clockOut: "16:00:00",
      duration: "07:00:00",
    },
    modifiedAt: "2025-04-18 17:30:00",
    modifiedBy: "John Doe",
    reason: "Forgot to clock in on time",
    breaks: [
      { start: "12:00:00", end: "12:45:00", duration: "00:45:00" },
      { start: "14:30:00", end: "14:45:00", duration: "00:15:00" },
    ],
  },
  {
    id: 4,
    date: "2025-04-17",
    clockIn: "09:00:00",
    clockOut: "17:00:00",
    duration: "08:00:00",
    status: "deleted",
    user: "John Doe",
    deletedAt: "2025-04-17 18:30:00",
    deletedBy: "John Doe",
    reason: "Accidental entry",
    breaks: [],
  },
  {
    id: 5,
    date: "2025-04-16",
    clockIn: "08:30:00",
    clockOut: "16:45:00",
    duration: "08:15:00",
    status: "active",
    user: "Jane Smith",
    breaks: [{ start: "12:15:00", end: "13:00:00", duration: "00:45:00" }],
  },
]

// Available jobs
const availableJobs = [
  { id: 1, name: "Web Development", rate: 50 },
  { id: 2, name: "Design Work", rate: 45 },
  { id: 3, name: "Client Meeting", rate: 60 },
]

// Default job rules
const defaultJobRules = [
  { id: 1, days: "Monday-Friday", timeRange: "9:00-12:00", job: "Web Development" },
  { id: 2, days: "Monday-Friday", timeRange: "12:00-14:00", job: "Client Meeting" },
  { id: 3, days: "Monday-Friday", timeRange: "14:00-17:00", job: "Design Work" },
  { id: 4, days: "Saturday", timeRange: "10:00-16:00", job: "Web Development" },
]

// Audit log entries
const auditLogEntries = [
  {
    id: 1,
    timestamp: "2025-04-20 09:15:22",
    action: "Clock In",
    details: "Job: Web Development",
    user: "John Doe",
  },
  {
    id: 2,
    timestamp: "2025-04-20 12:30:45",
    action: "Clock Out",
    details: "Duration: 03:15:23",
    user: "John Doe",
  },
  {
    id: 3,
    timestamp: "2025-04-19 16:42:10",
    action: "Modified Entry",
    details: "Changed clock-in time from 09:00 to 08:45",
    user: "Admin",
  },
  {
    id: 4,
    timestamp: "2025-04-19 14:30:00",
    action: "Added Job",
    details: "Added new job: Client Consultation",
    user: "Admin",
  },
  {
    id: 5,
    timestamp: "2025-04-18 11:20:15",
    action: "Changed Settings",
    details: "Updated time zone to GMT+1",
    user: "Admin",
  },
]

export default function AdminPage() {
  const { authenticated } = useAuth()
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleted, setShowDeleted] = useState(true)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [activeTab, setActiveTab] = useState("records")

  // Settings state
  const [timeZone, setTimeZone] = useState("America/New_York")
  const [timeFormat, setTimeFormat] = useState("12h")
  const [userName, setUserName] = useState("John Doe")
  const [userEmail, setUserEmail] = useState("john.doe@example.com")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState("Last synced: 10 minutes ago")

  // Job management state
  const [jobs, setJobs] = useState(availableJobs)
  const [editingJob, setEditingJob] = useState<number | null>(null)
  const [newJob, setNewJob] = useState({ name: "", rate: 0 })
  const [showAddJob, setShowAddJob] = useState(false)

  // Job rules state
  const [jobRules, setJobRules] = useState(defaultJobRules)
  const [editingRule, setEditingRule] = useState<number | null>(null)
  const [newRule, setNewRule] = useState({ days: "Monday-Friday", timeRange: "9:00-17:00", job: "Web Development" })
  const [showAddRule, setShowAddRule] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated as admin
    // This would typically check a token or session
    // For demo purposes, we'll just set it to false initially
    setAdminAuthenticated(false)
  }, [])

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id)
  }

  const handleAdminLogin = () => {
    setAdminAuthenticated(true)
    setShowAdminLogin(false)
  }

  const handleSync = () => {
    setIsSyncing(true)
    setSyncStatus("Syncing...")

    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false)
      setSyncStatus("Last synced: Just now")
    }, 2000)
  }

  const handleAddJob = () => {
    if (!newJob.name || newJob.rate <= 0) return

    const newId = Math.max(0, ...jobs.map((job) => job.id)) + 1
    setJobs([...jobs, { id: newId, name: newJob.name, rate: newJob.rate }])
    setNewJob({ name: "", rate: 0 })
    setShowAddJob(false)

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleEditJob = (id: number) => {
    const job = jobs.find((j) => j.id === id)
    if (!job) return

    setNewJob({ name: job.name, rate: job.rate })
    setEditingJob(id)
    setShowAddJob(true)
  }

  const handleUpdateJob = () => {
    if (!editingJob || !newJob.name || newJob.rate <= 0) return

    setJobs(jobs.map((job) => (job.id === editingJob ? { ...job, name: newJob.name, rate: newJob.rate } : job)))
    setNewJob({ name: "", rate: 0 })
    setEditingJob(null)
    setShowAddJob(false)

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleDeleteJob = (id: number) => {
    setJobs(jobs.filter((job) => job.id !== id))

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleAddRule = () => {
    if (!newRule.days || !newRule.timeRange || !newRule.job) return

    const newId = Math.max(0, ...jobRules.map((rule) => rule.id)) + 1
    setJobRules([...jobRules, { id: newId, ...newRule }])
    setNewRule({ days: "Monday-Friday", timeRange: "9:00-17:00", job: "Web Development" })
    setShowAddRule(false)

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleEditRule = (id: number) => {
    const rule = jobRules.find((r) => r.id === id)
    if (!rule) return

    setNewRule({ days: rule.days, timeRange: rule.timeRange, job: rule.job })
    setEditingRule(id)
    setShowAddRule(true)
  }

  const handleUpdateRule = () => {
    if (!editingRule || !newRule.days || !newRule.timeRange || !newRule.job) return

    setJobRules(jobRules.map((rule) => (rule.id === editingRule ? { ...rule, ...newRule } : rule)))
    setNewRule({ days: "Monday-Friday", timeRange: "9:00-17:00", job: "Web Development" })
    setEditingRule(null)
    setShowAddRule(false)

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleDeleteRule = (id: number) => {
    setJobRules(jobRules.filter((rule) => rule.id !== id))

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  const handleSaveSettings = () => {
    // In a real app, this would save settings to the backend
    // For now, just show a success message
    alert("Settings saved successfully!")

    // Add to audit log
    // In a real app, this would be handled by the backend
  }

  // Filter and search records
  const filteredRecords = masterRecords.filter((record) => {
    if (!showDeleted && record.status === "deleted") return false
    if (filter !== "all" && record.status !== filter) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.user.toLowerCase().includes(searchLower) ||
        record.date.includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  if (!authenticated) {
    return null // This will be handled by the layout component
  }

  if (!adminAuthenticated) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Admin Dashboard</h1>
        </header>

        <div className={styles.adminLoginRequired}>
          <AlertTriangle size={48} />
          <h2>Admin Authentication Required</h2>
          <p>You need to authenticate as an administrator to access this page.</p>
          <motion.button
            className={styles.adminButton}
            onClick={() => setShowAdminLogin(true)}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
            Authenticate as Admin
          </motion.button>
        </div>

        {showAdminLogin && <AdminLogin onSuccess={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />}

        <Navbar activePage="admin" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "records" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <Database size={16} />
            Records
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "settings" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "jobs" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <Clock size={16} />
            Jobs
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "audit" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            <AlertTriangle size={16} />
            Audit Log
          </button>
        </div>
      </header>

      {activeTab === "records" && (
        <>
          <div className={styles.headerActions}>
            <button className={styles.toggleButton} onClick={() => setShowDeleted(!showDeleted)}>
              {showDeleted ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>{showDeleted ? "Hide" : "Show"} Deleted</span>
            </button>
            <button className={styles.filterButton} onClick={() => setShowFilterMenu(!showFilterMenu)}>
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by user, date, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                className={styles.filterMenu}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.filterTabs}>
                  <button
                    className={`${styles.filterTab} ${filter === "all" ? styles.active : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`${styles.filterTab} ${filter === "active" ? styles.active : ""}`}
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`${styles.filterTab} ${filter === "modified" ? styles.active : ""}`}
                    onClick={() => setFilter("modified")}
                  >
                    Modified
                  </button>
                  <button
                    className={`${styles.filterTab} ${filter === "deleted" ? styles.active : ""}`}
                    onClick={() => setFilter("deleted")}
                  >
                    Deleted
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.databaseInfo}>
            <Database size={20} />
            <h2>Master Database Records</h2>
            <div className={styles.warningBadge}>
              <AlertTriangle size={14} />
              <span>Admin Only</span>
            </div>
          </div>

          <div className={styles.entriesList}>
            {filteredRecords.length === 0 ? (
              <div className={styles.emptyState}>
                <Database size={48} />
                <p>No records found</p>
              </div>
            ) : (
              filteredRecords.map((entry) => (
                <motion.div
                  key={entry.id}
                  className={`${styles.entryCard} ${styles[entry.status]}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.entryHeader} onClick={() => toggleExpand(entry.id)}>
                    <div className={styles.entryDate}>
                      <h3>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>
                      <span className={styles.statusBadge}>{entry.status}</span>
                    </div>
                    <div className={styles.entryTime}>
                      <p>{entry.user}</p>
                      <motion.div
                        animate={{ rotate: expandedEntry === entry.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedEntry === entry.id && (
                      <motion.div
                        className={styles.entryDetails}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={styles.detailRow}>
                          <span>Clock In:</span>
                          <span>{entry.clockIn}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Clock Out:</span>
                          <span>{entry.clockOut}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Duration:</span>
                          <span>{entry.duration}</span>
                        </div>

                        {entry.status === "modified" && (
                          <div className={styles.modificationInfo}>
                            <h4>Modification Details</h4>
                            <div className={styles.detailRow}>
                              <span>Original Clock In:</span>
                              <span>{entry.originalData.clockIn}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Original Clock Out:</span>
                              <span>{entry.originalData.clockOut}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Modified At:</span>
                              <span>{entry.modifiedAt}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Modified By:</span>
                              <span>{entry.modifiedBy}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Reason:</span>
                              <span>{entry.reason}</span>
                            </div>
                          </div>
                        )}

                        {entry.status === "deleted" && (
                          <div className={styles.deletionInfo}>
                            <h4>Deletion Details</h4>
                            <div className={styles.detailRow}>
                              <span>Deleted At:</span>
                              <span>{entry.deletedAt}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Deleted By:</span>
                              <span>{entry.deletedBy}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span>Reason:</span>
                              <span>{entry.reason}</span>
                            </div>
                          </div>
                        )}

                        {entry.breaks.length > 0 && (
                          <div className={styles.breaksList}>
                            <h4>Breaks ({entry.breaks.length})</h4>
                            {entry.breaks.map((breakItem, index) => (
                              <div key={index} className={styles.breakItem}>
                                <span>
                                  {breakItem.start} - {breakItem.end}
                                </span>
                                <span>{breakItem.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className={styles.settingsContainer}>
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <User size={18} />
              <h2>User Settings</h2>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className={styles.input}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.settingsSection}>
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
                <option value="Europe/London">London (GMT)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="format">Time Format</label>
              <select
                id="format"
                className={styles.select}
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <Key size={18} />
              <h2>Security</h2>
            </div>

            <div className={styles.buttonGroup}>
              <motion.button className={styles.button} whileTap={{ scale: 0.95 }}>
                Change User PIN
              </motion.button>
              <motion.button className={styles.button} whileTap={{ scale: 0.95 }}>
                Change Admin Password
              </motion.button>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <RefreshCw size={18} />
              <h2>Sync Settings</h2>
            </div>

            <p className={styles.syncStatus}>{syncStatus}</p>

            <div className={styles.buttonGroup}>
              <motion.button
                className={styles.button}
                onClick={handleSync}
                whileTap={{ scale: 0.95 }}
                disabled={isSyncing}
              >
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
            <motion.button
              className={`${styles.button} ${styles.saveButton}`}
              onClick={handleSaveSettings}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={16} />
              Save Settings
            </motion.button>
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className={styles.jobsContainer}>
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2>Job Management</h2>
              <motion.button
                className={styles.addButton}
                onClick={() => {
                  setShowAddJob(true)
                  setEditingJob(null)
                  setNewJob({ name: "", rate: 0 })
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Add New Job
              </motion.button>
            </div>

            <div className={styles.jobList}>
              {jobs.map((job) => (
                <div key={job.id} className={styles.jobItem}>
                  <div className={styles.jobDetails}>
                    <span className={styles.jobName}>{job.name}</span>
                    <span className={styles.jobRate}>£{job.rate.toFixed(2)}/hr</span>
                  </div>
                  <div className={styles.jobActions}>
                    <button className={styles.smallButton} onClick={() => handleEditJob(job.id)}>
                      <Edit size={14} />
                    </button>
                    <button className={styles.smallButton} onClick={() => handleDeleteJob(job.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddJob && (
              <div className={styles.jobForm}>
                <h3>{editingJob ? "Edit Job" : "Add New Job"}</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="jobName">Job Name</label>
                  <input
                    type="text"
                    id="jobName"
                    className={styles.input}
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    placeholder="Enter job name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="jobRate">Hourly Rate (£)</label>
                  <input
                    type="number"
                    id="jobRate"
                    className={styles.input}
                    value={newJob.rate || ""}
                    onChange={(e) => setNewJob({ ...newJob, rate: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cancelButton} onClick={() => setShowAddJob(false)}>
                    Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={editingJob ? handleUpdateJob : handleAddJob}
                    disabled={!newJob.name || newJob.rate <= 0}
                  >
                    {editingJob ? "Update" : "Add"} Job
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2>Default Job Rules</h2>
              <motion.button
                className={styles.addButton}
                onClick={() => {
                  setShowAddRule(true)
                  setEditingRule(null)
                  setNewRule({ days: "Monday-Friday", timeRange: "9:00-17:00", job: "Web Development" })
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Add New Rule
              </motion.button>
            </div>

            <div className={styles.rulesList}>
              {jobRules.map((rule) => (
                <div key={rule.id} className={styles.ruleItem}>
                  <div className={styles.ruleDetails}>
                    <span className={styles.ruleDays}>
                      {rule.days}, {rule.timeRange}
                    </span>
                    <span className={styles.ruleJob}>{rule.job}</span>
                  </div>
                  <div className={styles.ruleActions}>
                    <button className={styles.smallButton} onClick={() => handleEditRule(rule.id)}>
                      <Edit size={14} />
                    </button>
                    <button className={styles.smallButton} onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddRule && (
              <div className={styles.ruleForm}>
                <h3>{editingRule ? "Edit Rule" : "Add New Rule"}</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="ruleDays">Days</label>
                  <select
                    id="ruleDays"
                    className={styles.select}
                    value={newRule.days}
                    onChange={(e) => setNewRule({ ...newRule, days: e.target.value })}
                  >
                    <option value="Monday-Friday">Monday-Friday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ruleTimeRange">Time Range</label>
                  <input
                    type="text"
                    id="ruleTimeRange"
                    className={styles.input}
                    value={newRule.timeRange}
                    onChange={(e) => setNewRule({ ...newRule, timeRange: e.target.value })}
                    placeholder="9:00-17:00"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ruleJob">Default Job</label>
                  <select
                    id="ruleJob"
                    className={styles.select}
                    value={newRule.job}
                    onChange={(e) => setNewRule({ ...newRule, job: e.target.value })}
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.name}>
                        {job.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cancelButton} onClick={() => setShowAddRule(false)}>
                    Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={editingRule ? handleUpdateRule : handleAddRule}
                    disabled={!newRule.days || !newRule.timeRange || !newRule.job}
                  >
                    {editingRule ? "Update" : "Add"} Rule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className={styles.auditContainer}>
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2>Audit Log</h2>
            </div>

            <div className={styles.auditLog}>
              {auditLogEntries.map((entry) => (
                <div key={entry.id} className={styles.logEntry}>
                  <div className={styles.logHeader}>
                    <span className={styles.logTime}>{entry.timestamp}</span>
                    <span className={styles.logUser}>{entry.user}</span>
                  </div>
                  <div className={styles.logContent}>
                    <span className={styles.logAction}>{entry.action}</span>
                    <span className={styles.logDetails}>{entry.details}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.auditActions}>
              <button className={styles.button}>
                <Download size={16} />
                Export Audit Log
              </button>
              <button className={styles.button}>
                <Filter size={16} />
                Filter Log
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar activePage="admin" />
    </div>
  )
}
