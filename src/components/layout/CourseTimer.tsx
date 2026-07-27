"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Clock, AlertCircle } from "lucide-react"
import { createPortal } from "react-dom"
import Link from "next/link"

interface InscripcionData {
  id: string
  fecha_inscripcion: string
  curso_titulo: string
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

export function CourseTimer() {
  const { user } = useAuth()
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [fechaLimite, setFechaLimite] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!user || (user.rol !== "estudiante" && user.rol !== "developer") || fetchedRef.current) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      fetchedRef.current = true
      const supabase = createSupabaseClient()

      try {
        // Obtener inscripciones activas
        const { data: inscripciones, error: inspError } = await supabase
          .from("inscripciones")
          .select("id, fecha_inscripcion, cursos(titulo)")
          .eq("user_id", user.id)
          .eq("estado", "activa")
          .order("fecha_inscripcion", { ascending: true })
          .limit(1)

        if (inspError || !inscripciones || inscripciones.length === 0) {
          setLoading(false)
          return
        }

        const inscripcion = inscripciones[0] as InscripcionData & { cursos?: { titulo: string } }

        // Obtener días continuos del cargo del usuario
        let diasContinuos = 60
        if (user.cargo) {
          const { data: cargoData, error: cargoError } = await supabase
            .from("cargos")
            .select("dias_continuos")
            .eq("nombre", user.cargo)
            .single()

          if (!cargoError && cargoData?.dias_continuos) {
            diasContinuos = cargoData.dias_continuos
          }
        }

        // Calcular fecha límite exacta
        const fechaInscripcion = new Date(inscripcion.fecha_inscripcion)
        const fechaLim = new Date(fechaInscripcion.getTime() + diasContinuos * 24 * 60 * 60 * 1000)
        setFechaLimite(fechaLim)

        // Calcular días restantes
        const hoy = new Date()
        const diasTranscurridos = Math.floor((hoy.getTime() - fechaInscripcion.getTime()) / (1000 * 60 * 60 * 24))
        const restantes = Math.max(0, diasContinuos - diasTranscurridos)

        setDiasRestantes(restantes)
      } catch (err) {
        console.error("CourseTimer error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    if (!showModal || !fechaLimite) return

    const calcTimeLeft = () => {
      const diff = fechaLimite.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
        return
      }
      setTimeLeft({
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((diff / (1000 * 60)) % 60),
        segundos: Math.floor((diff / 1000) % 60),
      })
    }

    calcTimeLeft()
    intervalRef.current = setInterval(calcTimeLeft, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showModal, fechaLimite])

  if (loading || !user || (user.rol !== "estudiante" && user.rol !== "developer") || diasRestantes === null) {
    return null
  }

  const isUrgent = diasRestantes <= 7
  const isCritical = diasRestantes <= 3

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
          isCritical
            ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
            : isUrgent
            ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
            : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
        }`}
      >
        {isCritical ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {diasRestantes === 0 ? "Hoy vence" : `${diasRestantes} día${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`}
        </span>
        <span className="sm:hidden">
          {diasRestantes}d
        </span>
      </button>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`relative pt-8 pb-6 px-6 text-center ${
              isCritical
                ? "bg-gradient-to-br from-red-500 to-rose-600"
                : isUrgent
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}>
              <div className="absolute top-0 left-0 right-0 h-32 bg-white/10 rounded-b-full blur-2xl" />
              <div className="relative">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center ${
                  isCritical ? "animate-pulse" : ""
                }`}>
                  {isCritical ? (
                    <AlertCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Clock className="w-10 h-10 text-white" />
                  )}
                </div>
                <p className="text-white/80 text-sm font-medium mb-4">Tiempo restante</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: timeLeft.dias, label: "días" },
                    { value: timeLeft.horas, label: "horas" },
                    { value: timeLeft.minutos, label: "min" },
                    { value: timeLeft.segundos, label: "seg" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                      <p className="text-white text-2xl font-bold tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </p>
                      <p className="text-white/80 text-[10px] font-medium mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-5 text-center">
              {timeLeft.dias === 0 && timeLeft.horas === 0 && timeLeft.minutos === 0 && timeLeft.segundos === 0 ? (
                <p className="text-red-600 font-semibold text-sm mb-4">
                  ¡Tiempo agotado!
                </p>
              ) : (
                <>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Recuerda que debes cumplir con todos los cursos obligatorios en tu flujo de aprendizaje.
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    ¿No sabes cómo llegar? Da clic en el botón de abajo.
                  </p>
                  <Link
                    href="/dashboard/rutas-aprendizaje"
                    onClick={() => setShowModal(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-luxor-primary/10 text-luxor-primary rounded-lg text-sm font-medium hover:bg-luxor-primary/20 transition-colors mb-4"
                  >
                    Ver mi ruta
                  </Link>
                </>
              )}
              <button
                onClick={() => setShowModal(false)}
                className={`w-full py-2.5 rounded-xl text-white font-semibold transition-all hover:shadow-lg active:scale-95 ${
                  isCritical
                    ? "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-200"
                    : isUrgent
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-200"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-200"
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
