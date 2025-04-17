"use client"

import { useEffect, useState } from "react"

// Interface for Google Sheets API credentials
interface GoogleSheetsCredentials {
  apiKey: string
  clientId: string
  spreadsheetId: string
}

// Load Google Sheets API
const loadGoogleSheetsAPI = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.load("client:auth2", () => {
        resolve()
      })
    } else {
      // Load the Google API client library script
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => {
        window.gapi.load("client:auth2", () => {
          resolve()
        })
      }
      script.onerror = () => {
        reject(new Error("Failed to load Google API client."))
      }
      document.body.appendChild(script)
    }
  })
}

// Initialize Google Sheets API
export const initGoogleSheetsAPI = async (credentials: GoogleSheetsCredentials) => {
  await loadGoogleSheetsAPI()

  await window.gapi.client.init({
    apiKey: credentials.apiKey,
    clientId: credentials.clientId,
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    scope: "https://www.googleapis.com/auth/spreadsheets",
  })

  return window.gapi.auth2.getAuthInstance()
}

// Sign in to Google
export const signInToGoogle = async () => {
  const auth = window.gapi.auth2.getAuthInstance()
  return auth.signIn()
}

// Check if user is signed in
export const isSignedIn = () => {
  const auth = window.gapi.auth2.getAuthInstance()
  return auth.isSignedIn.get()
}

// Export time entries to Google Sheets
export const exportToGoogleSheets = async (spreadsheetId: string, range: string, data: any[][]) => {
  if (!isSignedIn()) {
    await signInToGoogle()
  }

  const response = await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: data,
    },
  })

  return response
}

// Hook for using Google Sheets API
export const useGoogleSheets = (credentials: GoogleSheetsCredentials) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!credentials.apiKey || !credentials.clientId || !credentials.spreadsheetId) {
          return
        }

        const auth = await initGoogleSheetsAPI(credentials)
        setIsInitialized(true)

        // Update authentication state when it changes
        auth.isSignedIn.listen((signedIn) => {
          setIsAuthenticated(signedIn)
        })

        // Set initial authentication state
        setIsAuthenticated(auth.isSignedIn.get())
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    initialize()
  }, [credentials])

  const signIn = async () => {
    try {
      await signInToGoogle()
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  const exportData = async (range: string, data: any[][]) => {
    try {
      if (!isInitialized) {
        throw new Error("Google Sheets API not initialized")
      }

      if (!isAuthenticated) {
        await signIn()
      }

      return await exportToGoogleSheets(credentials.spreadsheetId, range, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  return {
    isInitialized,
    isAuthenticated,
    error,
    signIn,
    exportData,
  }
}
