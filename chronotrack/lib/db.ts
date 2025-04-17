import { openDB } from 'idb'
import type { TimeEntry } from "@/lib/types"

const DB_NAME = 'chronotrack-db'
const DB_VERSION = 1
const STORE_NAME = 'time-entries'

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store of objects
      const store = db.createObjectStore(STORE_NAME, {
        // The 'id' property of the object will be the key.
        keyPath: 'id',
      })
      // Create an index on the 'startTime' property
      store.createIndex('startTime', 'startTime')
    },
  })
  return db
}

async function saveTimeEntry(entry: TimeEntry) {
  const db = await initDB()
  await db.put(STORE_NAME, entry)
}

async function getAllTimeEntries(): Promise<TimeEntry[]> {
  try {
    const db = await initDB()
    return await db.getAllFromIndex(STORE_NAME, 'startTime')
  } catch (error) {
    console.error('Error getting time entries:', error)
    return []
  }
}

async function getActiveTimeEntry(): Promise<TimeEntry | undefined> {
  const entries = await getAllTimeEntries()
  return entries.find(entry => !entry.endTime)
}

async function deleteTimeEntry(id: string) {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}

async function exportBackup(): Promise<string> {
  const entries = await getAllTimeEntries()
  return JSON.stringify(entries, null, 2)
}

async function importFromBackup(content: string): Promise<void> {
  try {
    const entries = JSON.parse(content) as TimeEntry[]
    const db = await initDB()
    
    // Clear existing entries
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await tx.objectStore(STORE_NAME).clear()
    
    // Add new entries
    for (const entry of entries) {
      await tx.objectStore(STORE_NAME).add(entry)
    }
    
    await tx.done
  } catch (error) {
    console.error('Error importing backup:', error)
    throw new Error('Failed to import backup: ' + error)
  }
}

// Function to sync with Google Sheets
async function syncWithGoogleSheets(apiKey: string, spreadsheetId: string) {
  try {
    const entries = await getAllTimeEntries()
    
    // Format data for Google Sheets
    const formattedData = entries.map(entry => {
      const startTime = new Date(entry.startTime)
      const endTime = entry.endTime ? new Date(entry.endTime) : null
      const duration = entry.duration ? formatDuration(entry.duration) : 'In progress'
      
      return {
        id: entry.id,
        date: startTime.toLocaleDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime ? endTime.toLocaleTimeString() : 'In progress',
        duration,
        notes: entry.notes || ''
      }
    })
    
    // Call the server-side API route to update Google Sheets
    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        spreadsheetId,
        data: formattedData
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to sync with Google Sheets')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error)
    throw error
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  return `${hours}h ${minutes}m`
}

export { 
  initDB, 
  saveTimeEntry, 
  getAllTimeEntries, 
  getActiveTimeEntry,
  deleteTimeEntry, 
  exportBackup, 
  importFromBackup,
  syncWithGoogleSheets
}
