"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import {
  Search, Plus, MoreHorizontal, Mail, Phone, MapPin, Calendar,
  ChevronDown, Eye, Trash2, ArrowRight, Users, TrendingUp, Clock, CheckCircle2,
  XCircle, Star, GripVertical, X, FileText, Building2, DollarSign, Send, Download,
  SlidersHorizontal, Loader2, Award, BarChart3
} from "lucide-react"

type EtapaATS = "nuevo" | "revision" | "entrevista" | "evaluacion" | "oferta" | "contratado" | "rechazado"

interface Candidato {
  id: string
  nombre: string
  email: string
  telefono?: string
  cedula?: string
  ubicacion?: string
  cargo_id?: string
  cargo_nombre?: string
  fuente: string
  salario_esperado?: string
  cv_url?: string
  notas?: string
  etapa: EtapaATS
  calificacion: number
  fecha_postulacion: string
}

const etapas: { id: EtapaATS; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { id: "nuevo", label: "Nuevo", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { id: "revision", label: "En Revision", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { id: "entrevista", label: "Entrevista", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "evaluacion", label: "Evaluacion", color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { id: "oferta", label: "Oferta", color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
  { id: "contratado", label: "Contratado", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { id: "rechazado", label: "Rechazado", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
]

const fuentes = ["Todas", "LinkedIn", "Computrabajo", "Indeed", "Referido", "Boca a boca", "Otros"]

export default function CandidatosPage() {
  const supabase = createSupabaseClient()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [cargos, setCargos] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroFuente, setFiltroFuente] = useState("Todas")
  const [filtroPuesto, setFiltroPuesto] = useState("Todos")
  const [puestoNuevo, setPuestoNuevo] = useState("")
  const [vista, setVista] = useState<"kanban" | "lista">("kanban")
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null)
  const [showNuevo, setShowNuevo] = useState(false)
  const [showFiltros, setShowFiltros] = useState(false)
  const [nuevoForm, setNuevoForm] = useState({ nombre: "", email: "", telefono: "", ubicacion: "", fuente: "LinkedIn", salario_esperado: "", notas: "" })
  const [testResultados, setTestResultados] = useState<{
    puntaje_total: number
    puntaje_maximo: number
    porcentaje: number
    estado: string
    respuestas: {
      pregunta_texto: string
      competencia_nombre: string
      competencia_color: string
      respuesta_texto: string
      puntaje_obtenido: number
      puntaje_max: number
    }[]
  } | null>(null)

  const candidatosFiltrados = candidatos.filter((c) => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.cargo_nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    const matchFuente = filtroFuente === "Todas" || c.fuente === filtroFuente
    const matchPuesto = filtroPuesto === "Todos" || c.cargo_nombre === filtroPuesto
    return matchBusqueda && matchFuente && matchPuesto
  })

  const getCandidatosPorEtapa = (etapa: EtapaATS) =>
    candidatosFiltrados.filter((c) => c.etapa === etapa)

  const stats = {
    total: candidatos.length,
    nuevos: candidatos.filter((c) => c.etapa === "nuevo").length,
    enProceso: candidatos.filter((c) => !["contratado", "rechazado"].includes(c.etapa)).length,
    contratados: candidatos.filter((c) => c.etapa === "contratado").length,
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [candidatosRes, cargosRes] = await Promise.all([
        supabase.from("cst_candidatos").select("*").order("fecha_postulacion", { ascending: false }),
        supabase.from("cargos").select("id, nombre").order("nombre"),
      ])
      if (candidatosRes.data) {
        const cargosMap = new Map((cargosRes.data || []).map((c: any) => [c.id, c.nombre]))
        const mapped = candidatosRes.data.map((c: any) => ({
          ...c,
          cargo_nombre: cargosMap.get(c.cargo_id) || "",
        }))
        setCandidatos(mapped as Candidato[])
      }
      if (cargosRes.data) setCargos(cargosRes.data)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const cargosOptions = cargos.map((c) => ({ value: c.id, label: c.nombre }))

  const moverCandidato = async (id: string, nuevaEtapa: EtapaATS) => {
    const candidato = candidatos.find((c) => c.id === id)
    if (!candidato || candidato.etapa === nuevaEtapa) return
    const { error } = await supabase
      .from("cst_candidatos")
      .update({ etapa: nuevaEtapa })
      .eq("id", id)
    if (error) return
    await supabase.from("cst_candidato_historial").insert({
      candidato_id: id,
      etapa_anterior: candidato.etapa,
      etapa_nueva: nuevaEtapa,
    })
    setCandidatos((prev) => prev.map((c) => c.id === id ? { ...c, etapa: nuevaEtapa } : c))
  }

  const crearCandidato = async () => {
    if (!nuevoForm.nombre || !nuevoForm.email || !puestoNuevo) return
    const cargo = cargosOptions.find((c) => c.label === puestoNuevo)
    const { data, error } = await supabase.from("cst_candidatos").insert({
      nombre: nuevoForm.nombre,
      email: nuevoForm.email,
      telefono: nuevoForm.telefono || null,
      ubicacion: nuevoForm.ubicacion || null,
      cargo_id: cargo?.value || null,
      fuente: nuevoForm.fuente,
      salario_esperado: nuevoForm.salario_esperado || null,
      notas: nuevoForm.notas || null,
      etapa: "nuevo",
      calificacion: 0,
    }).select().single()
    if (!error && data) {
      const cargoNombre = cargo?.label || ""
      setCandidatos((prev) => [{ ...data, cargo_nombre: cargoNombre } as unknown as Candidato, ...prev])
      setShowNuevo(false)
      setPuestoNuevo("")
      setNuevoForm({ nombre: "", email: "", telefono: "", ubicacion: "", fuente: "LinkedIn", salario_esperado: "", notas: "" })
    }
  }

  const fetchTestResultados = async (candidatoId: string) => {
    setTestResultados(null)
    const { data: sesion } = await supabase
      .from("cst_test_sesiones")
      .select("id, puntaje_total, puntaje_maximo, porcentaje, estado")
      .eq("candidato_id", candidatoId)
      .eq("estado", "completado")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sesion) return

    const { data: respuestas } = await supabase
      .from("cst_test_respuestas")
      .select("pregunta_id, respuesta_id, puntaje_obtenido")
      .eq("sesion_id", sesion.id)

    if (!respuestas || respuestas.length === 0) return

    const mapped = []
    for (const r of respuestas) {
      const { data: pregunta } = await supabase
        .from("cst_competencia_preguntas")
        .select("texto, competencia_id, competencias(nombre, color)")
        .eq("id", r.pregunta_id)
        .single()

      const { data: respuestaTexto } = await supabase
        .from("cst_competencia_respuestas")
        .select("texto")
        .eq("id", r.respuesta_id)
        .single()

      if (pregunta) {
        const comp = pregunta.competencias as any
        mapped.push({
          pregunta_texto: pregunta.texto || "",
          competencia_nombre: comp?.nombre || "",
          competencia_color: comp?.color || "#6366f1",
          respuesta_texto: respuestaTexto?.texto || "",
          puntaje_obtenido: r.puntaje_obtenido,
          puntaje_max: 10,
        })
      }
    }

    setTestResultados({
      puntaje_total: sesion.puntaje_total,
      puntaje_maximo: sesion.puntaje_maximo,
      porcentaje: sesion.porcentaje,
      estado: sesion.estado,
      respuestas: mapped,
    })
  }

  useEffect(() => {
    if (candidatoSeleccionado) {
      fetchTestResultados(candidatoSeleccionado.id)
    } else {
      setTestResultados(null)
    }
  }, [candidatoSeleccionado])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <Users className="w-3.5 h-3.5" />
          Total: {stats.total}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <TrendingUp className="w-3.5 h-3.5" />
          Nuevos: {stats.nuevos}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          En Proceso: {stats.enProceso}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Contratados: {stats.contratados}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o puesto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showFiltros || filtroFuente !== "Todas" || filtroPuesto !== "Todos"
                ? "bg-emerald-100 text-emerald-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {showFiltros && (
            <div className="absolute top-full mt-2 right-0 z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px] space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Fuente</label>
                <select
                  value={filtroFuente}
                  onChange={(e) => setFiltroFuente(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {fuentes.map((f) => (
                    <option key={f} value={f}>{f === "Todas" ? "Todas" : f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Puesto</label>
                <select
                  value={filtroPuesto}
                  onChange={(e) => setFiltroPuesto(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Todos">Todos</option>
                  {cargosOptions.map((c) => (
                    <option key={c.value} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowNuevo(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setVista("kanban")}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${vista === "kanban" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setVista("lista")}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${vista === "lista" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Lista
          </button>
        </div>
      </div>

      {vista === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => {
            const candidatosEtapa = getCandidatosPorEtapa(etapa.id)
            return (
              <div key={etapa.id} className="min-w-[280px] flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${etapa.bgColor} border ${etapa.borderColor} mb-3`}>
                  <span className={`text-sm font-semibold ${etapa.color}`}>{etapa.label}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${etapa.color} ${etapa.bgColor}`}>
                    {candidatosEtapa.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {candidatosEtapa.map((candidato) => (
                    <div
                      key={candidato.id}
                      className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                      onClick={() => setCandidatoSeleccionado(candidato)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {candidato.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{candidato.nombre}</p>
                            <p className="text-xs text-gray-500 truncate">{candidato.cargo_nombre}</p>
                          </div>
                        </div>
                        <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {candidato.fuente}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {candidato.salario_esperado}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= candidato.calificacion ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {etapa.id !== "nuevo" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const idx = etapas.findIndex((et) => et.id === candidato.etapa)
                                if (idx > 0) moverCandidato(candidato.id, etapas[idx - 1].id)
                              }}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Mover a etapa anterior"
                            >
                              <ArrowRight className="w-3 h-3 text-gray-400 rotate-180" />
                            </button>
                          )}
                          {etapa.id !== "contratado" && etapa.id !== "rechazado" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const idx = etapas.findIndex((et) => et.id === candidato.etapa)
                                if (idx < etapas.length - 2) moverCandidato(candidato.id, etapas[idx + 1].id)
                              }}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Mover a siguiente etapa"
                            >
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {candidatosEtapa.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Sin candidatos
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Candidato</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Puesto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fuente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Salario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Etapa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidatosFiltrados.map((candidato) => {
                  const etapa = etapas.find((e) => e.id === candidato.etapa)!
                  return (
                    <tr
                      key={candidato.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setCandidatoSeleccionado(candidato)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {candidato.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{candidato.nombre}</p>
                            <p className="text-xs text-gray-500">{candidato.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidato.cargo_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{candidato.fuente}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidato.salario_esperado}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${etapa.bgColor} ${etapa.color} border ${etapa.borderColor}`}>
                          {etapa.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(candidato.fecha_postulacion).toLocaleDateString("es-VE")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {candidatosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No se encontraron candidatos</p>
            </div>
          )}
        </div>
      )}

      {candidatoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setCandidatoSeleccionado(null); setTestResultados(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Detalle del Candidato</h2>
              <button onClick={() => setCandidatoSeleccionado(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-xl">
                    {candidatoSeleccionado.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{candidatoSeleccionado.nombre}</h3>
                  <p className="text-sm text-gray-500">{candidatoSeleccionado.cargo_nombre}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= candidatoSeleccionado.calificacion ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Mail, label: "Email", value: candidatoSeleccionado.email },
                  { icon: Phone, label: "Telefono", value: candidatoSeleccionado.telefono },
                  { icon: MapPin, label: "Ubicacion", value: candidatoSeleccionado.ubicacion },
                  { icon: Building2, label: "Fuente", value: candidatoSeleccionado.fuente },
                  { icon: DollarSign, label: "Salario Esperado", value: candidatoSeleccionado.salario_esperado },
                  { icon: Calendar, label: "Fecha Postulacion", value: new Date(candidatoSeleccionado.fecha_postulacion).toLocaleDateString("es-VE") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <item.icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{candidatoSeleccionado.notas}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Mover a etapa</p>
                <div className="flex flex-wrap gap-2">
                  {etapas.map((etapa) => (
                    <button
                      key={etapa.id}
                      onClick={() => {
                        moverCandidato(candidatoSeleccionado.id, etapa.id)
                        setCandidatoSeleccionado({ ...candidatoSeleccionado, etapa: etapa.id })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        candidatoSeleccionado.etapa === etapa.id
                          ? `${etapa.bgColor} ${etapa.color} border ${etapa.borderColor} ring-2 ring-offset-1 ring-current/20`
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {etapa.label}
                    </button>
                  ))}
                </div>
              </div>

              {testResultados && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-gray-700">Resultados del Test</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Puntaje</span>
                      <span className="text-lg font-bold text-gray-900">
                        {testResultados.puntaje_total} / {testResultados.puntaje_maximo}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Porcentaje</span>
                        <span className={`text-sm font-bold ${
                          testResultados.porcentaje >= 80 ? "text-green-600" :
                          testResultados.porcentaje >= 60 ? "text-amber-600" :
                          "text-red-600"
                        }`}>
                          {testResultados.porcentaje}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            testResultados.porcentaje >= 80 ? "bg-green-500" :
                            testResultados.porcentaje >= 60 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${testResultados.porcentaje}%` }}
                        />
                      </div>
                    </div>
                    {testResultados.respuestas.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-700 font-medium">
                          Ver detalle por competencia
                        </summary>
                        <div className="mt-2 space-y-2">
                          {testResultados.respuestas.map((r, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                  style={{ backgroundColor: r.competencia_color }}
                                >
                                  {r.competencia_nombre}
                                </span>
                                <span className={`ml-auto text-xs font-bold ${
                                  r.puntaje_obtenido >= 8 ? "text-green-600" :
                                  r.puntaje_obtenido >= 5 ? "text-amber-600" :
                                  "text-red-600"
                                }`}>
                                  {r.puntaje_obtenido} pts
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 mb-1">{r.pregunta_texto}</p>
                              <p className="text-xs text-gray-500 italic">"{r.respuesta_texto}"</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                  <Send className="w-4 h-4" />
                  Enviar Email
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNuevo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Candidato</h2>
              <button onClick={() => setShowNuevo(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" value={nuevoForm.nombre} onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nombre y apellido" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={nuevoForm.email} onChange={(e) => setNuevoForm({ ...nuevoForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="email@ejemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" value={nuevoForm.telefono} onChange={(e) => setNuevoForm({ ...nuevoForm, telefono: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="+58 412-0000000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ubicacion</label>
                  <input type="text" value={nuevoForm.ubicacion} onChange={(e) => setNuevoForm({ ...nuevoForm, ubicacion: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ciudad" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Puesto al que aplica</label>
                <select
                  value={puestoNuevo}
                  onChange={(e) => setPuestoNuevo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Seleccionar cargo...</option>
                  {cargosOptions.map((c) => (
                    <option key={c.value} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
                  <select value={nuevoForm.fuente} onChange={(e) => setNuevoForm({ ...nuevoForm, fuente: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Computrabajo">Computrabajo</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Referido">Referido</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salario esperado</label>
                  <input type="text" value={nuevoForm.salario_esperado} onChange={(e) => setNuevoForm({ ...nuevoForm, salario_esperado: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="$0,000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={3} value={nuevoForm.notas} onChange={(e) => setNuevoForm({ ...nuevoForm, notas: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Observaciones sobre el candidato..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNuevo(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={crearCandidato} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                Guardar Candidato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
