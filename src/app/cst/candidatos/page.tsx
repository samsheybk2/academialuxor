"use client"

import { useState } from "react"
import {
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin, Calendar,
  ChevronDown, Eye, Trash2, ArrowRight, Users, TrendingUp, Clock, CheckCircle2,
  XCircle, Star, GripVertical, X, FileText, Building2, DollarSign, Send, Download,
  SlidersHorizontal
} from "lucide-react"

type EtapaATS = "nuevo" | "revision" | "entrevista" | "evaluacion" | "oferta" | "contratado" | "rechazado"

interface Candidato {
  id: string
  nombre: string
  email: string
  telefono: string
  ubicacion: string
  puesto: string
  fuente: string
  salarioEsperado: string
  fechaPostulacion: string
  etapa: EtapaATS
  calificacion: number
  notas: string
  avatar?: string
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

const candidatosMock: Candidato[] = [
  { id: "1", nombre: "Maria Garcia", email: "maria.garcia@email.com", telefono: "+58 412-1234567", ubicacion: "Caracas", puesto: "Gerente de Ventas", fuente: "LinkedIn", salarioEsperado: "$2,500", fechaPostulacion: "2026-07-20", etapa: "nuevo", calificacion: 4, notas: "Experiencia en retail" },
  { id: "2", nombre: "Carlos Rodriguez", email: "carlos.r@email.com", telefono: "+58 414-7654321", ubicacion: "Maracaibo", puesto: "Analista de RRHH", fuente: "Referido", salarioEsperado: "$1,800", fechaPostulacion: "2026-07-18", etapa: "revision", calificacion: 3, notas: "Buen perfil academico" },
  { id: "3", nombre: "Ana Martinez", email: "ana.m@email.com", telefono: "+58 416-9876543", ubicacion: "Valencia", puesto: "Coordinador de Logistica", fuente: "Computrabajo", salarioEsperado: "$2,000", fechaPostulacion: "2026-07-15", etapa: "entrevista", calificacion: 5, notas: "Excelente referencia" },
  { id: "4", nombre: "Luis Hernandez", email: "luis.h@email.com", telefono: "+58 412-5551234", ubicacion: "Barquisimeto", puesto: "Supervisor de Almacen", fuente: "Indeed", salarioEsperado: "$1,600", fechaPostulacion: "2026-07-12", etapa: "evaluacion", calificacion: 4, notas: "Certificado en SCM" },
  { id: "5", nombre: "Laura Sanchez", email: "laura.s@email.com", telefono: "+58 414-8889900", ubicacion: "Caracas", puesto: "Gerente de TI", fuente: "LinkedIn", salarioEsperado: "$3,500", fechaPostulacion: "2026-07-10", etapa: "oferta", calificacion: 5, notas: "10+ anios de experiencia" },
  { id: "6", nombre: "Pedro Lopez", email: "pedro.l@email.com", telefono: "+58 416-2223344", ubicacion: "Merida", puesto: "Cajero Senior", fuente: "Computrabajo", salarioEsperado: "$900", fechaPostulacion: "2026-07-08", etapa: "contratado", calificacion: 4, notas: "Aprobado en todas las etapas" },
  { id: "7", nombre: "Sofia Torres", email: "sofia.t@email.com", telefono: "+58 412-7776655", ubicacion: "Puerto Ordaz", puesto: "Asistente Administrativo", fuente: "Referido", salarioEsperado: "$1,100", fechaPostulacion: "2026-07-05", etapa: "rechazado", calificacion: 2, notas: "No cumple requisitos minimos" },
  { id: "8", nombre: "Diego Ramirez", email: "diego.r@email.com", telefono: "+58 414-3334455", ubicacion: "Caracas", puesto: "Gerente de Marketing", fuente: "LinkedIn", salarioEsperado: "$2,800", fechaPostulacion: "2026-07-22", etapa: "nuevo", calificacion: 3, notas: "Perfil interesante" },
  { id: "9", nombre: "Isabella Flores", email: "isabella.f@email.com", telefono: "+58 416-1112233", ubicacion: "Maracay", puesto: "Auditora Interna", fuente: "Indeed", salarioEsperado: "$2,200", fechaPostulacion: "2026-07-19", etapa: "revision", calificacion: 4, notas: "CIA certificada" },
]

const fuentes = ["Todas", "LinkedIn", "Computrabajo", "Indeed", "Referido", "Boca a boca", "Otros"]
const puestos = ["Todos", "Gerente de Ventas", "Analista de RRHH", "Coordinador de Logistica", "Supervisor de Almacen", "Gerente de TI", "Cajero Senior", "Asistente Administrativo", "Gerente de Marketing", "Auditora Interna"]

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>(candidatosMock)
  const [busqueda, setBusqueda] = useState("")
  const [filtroFuente, setFiltroFuente] = useState("Todas")
  const [filtroPuesto, setFiltroPuesto] = useState("Todos")
  const [vista, setVista] = useState<"kanban" | "lista">("kanban")
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null)
  const [showNuevo, setShowNuevo] = useState(false)

  const candidatosFiltrados = candidatos.filter((c) => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.puesto.toLowerCase().includes(busqueda.toLowerCase())
    const matchFuente = filtroFuente === "Todas" || c.fuente === filtroFuente
    const matchPuesto = filtroPuesto === "Todos" || c.puesto === filtroPuesto
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

  const moverCandidato = (id: string, nuevaEtapa: EtapaATS) => {
    setCandidatos((prev) => prev.map((c) => c.id === id ? { ...c, etapa: nuevaEtapa } : c))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-sm text-gray-500 mt-1">ATS - Seguimiento de captaciones de personal</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNuevo(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Candidato
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Candidatos", value: stats.total, icon: Users, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Nuevos", value: stats.nuevos, icon: TrendingUp, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "En Proceso", value: stats.enProceso, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Contratados", value: stats.contratados, icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o puesto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <select
          value={filtroFuente}
          onChange={(e) => setFiltroFuente(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {fuentes.map((f) => (
            <option key={f} value={f}>{f === "Todas" ? "Todas las fuentes" : f}</option>
          ))}
        </select>
        <select
          value={filtroPuesto}
          onChange={(e) => setFiltroPuesto(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {puestos.map((p) => (
            <option key={p} value={p}>{p === "Todos" ? "Todos los puestos" : p}</option>
          ))}
        </select>
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
                            <p className="text-xs text-gray-500 truncate">{candidato.puesto}</p>
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
                          {candidato.salarioEsperado}
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
                      <td className="px-4 py-3 text-sm text-gray-700">{candidato.puesto}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{candidato.fuente}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidato.salarioEsperado}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${etapa.bgColor} ${etapa.color} border ${etapa.borderColor}`}>
                          {etapa.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(candidato.fechaPostulacion).toLocaleDateString("es-VE")}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCandidatoSeleccionado(null)}>
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
                  <p className="text-sm text-gray-500">{candidatoSeleccionado.puesto}</p>
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
                  { icon: DollarSign, label: "Salario Esperado", value: candidatoSeleccionado.salarioEsperado },
                  { icon: Calendar, label: "Fecha Postulacion", value: new Date(candidatoSeleccionado.fechaPostulacion).toLocaleDateString("es-VE") },
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
                  <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nombre y apellido" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="email@ejemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="+58 412-0000000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ubicacion</label>
                  <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ciudad" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Puesto al que aplica</label>
                <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nombre del puesto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
                  <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option>LinkedIn</option>
                    <option>Computrabajo</option>
                    <option>Indeed</option>
                    <option>Referido</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salario esperado</label>
                  <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="$0,000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Observaciones sobre el candidato..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNuevo(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                Guardar Candidato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
