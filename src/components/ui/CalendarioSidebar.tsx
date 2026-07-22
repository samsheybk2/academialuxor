"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Calendar, X, Clock, ChevronLeft, ChevronRight, List } from "lucide-react"

interface Evento {
  id: string
  titulo: string
  fecha: string
  hora_inicio: string
  categoria: string
}

const CAT_COLORS: Record<string, string> = {
  reunion: "bg-blue-500",
  capacitacion: "bg-emerald-500",
  tarea: "bg-amber-500",
  evento: "bg-purple-500",
  otro: "bg-gray-500",
}

const CAT_LABELS: Record<string, string> = {
  reunion: "Reunión",
  capacitacion: "Capacitación",
  tarea: "Tarea",
  evento: "Evento",
  otro: "Otro",
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

export function CalendarioSidebar() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [mes, setMes] = useState(new Date().getMonth())
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)

  const fetchEventos = useCallback(async () => {
    if (!user) return
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from("agenda_eventos")
      .select("id, titulo, fecha, hora_inicio, categoria")
      .eq("usuario_id", user.id)
      .order("fecha", { ascending: true })
    setEventos(data || [])
  }, [user])

  useEffect(() => { fetchEventos() }, [fetchEventos])

  const primerDiaMes = new Date(anio, mes, 1).getDay()
  const offsetLunes = primerDiaMes === 0 ? 6 : primerDiaMes - 1
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const diasCeldas = offsetLunes + diasEnMes

  const getFechaStr = (d: number) => {
    const dd = String(d).padStart(2, "0")
    const mm = String(mes + 1).padStart(2, "0")
    return `${anio}-${mm}-${dd}`
  }

  const eventosPorDia = (fecha: string) => eventos.filter((e) => e.fecha === fecha)

  const today = new Date()
  const hoyStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const prevMes = () => { if (mes === 0) { setMes(11); setAnio(anio - 1) } else setMes(mes - 1) }
  const nextMes = () => { if (mes === 11) { setMes(0); setAnio(anio + 1) } else setMes(mes + 1) }

  const proximosEventos = eventos.filter(e => e.fecha >= hoyStr)

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 text-gray-900 w-full justify-center">
          <Calendar className="w-5 h-5 text-luxor-primary" />
          <span className="font-bold text-sm">Calendario de Eventos</span>
        </div>

        <div className="flex items-center justify-between mb-3 px-1">
          <button onClick={prevMes} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-700">{MESES[mes]} {anio}</span>
          <button onClick={nextMes} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {DIAS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1 uppercase">{d}</div>
          ))}
          {Array.from({ length: diasCeldas }).map((_, i) => {
            const dia = i - offsetLunes + 1
            if (dia < 1 || dia > diasEnMes) return <div key={i} />
            const fecha = getFechaStr(dia)
            const evts = eventosPorDia(fecha)
            const isToday = fecha === hoyStr

            return (
              <div
                key={i}
                className={`relative flex items-center justify-center py-2 rounded-lg text-[11px] transition-colors ${
                  isToday ? "bg-luxor-primary text-white font-bold shadow-sm" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {dia}
                {evts.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {evts.slice(0, 2).map((e) => (
                      <div key={e.id} className={`w-1 h-1 rounded-full ${CAT_COLORS[e.categoria] || "bg-gray-400"}`} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-luxor-primary/10 text-luxor-primary text-xs font-medium hover:bg-luxor-primary/20 transition-colors"
        >
          <List className="w-3.5 h-3.5" />
          Ver eventos ({proximosEventos.length})
        </button>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Mis Eventos</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {proximosEventos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay eventos programados</p>
              ) : (
                proximosEventos.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${CAT_COLORS[ev.categoria] || "bg-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{ev.titulo}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{new Date(ev.fecha + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</span>
                        {ev.hora_inicio && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{ev.hora_inicio.slice(0, 5)}</span>
                          </>
                        )}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CAT_COLORS[ev.categoria] || "bg-gray-400"} text-white`}>
                        {CAT_LABELS[ev.categoria] || ev.categoria}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
