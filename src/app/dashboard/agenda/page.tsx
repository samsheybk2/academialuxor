"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Users,
  Tag,
  Cake,
} from "lucide-react"

interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  categoria: "reunion" | "capacitacion" | "tarea" | "evento" | "otro"
  usuario_id: string
  created_at: string
}

interface Estudiante {
  id: string
  nombre: string
  apellido: string
  email: string
}

interface Cumpleanero {
  id: string
  nombre: string
  apellido: string
  fecha_nacimiento: string
  mes: number
  dia: number
}

const CAT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reunion: { label: "Reunion", color: "bg-blue-500", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  capacitacion: { label: "Capacitacion", color: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  tarea: { label: "Tarea", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  evento: { label: "Evento", color: "bg-purple-500", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  otro: { label: "Otro", color: "bg-gray-500", bg: "bg-gray-50 text-gray-700 border-gray-200" },
}

const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

function AgendaContent() {
  const { user } = useAuth()
  const isFacilitador = user?.rol === "facilitador"
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const today = new Date()
  const [mes, setMes] = useState(today.getMonth())
  const [anio, setAnio] = useState(today.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora_inicio: "09:00",
    hora_fin: "10:00",
    categoria: "reunion" as Evento["categoria"],
  })

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [etiquetados, setEtiquetados] = useState<string[]>([])
  const [searchEstudiante, setSearchEstudiante] = useState("")
  const [showEstudiantes, setShowEstudiantes] = useState(false)
  const [cumpleaneros, setCumpleaneros] = useState<Cumpleanero[]>([])

  const supabase = createSupabaseClient()

  const fetchEventos = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from("agenda_eventos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true })
    setEventos(data || [])
    setLoading(false)
  }, [user, supabase])

  useEffect(() => { fetchEventos() }, [fetchEventos])

  useEffect(() => {
    if (!isFacilitador) return
    const fetchEstudiantes = async () => {
      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, email")
        .eq("rol", "estudiante")
        .order("nombre")
      setEstudiantes(data || [])
    }
    fetchEstudiantes()
  }, [isFacilitador, supabase])

  const fetchEtiquetados = useCallback(async (eventoId: string) => {
    const { data } = await supabase
      .from("evento_etiquetas")
      .select("usuario_id")
      .eq("evento_id", eventoId)
    setEtiquetados(data?.map((e) => e.usuario_id) || [])
  }, [supabase])

  useEffect(() => {
    const fetchCumpleaneros = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, fecha_nacimiento")
        .not("fecha_nacimiento", "is", null)
      if (data) {
        const mapped = data.map((p) => {
          const bd = new Date(p.fecha_nacimiento + "T12:00:00")
          return {
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido || "",
            fecha_nacimiento: p.fecha_nacimiento,
            mes: bd.getUTCMonth(),
            dia: bd.getUTCDate(),
          }
        })
        setCumpleaneros(mapped)
      }
    }
    fetchCumpleaneros()
  }, [supabase])

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

  const cumpleanerosPorDia = (dia: number) =>
    cumpleaneros.filter((c) => c.mes === mes && c.dia === dia)

  const eventosHoy = eventosPorDia(getFechaStr(today.getDate()))

  const openCreate = (fecha?: string) => {
    setEditingId(null)
    setForm({
      titulo: "",
      descripcion: "",
      fecha: fecha || getFechaStr(today.getDate()),
      hora_inicio: "09:00",
      hora_fin: "10:00",
      categoria: "reunion",
    })
    setEtiquetados([])
    setError("")
    setSaved(false)
    setShowModal(true)
  }

  const openEdit = async (ev: Evento) => {
    setEditingId(ev.id)
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      fecha: ev.fecha,
      hora_inicio: ev.hora_inicio,
      hora_fin: ev.hora_fin,
      categoria: ev.categoria,
    })
    await fetchEtiquetados(ev.id)
    setError("")
    setSaved(false)
    setShowModal(true)
  }

  const toggleEtiquetado = (id: string) => {
    setEtiquetados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const estudiantesFiltrados = estudiantes.filter((e) => {
    const q = searchEstudiante.toLowerCase()
    return (
      e.nombre?.toLowerCase().includes(q) ||
      e.apellido?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError("Escribe un titulo"); return }
    if (!form.fecha) { setError("Selecciona una fecha"); return }
    setSaving(true)
    setError("")

    let eventoId = editingId

    if (editingId) {
      const { error: err } = await supabase
        .from("agenda_eventos")
        .update({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          fecha: form.fecha,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          categoria: form.categoria,
        })
        .eq("id", editingId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { data, error: err } = await supabase
        .from("agenda_eventos")
        .insert({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          fecha: form.fecha,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          categoria: form.categoria,
          usuario_id: user!.id,
        })
        .select("id")
        .single()
      if (err) { setError(err.message); setSaving(false); return }
      eventoId = data?.id
    }

    if (eventoId && isFacilitador) {
      await supabase.from("evento_etiquetas").delete().eq("evento_id", eventoId)
      if (etiquetados.length > 0) {
        const insertData = etiquetados.map((uid) => ({
          evento_id: eventoId,
          usuario_id: uid,
        }))
        await supabase.from("evento_etiquetas").insert(insertData)

        const notifs = etiquetados.map((uid) => ({
          usuario_id: uid,
          titulo: "Nuevo evento en tu agenda",
          mensaje: `${user!.nombre || "Un facilitador"} te ha etiquetado en "${form.titulo.trim()}" el ${new Date(form.fecha + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })} de ${form.hora_inicio} a ${form.hora_fin}`,
          tipo: "agenda",
        }))
        await supabase.from("notificaciones").insert(notifs)
      }
    }

    setSaved(true)
    await fetchEventos()
    setSaving(false)
    setTimeout(() => { setShowModal(false); setSaved(false) }, 1000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este evento?")) return
    await supabase.from("agenda_eventos").delete().eq("id", id)
    await fetchEventos()
  }

  const prevMes = () => { if (mes === 0) { setMes(11); setAnio(anio - 1) } else setMes(mes - 1) }
  const nextMes = () => { if (mes === 11) { setMes(0); setAnio(anio + 1) } else setMes(mes + 1) }

  const irHoy = () => { setMes(today.getMonth()); setAnio(today.getFullYear()); setDiaSeleccionado(getFechaStr(today.getDate())) }

  const eventosSeleccionados = diaSeleccionado ? eventosPorDia(diaSeleccionado) : []
  const cbsDelDia = diaSeleccionado ? (() => {
    const d = new Date(diaSeleccionado + "T12:00:00")
    return cumpleaneros.filter((c) => c.mes === d.getUTCMonth() && c.dia === d.getUTCDate())
  })() : []

  return (
    <div className="w-full h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CardContent className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <button onClick={prevMes} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">{MESES[mes]} {anio}</h2>
                  <Button onClick={irHoy} variant="outline" size="sm">Hoy</Button>
                </div>
                <button onClick={nextMes} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr] overflow-hidden">
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
                  {DIAS.map((d) => (
                    <div key={d} className="bg-gray-50 py-1.5 text-center text-xs font-semibold text-gray-500">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
                  {Array.from({ length: diasCeldas }).map((_, i) => {
                    const dia = i - offsetLunes + 1
                    if (dia < 1 || dia > diasEnMes) return <div key={i} className="bg-white" />
                    const fecha = getFechaStr(dia)
                    const evts = eventosPorDia(fecha)
                    const cbs = cumpleanerosPorDia(dia)
                    const isToday = dia === today.getDate() && mes === today.getMonth() && anio === today.getFullYear()
                    const isSelected = diaSeleccionado === fecha

                    return (
                      <button
                        key={i}
                        onClick={() => setDiaSeleccionado(isSelected ? null : fecha)}
                        className={`bg-white p-1 text-left transition-colors overflow-hidden flex flex-col ${
                          isSelected ? "ring-2 ring-luxor-primary ring-inset" : isToday ? "bg-luxor-primary/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between shrink-0">
                          <span className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                            isToday ? "bg-luxor-primary text-white" : isSelected ? "bg-luxor-primary/10 text-luxor-primary" : "text-gray-700"
                          }`}>{dia}</span>
                          {cbs.length > 0 && (
                            <span className="text-xs" title={cbs.map((c) => `${c.nombre} ${c.apellido}`).join(", ")}>
                              🎂
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 space-y-px overflow-hidden flex-1">
                          {cbs.slice(0, 1).map((c) => (
                            <div key={c.id} className="text-[9px] px-0.5 py-px rounded truncate leading-tight bg-pink-100 text-pink-700 border border-pink-200">
                              🎉 {c.nombre}
                            </div>
                          ))}
                          {evts.slice(0, cbs.length > 0 ? 1 : 2).map((e) => (
                            <div key={e.id} className={`text-[9px] px-0.5 py-px rounded truncate leading-tight ${CAT_CONFIG[e.categoria].bg}`}>
                              {e.titulo}
                            </div>
                          ))}
                          {evts.length > (cbs.length > 0 ? 1 : 2) && <div className="text-[9px] text-gray-400 pl-0.5 leading-tight">+{evts.length - (cbs.length > 0 ? 1 : 2)}</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CardContent className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  {diaSeleccionado ? new Date(diaSeleccionado + "T12:00:00").toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" }) : "Proximos eventos"}
                </h3>
                <button onClick={() => openCreate(diaSeleccionado || undefined)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-luxor-primary text-white text-xs font-medium hover:bg-luxor-primary/90 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Nuevo
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></div>
              ) : diaSeleccionado ? (
                (eventosSeleccionados.length === 0 && cbsDelDia.length === 0) ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Sin eventos este dia</p>
                    <button onClick={() => openCreate(diaSeleccionado)} className="text-xs text-luxor-primary mt-2 hover:underline">Crear uno</button>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                    {cbsDelDia.length > 0 && (
                      <div className="p-3 rounded-lg border bg-gradient-to-r from-pink-50 to-amber-50 border-pink-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Cake className="w-4 h-4 text-pink-500" />
                          <p className="font-semibold text-sm text-pink-700">Cumpleaños</p>
                        </div>
                        {cbsDelDia.map((c) => (
                          <p key={c.id} className="text-xs text-pink-600 ml-6">
                            🎉 {c.nombre} {c.apellido}
                          </p>
                        ))}
                      </div>
                    )}
                    {eventosSeleccionados.map((ev) => (
                      <div key={ev.id} className={`p-3 rounded-lg border ${CAT_CONFIG[ev.categoria].bg}`}>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{ev.titulo}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                              <Clock className="w-3 h-3" />
                              {ev.hora_inicio} - {ev.hora_fin}
                            </div>
                            {ev.descripcion && <p className="text-xs mt-1 opacity-75 line-clamp-2">{ev.descripcion}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button onClick={() => openEdit(ev)} className="p-1 rounded hover:bg-black/5"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(ev.id)} className="p-1 rounded hover:bg-black/5"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                  {eventos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Tu agenda esta vacia</p>
                      <button onClick={() => openCreate()} className="text-xs text-luxor-primary mt-2 hover:underline">Crear tu primer evento</button>
                    </div>
                  ) : (
                    eventos.slice(0, 8).map((ev) => (
                      <div key={ev.id} className={`p-2.5 rounded-lg border ${CAT_CONFIG[ev.categoria].bg} cursor-pointer`} onClick={() => { setDiaSeleccionado(ev.fecha); setMes(new Date(ev.fecha + "T12:00:00").getMonth()); setAnio(new Date(ev.fecha + "T12:00:00").getFullYear()) }}>
                        <p className="font-medium text-sm truncate">{ev.titulo}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs opacity-75">
                          <span>{new Date(ev.fecha + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</span>
                          <Clock className="w-3 h-3" />
                          <span>{ev.hora_inicio}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shrink-0">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Categorias</h3>
              <div className="space-y-1">
                {Object.entries(CAT_CONFIG).map(([key, c]) => {
                  const count = eventos.filter((e) => e.categoria === key).length
                  return (
                    <div key={key} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                        <span className="text-xs text-gray-700">{c.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Editar evento" : "Nuevo evento"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Titulo *</label>
                <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Titulo del evento" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Descripcion</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} placeholder="Descripcion (opcional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Evento["categoria"] })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm">
                  {Object.entries(CAT_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Fecha *</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Inicio</label>
                  <input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Fin</label>
                  <input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                </div>
              </div>

              {isFacilitador && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Tag className="w-3.5 h-3.5" />
                    Etiquetar estudiantes
                  </label>
                  <p className="text-[10px] text-gray-400">Los estudiantes etiquetados recibirán una notificacion</p>

                  {etiquetados.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {estudiantes
                        .filter((e) => etiquetados.includes(e.id))
                        .map((e) => (
                          <span key={e.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-luxor-primary/10 text-luxor-primary rounded-full text-[10px] font-medium">
                            {e.nombre} {e.apellido}
                            <button onClick={() => toggleEtiquetado(e.id)} className="hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowEstudiantes(!showEstudiantes)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-left text-sm text-gray-500 hover:border-gray-400 transition-colors"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      {etiquetados.length > 0 ? `${etiquetados.length} seleccionados` : "Seleccionar estudiantes..."}
                    </button>

                    {showEstudiantes && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-hidden flex flex-col">
                        <div className="p-1.5 border-b border-gray-100">
                          <input
                            type="text"
                            value={searchEstudiante}
                            onChange={(e) => setSearchEstudiante(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full px-2 py-1 rounded border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-luxor-primary/30"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {estudiantesFiltrados.length === 0 ? (
                            <div className="p-3 text-xs text-gray-400 text-center">Sin resultados</div>
                          ) : (
                            estudiantesFiltrados.map((e) => (
                              <button
                                key={e.id}
                                onClick={() => toggleEtiquetado(e.id)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  etiquetados.includes(e.id) ? "bg-luxor-primary/5" : ""
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                  etiquetados.includes(e.id) ? "bg-luxor-primary border-luxor-primary" : "border-gray-300"
                                }`}>
                                  {etiquetados.includes(e.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{e.nombre} {e.apellido}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{e.email}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs"><AlertCircle className="w-3 h-3" />{error}</div>}
              {saved && <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs"><CheckCircle2 className="w-3 h-3" />Guardado correctamente</div>}

              <div className="flex gap-3">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1" size="sm">Cancelar</Button>
                <Button onClick={handleSave} disabled={saving || !form.titulo.trim()} className="flex-1" size="sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgendaPage() {
  return <ProtectedRoute><AgendaContent /></ProtectedRoute>
}
