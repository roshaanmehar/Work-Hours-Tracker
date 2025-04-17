"use client"

import { useEffect, useState } from "react"

export default function InfernalClock() {
  const [time, setTime] = useState(new Date())
  const [showPentagram, setShowPentagram] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const hourDegrees = (hours % 12) * 30 + minutes * 0.5
  const minuteDegrees = minutes * 6
  const secondDegrees = seconds * 6

  return (
    <div
      className="infernal-clock"
      onMouseEnter={() => setShowPentagram(true)}
      onMouseLeave={() => setShowPentagram(false)}
    >
      <div className="clock-face">
        {showPentagram && (
          <div
            style={{
              position: "absolute",
              fontSize: "3rem",
              color: "rgba(139, 0, 0, 0.1)",
              animation: "fadeIn 0.5s forwards",
            }}
          >
            ⛧
          </div>
        )}
        <div className="clock-numbers">
          <div className="clock-number clock-number-1">
            <span>I</span>
          </div>
          <div className="clock-number clock-number-2">
            <span>II</span>
          </div>
          <div className="clock-number clock-number-3">
            <span>III</span>
          </div>
          <div className="clock-number clock-number-4">
            <span>IV</span>
          </div>
          <div className="clock-number clock-number-5">
            <span>V</span>
          </div>
          <div className="clock-number clock-number-6">
            <span>VI</span>
          </div>
          <div className="clock-number clock-number-7">
            <span>VII</span>
          </div>
          <div className="clock-number clock-number-8">
            <span>VIII</span>
          </div>
          <div className="clock-number clock-number-9">
            <span>IX</span>
          </div>
          <div className="clock-number clock-number-10">
            <span>X</span>
          </div>
          <div className="clock-number clock-number-11">
            <span>XI</span>
          </div>
          <div className="clock-number clock-number-12">
            <span>XII</span>
          </div>
        </div>
        <div className="clock-hand clock-hand-hour" style={{ transform: `rotate(${hourDegrees}deg)` }}></div>
        <div className="clock-hand clock-hand-minute" style={{ transform: `rotate(${minuteDegrees}deg)` }}></div>
        <div className="clock-hand clock-hand-second" style={{ transform: `rotate(${secondDegrees}deg)` }}></div>
        <div className="clock-center"></div>
      </div>
    </div>
  )
}
