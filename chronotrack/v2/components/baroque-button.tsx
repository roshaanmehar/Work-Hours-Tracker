import type React from "react"

interface BaroqueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
  children: React.ReactNode
  className?: string
}

export default function BaroqueButton({
  variant = "primary",
  size = "medium",
  children,
  className = "",
  ...props
}: BaroqueButtonProps) {
  const baseClasses = "button relative overflow-hidden"

  const variantClasses = {
    primary: "button-primary",
    secondary: "button-secondary",
  }

  const sizeClasses = {
    small: "button-small",
    medium: "",
    large: "button-large",
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
      <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
    </button>
  )
}
