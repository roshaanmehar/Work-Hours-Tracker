"use client"

import { useState } from "react"
import { useTimeStore } from "@/lib/store"
import LuciferHeader from "@/components/lucifer-header"
import LuciferFooter from "@/components/lucifer-footer"

export default function SettingsPage() {
  const { clearAllData, setHourlyRate, hourlyRate } = useTimeStore()
  const [rate, setRate] = useState(hourlyRate.toString())
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showDealMessage, setShowDealMessage] = useState(false)

  const handleSaveSettings = () => {
    const newRate = Number.parseFloat(rate)
    if (!isNaN(newRate) && newRate > 0) {
      setHourlyRate(newRate)
      setShowDealMessage(true)

      setTimeout(() => {
        setShowDealMessage(false)
      }, 3000)
    }
  }

  const handleClearData = () => {
    clearAllData()
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <LuciferHeader activePage="settings" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="card lucifer-border chiaroscuro p-8">
            <div className="hidden-message absolute top-4 right-4">Every deal has its price</div>
            <div className="hidden-message absolute bottom-4 left-4">Desire is the currency of the damned</div>

            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Settings</h2>
              <p className="text-lg opacity-70 italic">Manage your preferences... or make a deal</p>
            </div>

            <div className="mb-8">
              <label className="block text-[#d4af37] text-lg font-serif mb-2" htmlFor="hourlyRate">
                Hourly Rate (£)
              </label>
              <input
                id="hourlyRate"
                type="number"
                step="0.01"
                className="w-full p-3 border border-[#d4af37] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b0000] focus:border-[#d4af37]"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <p className="text-sm mt-2 opacity-70">This rate will be used to calculate your earnings</p>
            </div>

            <div className="infernal-divider"></div>

            <div className="mb-8">
              <h3 className="text-xl font-serif text-[#d4af37] mb-4">Data Management</h3>
              <p className="text-sm mb-4 opacity-70">
                Clear all your time tracking data. This action cannot be undone.
              </p>

              {showConfirmation ? (
                <div className="p-6 border border-[#8b0000] mb-6 relative overflow-hidden chiaroscuro">
                  <p className="mb-6 font-medium text-[#d4af37]">
                    Are you sure you want to delete all your data? This is a binding contract.
                  </p>
                  <div className="flex gap-4">
                    <button
                      className="hellfire-btn bg-gradient-to-r from-[#8b0000] to-[#a52a2a] text-white px-6 py-3 border border-[#d4af37] shadow-lg animate-hellfire"
                      onClick={handleClearData}
                    >
                      Yes, delete everything
                    </button>
                    <button
                      className="hellfire-btn bg-transparent border border-[#d4af37] px-6 py-3 text-foreground hover:bg-[rgba(212,175,55,0.1)]"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="hellfire-btn bg-gradient-to-r from-[#8b0000] to-[#a52a2a] text-white px-6 py-3 border border-[#d4af37] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setShowConfirmation(true)}
                >
                  Clear All Data
                </button>
              )}
            </div>

            {showDealMessage && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/70"></div>
                <div className="relative p-8 bg-black border border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.5)] text-center z-10">
                  <h3 className="text-[#d4af37] text-xl mb-4">Deal Struck</h3>
                  <p>Your preferences are saved... for now.</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                className="hellfire-btn bg-gradient-to-r from-[#8b0000] to-[#a52a2a] text-white px-8 py-3 text-lg font-bold border border-[#d4af37] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      <LuciferFooter />
    </div>
  )
}
