import type React from "react"
import BaroqueOrnament from "./baroque-ornament"

interface BaroqueCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function BaroqueCard({ title, description, children, footer, className = "" }: BaroqueCardProps) {
  return (
    <div className={`card baroque-border ${className}`}>
      <BaroqueOrnament type="corner-tl" />
      <BaroqueOrnament type="corner-tr" />
      <BaroqueOrnament type="corner-bl" />
      <BaroqueOrnament type="corner-br" />

      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {description && <p className="card-description">{description}</p>}
      </div>

      <div className="card-content">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
