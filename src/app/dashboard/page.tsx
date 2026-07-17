"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Clock } from "lucide-react"

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
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-luxor-primary tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm font-medium text-white/80 uppercase tracking-wider">{label}</span>
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
    <div className="relative min-h-[calc(100vh-4rem)] -m-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Slideshow de fondos */}
      <div className="absolute inset-0">
        <img src="/fondo (1).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow1_12s_infinite]" />
        <img src="/fondo (2).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow2_12s_infinite]" />
        <img src="/fondo (3).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow3_12s_infinite]" />
      </div>
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-luxor-primary/70" />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 mb-5">
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Próximamente</h1>
        <p className="text-white/70 text-center max-w-md mb-10 text-sm sm:text-base">
          Nuevas funcionalidades llegarán el <strong className="text-yellow-400">lunes 20 de julio</strong>
        </p>

        <div className="flex items-center gap-3 sm:gap-5">
          <Unit value={time.dias} label="Días" />
          <span className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-[-20px]">:</span>
          <Unit value={time.horas} label="Horas" />
          <span className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-[-20px]">:</span>
          <Unit value={time.minutos} label="Minutos" />
          <span className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-[-20px]">:</span>
          <Unit value={time.segundos} label="Segundos" />
        </div>
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
