"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Calendar, X, Clock } from "lucide-react"

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

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const DIAS = ["L", "M", "X", "J", "V", "S", "D"]

export function FloatingCalendar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [mes, setMes] = useState(new Date().getMonth())
  const [anio, setAnio] = useState(new Date().getFullYear())

  const isAgenda = pathname === "/dashboard/agenda"

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

  const eventosHoy = eventosPorDia(hoyStr)
  const proximosEventos = eventos.filter((e) => e.fecha >= hoyStr).slice(0, 5)

  const prevMes = () => { if (mes === 0) { setMes(11); setAnio(anio - 1) } else setMes(mes - 1) }
  const nextMes = () => { if (mes === 11) { setMes(0); setAnio(anio + 1) } else setMes(mes + 1) }

  if (isAgenda) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 lg:bottom-6 w-12 h-12 bg-luxor-primary text-white rounded-full shadow-lg hover:bg-luxor-secondary transition-all flex items-center justify-center"
      >
        <Calendar className="w-5 h-5" />
        {eventosHoy.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {eventosHoy.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-luxor-primary text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Agenda y Festividades</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prevMes} className="p-1 rounded hover:bg-gray-100 text-xs">&lt;</button>
              <span className="text-xs font-semibold text-gray-700">{MESES[mes]} {anio}</span>
              <button onClick={nextMes} className="p-1 rounded hover:bg-gray-100 text-xs">&gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DIAS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
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
                    className={`relative flex flex-col items-center justify-center py-1 rounded ${
                      isToday ? "bg-luxor-primary/10 font-bold text-luxor-primary" : "text-gray-700"
                    }`}
                  >
                    <span className="text-[11px]">{dia}</span>
                    {evts.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {evts.slice(0, 3).map((e) => (
                          <div key={e.id} className={`w-1 h-1 rounded-full ${CAT_COLORS[e.categoria] || "bg-gray-400"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {proximosEventos.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Proximos eventos</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {proximosEventos.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAT_COLORS[ev.categoria] || "bg-gray-400"}`} />
                    <span className="text-gray-700 truncate flex-1">{ev.titulo}</span>
                    <span className="text-gray-400 shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {ev.hora_inicio?.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
