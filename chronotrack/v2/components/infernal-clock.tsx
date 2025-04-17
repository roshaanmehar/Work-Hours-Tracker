"use client"

import { useEffect, useRef } from "react"

export default function InfernalClock() {
  const hourHandRef = useRef<HTMLDivElement>(null)
  const minuteHandRef = useRef<HTMLDivElement>(null)
  const secondHandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = now.getHours() % 12
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      const hourDegrees = hours * 30 + minutes * 0.5
      const minuteDegrees = minutes * 6
      const secondDegrees = seconds * 6

      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourDegrees}deg)`
      }

      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minuteDegrees}deg)`
      }

      if (secondHandRef.current) {
        secondHandRef.current.style.transform = `rotate(${secondDegrees}deg)`
      }
    }

    updateClock() // Initial update

    const clockInterval = setInterval(updateClock, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  return (
    <div className="baroque-clock">
      <div className="clock-face">
        <div className="clock-numbers">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`clock-number`} style={{ transform: `rotate(${i * 30}deg)` }}>
              <span style={{ transform: `rotate(${-i * 30}deg)` }}>{i === 0 ? 12 : i}</span>
            </div>
          ))}
        </div>
        <div ref={hourHandRef} className="clock-hand clock-hand-hour"></div>
        <div ref={minuteHandRef} className="clock-hand clock-hand-minute"></div>
        <div ref={secondHandRef} className="clock-hand clock-hand-second"></div>
        <div className="clock-center"></div>
      </div>
    </div>
  )
}
