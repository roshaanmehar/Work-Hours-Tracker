"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTimeStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { clearAllData, loadData } = useTimeStore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [hourlyRate, setHourlyRate] = useState("12.50")
  const [darkMode, setDarkMode] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    loadData()
    setMounted(true)

    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Get hourly rate from local storage
    const storedRate = localStorage.getItem("hourlyRate")
    if (storedRate) {
      setHourlyRate(storedRate)
    }
  }, [loadData])

  if (!mounted) {
    return null
  }

  const handleSaveSettings = () => {
    // Save hourly rate to local storage
    localStorage.setItem("hourlyRate", hourlyRate)

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleClearData = () => {
    clearAllData()
    setShowConfirmation(false)

    toast({
      title: "Data cleared",
      description: "All your time tracking data has been deleted.",
      variant: "destructive",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="container flex h-16 items-center">
          <Link
            href="/dashboard"
            className="mr-4 flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Manage your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                  <p className="mt-1 text-sm text-slate-500">This rate will be used to calculate your earnings</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-slate-500">Toggle between light and dark theme</p>
                  </div>
                  <Switch id="darkMode" checked={darkMode} onCheckedChange={handleToggleDarkMode} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your time tracking data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  Clear all your time tracking data. This action cannot be undone.
                </p>
                {showConfirmation ? (
                  <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                      Are you sure you want to delete all your data?
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={handleClearData}>
                        Yes, delete everything
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowConfirmation(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="destructive" onClick={() => setShowConfirmation(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Data
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
