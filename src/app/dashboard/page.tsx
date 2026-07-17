"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Timer, Clock } from "lucide-react"

const TARGET = new Date("2026-07-20T00:00:00-04:00").getTime()

function getTimeLeft() {
  const now = Date.now()
  const diff = Math.max(0, TARGET - now)
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-luxor-primary tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function DashboardContent() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="w-16 h-16 rounded-2xl bg-luxor-primary/10 flex items-center justify-center mb-5">
        <Clock className="w-8 h-8 text-luxor-primary" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Próximamente</h1>
      <p className="text-gray-500 text-center max-w-md mb-10 text-sm sm:text-base">
        Nuevas funcionalidades llegarán el <strong>lunes 20 de julio</strong>
      </p>

      <div className="flex items-center gap-3 sm:gap-5">
        <Unit value={time.dias} label="Días" />
        <span className="text-2xl sm:text-3xl font-bold text-luxor-accent mt-[-20px]">:</span>
        <Unit value={time.horas} label="Horas" />
        <span className="text-2xl sm:text-3xl font-bold text-luxor-accent mt-[-20px]">:</span>
        <Unit value={time.minutos} label="Minutos" />
        <span className="text-2xl sm:text-3xl font-bold text-luxor-accent mt-[-20px]">:</span>
        <Unit value={time.segundos} label="Segundos" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "facilitador"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
