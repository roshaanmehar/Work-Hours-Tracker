"use client"

import { create } from "zustand"

export interface Shift {
  id: string
  startTime: string
  endTime: string | null
  notes: string
}

interface TimeStore {
  shifts: Shift[]
  addShift: (shift: Shift) => void
  updateShift: (id: string, data: Partial<Shift>) => void
  deleteShift: (id: string) => void
  clearAllData: () => void
  loadData: () => void
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  shifts: [],

  addShift: (shift) => {
    set((state) => {
      const newShifts = [...state.shifts, shift]
      localStorage.setItem("timeTrackerShifts", JSON.stringify(newShifts))
      return { shifts: newShifts }
    })
  },

  updateShift: (id, data) => {
    set((state) => {
      const newShifts = state.shifts.map((shift) => (shift.id === id ? { ...shift, ...data } : shift))
      localStorage.setItem("timeTrackerShifts", JSON.stringify(newShifts))
      return { shifts: newShifts }
    })
  },

  deleteShift: (id) => {
    set((state) => {
      const newShifts = state.shifts.filter((shift) => shift.id !== id)
      localStorage.setItem("timeTrackerShifts", JSON.stringify(newShifts))
      return { shifts: newShifts }
    })
  },

  clearAllData: () => {
    localStorage.removeItem("timeTrackerShifts")
    set({ shifts: [] })
  },

  loadData: () => {
    if (typeof window !== "undefined") {
      const storedShifts = localStorage.getItem("timeTrackerShifts")
      if (storedShifts) {
        set({ shifts: JSON.parse(storedShifts) })
      }
    }
  },
}))
