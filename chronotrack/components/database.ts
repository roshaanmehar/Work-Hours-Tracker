// Simple IndexedDB database implementation for reliable mobile storage

const DB_NAME = "TimeTrackerDB"
const DB_VERSION = 1
const TIMESHEET_STORE = "timesheet"
const SETTINGS_STORE = "settings"

interface TimeEntry {
  id: string
  startTime: Date
  endTime: Date | null
  description: string
  project?: string
}

interface Settings {
  id: string
  hourlyRate: number
  overtimeRate: number
  overtimeThreshold: number
  currency: string
}

let db: IDBDatabase | null = null

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error)
      reject(request.error)
    }

    request.onsuccess = (event) => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create timesheet store
      if (!db.objectStoreNames.contains(TIMESHEET_STORE)) {
        const timesheetStore = db.createObjectStore(TIMESHEET_STORE, { keyPath: "id" })
        timesheetStore.createIndex("startTime", "startTime", { unique: false })
        timesheetStore.createIndex("project", "project", { unique: false })
      }

      // Create settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE, { keyPath: "id" })
      }
    }
  })
}

// Add a time entry
export async function addTimeEntry(entry: TimeEntry): Promise<string> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TIMESHEET_STORE], "readwrite")
    const store = transaction.objectStore(TIMESHEET_STORE)

    const request = store.add(entry)

    request.onsuccess = () => {
      resolve(entry.id)
    }

    request.onerror = () => {
      console.error("Error adding time entry:", request.error)
      reject(request.error)
    }
  })
}

// Update a time entry
export async function updateTimeEntry(entry: TimeEntry): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TIMESHEET_STORE], "readwrite")
    const store = transaction.objectStore(TIMESHEET_STORE)

    const request = store.put(entry)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      console.error("Error updating time entry:", request.error)
      reject(request.error)
    }
  })
}

// Get all time entries
export async function getAllTimeEntries(): Promise<TimeEntry[]> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TIMESHEET_STORE], "readonly")
    const store = transaction.objectStore(TIMESHEET_STORE)

    const request = store.getAll()

    request.onsuccess = () => {
      // Convert date strings back to Date objects
      const entries = request.result.map((entry) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : null,
      }))

      resolve(entries)
    }

    request.onerror = () => {
      console.error("Error getting time entries:", request.error)
      reject(request.error)
    }
  })
}

// Save settings
export async function saveSettings(settings: Settings): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], "readwrite")
    const store = transaction.objectStore(SETTINGS_STORE)

    const request = store.put(settings)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      console.error("Error saving settings:", request.error)
      reject(request.error)
    }
  })
}

// Get settings
export async function getSettings(): Promise<Settings | null> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], "readonly")
    const store = transaction.objectStore(SETTINGS_STORE)

    const request = store.get("user-settings")

    request.onsuccess = () => {
      resolve(request.result || null)
    }

    request.onerror = () => {
      console.error("Error getting settings:", request.error)
      reject(request.error)
    }
  })
}

// Delete a time entry
export async function deleteTimeEntry(id: string): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TIMESHEET_STORE], "readwrite")
    const store = transaction.objectStore(TIMESHEET_STORE)

    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      console.error("Error deleting time entry:", request.error)
      reject(request.error)
    }
  })
}

// Get entries for a specific date range
export async function getEntriesInDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
  const allEntries = await getAllTimeEntries()
  return allEntries.filter((entry) => entry.startTime >= startDate && (entry.endTime ? entry.endTime <= endDate : true))
}
