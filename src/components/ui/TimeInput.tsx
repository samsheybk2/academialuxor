"use client"

import { useState, useEffect } from "react"

interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimeInput({ value, onChange, placeholder = "00:00", className = "" }: TimeInputProps) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    setDisplay(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, "")

    if (raw.length > 4) raw = raw.slice(0, 4)

    if (raw.length > 2) {
      raw = raw.slice(0, 2) + ":" + raw.slice(2)
    }

    setDisplay(raw)
    onChange(raw)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={5}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
}
