"use client"

import { useState } from "react"
import {
  Search, Plus, ClipboardList, Clock, Users, BarChart3, Eye, Edit3, Trash2,
  CheckCircle2, XCircle, MoreHorizontal, X, Play, Pause, FileText, Target,
  TrendingUp, Award, AlertTriangle, ChevronDown, ChevronUp, Star, Send, SlidersHorizontal
} from "lucide-react"

type TestEstado = "borrador" | "activo" | "inactivo"
type TipoTest = "psicometrico" | "competencias" | "habilidades" | "conocimiento"

interface TestCompetencia {
  id: string
  nombre: string
  tipo: TipoTest
  estado: TestEstado
  preguntas: number
  duracion: number
  intentos: number
  intentosPromedio: number
  calificacionPromedio: number
  tasaAprobacion: number
  creadoPor: string
  fechaCreacion: string
  descripcion: string
}

interface Pregunta {
  id: string
  texto: string
  tipo: "opcion_multiple" | "escala" | "verdadero_falso" | "abierta"
  opciones?: string[]
  respuestaCorrecta?: number
  competencia: string
}

const testsMock: TestCompetencia[] = [
  { id: "1", nombre: "Test de Liderazgo", tipo: "competencias", estado: "activo", preguntas: 25, duracion: 30, intentos: 45, intentosPromedio: 1.2, calificacionPromedio: 78, tasaAprobacion: 82, creadoPor: "Admin", fechaCreacion: "2026-06-15", descripcion: "Evalua capacidades de liderazgo y toma de decisiones" },
  { id: "2", nombre: "Evaluacion de Trabajo en Equipo", tipo: "competencias", estado: "activo", preguntas: 20, duracion: 25, intentos: 38, intentosPromedio: 1.1, calificacionPromedio: 85, tasaAprobacion: 90, creadoPor: "Admin", fechaCreacion: "2026-06-20", descripcion: "Mide habilidades de colaboracion y comunicacion" },
  { id: "3", nombre: "Test Psicometrico General", tipo: "psicometrico", estado: "activo", preguntas: 40, duracion: 45, intentos: 62, intentosPromedio: 1.3, calificacionPromedio: 72, tasaAprobacion: 75, creadoPor: "Psicologo", fechaCreacion: "2026-05-10", descripcion: "Evaluacion psicologica completa del candidato" },
  { id: "4", nombre: "Habilidades Administrativas", tipo: "habilidades", estado: "activo", preguntas: 30, duracion: 35, intentos: 28, intentosPromedio: 1.0, calificacionPromedio: 81, tasaAprobacion: 88, creadoPor: "Admin", fechaCreacion: "2026-07-01", descripcion: "Evalua conocimientos en办公 y herramientas digitales" },
  { id: "5", nombre: "Conocimiento en Retail", tipo: "conocimiento", estado: "borrador", preguntas: 15, duracion: 20, intentos: 0, intentosPromedio: 0, calificacionPromedio: 0, tasaAprobacion: 0, creadoPor: "Admin", fechaCreacion: "2026-07-20", descripcion: "Test sobre procesos de venta y atencion al cliente" },
  { id: "6", nombre: "Test de Manejo del Estres", tipo: "psicometrico", estado: "inactivo", preguntas: 18, duracion: 20, intentos: 15, intentosPromedio: 1.5, calificacionPromedio: 68, tasaAprobacion: 60, creadoPor: "Psicologo", fechaCreacion: "2026-04-05", descripcion: "Mide tolerancia al estres y presion laboral" },
]

const tiposTest = [
  { value: "psicometrico", label: "Psicometrico", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  { value: "competencias", label: "Competencias", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  { value: "habilidades", label: "Habilidades", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "conocimiento", label: "Conocimiento", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
]

const preguntasMock: Pregunta[] = [
  { id: "1", texto: "Como describiria su estilo de liderazgo?", tipo: "opcion_multiple", opciones: ["Autoritario", "Democrático", "Laissez-faire", "Transformacional"], competencia: "Liderazgo" },
  { id: "2", texto: "Prefiero trabajar en equipo antes que individualmente", tipo: "escala", competencia: "Trabajo en Equipo" },
  { id: "3", texto: "La comunicacion efectiva es clave para el exito laboral", tipo: "verdadero_falso", competencia: "Comunicacion" },
  { id: "4", texto: "Describa una situacion donde resolvio un conflicto", tipo: "abierta", competencia: "Resolucion de Conflictos" },
]

export default function TestCompetenciasPage() {
  const [tests, setTests] = useState<TestCompetencia[]>(testsMock)
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [testSeleccionado, setTestSeleccionado] = useState<TestCompetencia | null>(null)
  const [showCrear, setShowCrear] = useState(false)
  const [showPreguntas, setShowPreguntas] = useState(false)
  const [preguntas, setPreguntas] = useState<Pregunta[]>(preguntasMock)
  const [showAsignar, setShowAsignar] = useState(false)
  const [showFiltros, setShowFiltros] = useState(false)

  const testsFiltrados = tests.filter((t) => {
    const matchBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo
    const matchEstado = filtroEstado === "todos" || t.estado === filtroEstado
    return matchBusqueda && matchTipo && matchEstado
  })

  const stats = {
    total: tests.length,
    activos: tests.filter((t) => t.estado === "activo").length,
    totalIntentos: tests.reduce((sum, t) => sum + t.intentos, 0),
    calificacionPromedio: tests.filter((t) => t.intentos > 0).reduce((sum, t) => sum + t.calificacionPromedio, 0) / Math.max(tests.filter((t) => t.intentos > 0).length, 1),
  }

  const getTipoConfig = (tipo: TipoTest) => tiposTest.find((t) => t.value === tipo)!

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test de Competencias</h1>
          <p className="text-sm text-gray-500 mt-1">Evaluaciones psicometricas y de competencias laborales</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCrear(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Crear Test
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <ClipboardList className="w-3.5 h-3.5" />
          Tests: {stats.total}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Activos: {stats.activos}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Users className="w-3.5 h-3.5" />
          Intentos: {stats.totalIntentos}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <TrendingUp className="w-3.5 h-3.5" />
          Promedio: {Math.round(stats.calificacionPromedio)}%
        </span>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar test por nombre o descripcion..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showFiltros || filtroTipo !== "todos" || filtroEstado !== "todos"
                ? "bg-emerald-100 text-emerald-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {showFiltros && (
            <div className="absolute top-full mt-2 right-0 z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px] space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Tipo</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="todos">Todos</option>
                  {tiposTest.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="borrador">Borrador</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {testsFiltrados.map((test) => {
          const tipo = getTipoConfig(test.tipo)
          return (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              onClick={() => setTestSeleccionado(test)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tipo.bg} border ${tipo.border}`}>
                    <ClipboardList className={`w-5 h-5 ${tipo.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{test.nombre}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tipo.bg} ${tipo.color} border ${tipo.border} mt-1`}>
                      {tipo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                    test.estado === "activo" ? "bg-green-50 text-green-700 border border-green-200" :
                    test.estado === "borrador" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}>
                    {test.estado.charAt(0).toUpperCase() + test.estado.slice(1)}
                  </span>
                  <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{test.descripcion}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Preguntas</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{test.preguntas}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Duracion</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{test.duracion}m</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Intentos</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{test.intentos}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Aprobacion</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{test.tasaAprobacion}%</p>
                </div>
              </div>

              {test.intentos > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Promedio</span>
                    <span className="text-[10px] font-medium text-gray-700">{test.calificacionPromedio}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${test.calificacionPromedio}%`,
                        backgroundColor: test.calificacionPromedio >= 80 ? "#10b981" : test.calificacionPromedio >= 60 ? "#f59e0b" : "#ef4444"
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">Creado: {new Date(test.fechaCreacion).toLocaleDateString("es-VE")}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowPreguntas(true); setTestSeleccionado(test) }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                    title="Ver preguntas"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAsignar(true) }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Asignar test"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {testsFiltrados.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-sm">No se encontraron tests</p>
        </div>
      )}

      {testSeleccionado && !showPreguntas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTestSeleccionado(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Detalle del Test</h2>
              <button onClick={() => setTestSeleccionado(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${getTipoConfig(testSeleccionado.tipo).bg} border ${getTipoConfig(testSeleccionado.tipo).border}`}>
                  <ClipboardList className={`w-6 h-6 ${getTipoConfig(testSeleccionado.tipo).color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{testSeleccionado.nombre}</h3>
                  <p className="text-sm text-gray-500">{testSeleccionado.descripcion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Preguntas</p>
                  <p className="text-xl font-bold text-gray-900">{testSeleccionado.preguntas}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Duracion</p>
                  <p className="text-xl font-bold text-gray-900">{testSeleccionado.duracion} min</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Intentos totales</p>
                  <p className="text-xl font-bold text-gray-900">{testSeleccionado.intentos}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Tasa aprobacion</p>
                  <p className="text-xl font-bold text-gray-900">{testSeleccionado.tasaAprobacion}%</p>
                </div>
              </div>

              {testSeleccionado.intentos > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2">Rendimiento</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Promedio general</span>
                      <span className="text-sm font-semibold text-gray-900">{testSeleccionado.calificacionPromedio}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${testSeleccionado.calificacionPromedio}%`,
                          backgroundColor: testSeleccionado.calificacionPromedio >= 80 ? "#10b981" : testSeleccionado.calificacionPromedio >= 60 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPreguntas(true) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Preguntas
                </button>
                <button
                  onClick={() => { setShowAsignar(true); setTestSeleccionado(null) }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreguntas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreguntas(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preguntas del Test</h2>
                <p className="text-xs text-gray-500">{testSeleccionado?.nombre}</p>
              </div>
              <button onClick={() => setShowPreguntas(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {preguntas.map((pregunta, idx) => (
                <div key={pregunta.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">{pregunta.texto}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {pregunta.tipo.replace("_", " ")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {pregunta.competencia}
                        </span>
                      </div>
                      {pregunta.opciones && (
                        <div className="space-y-1.5 mt-2">
                          {pregunta.opciones.map((opcion, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                pregunta.respuestaCorrecta === i ? "border-green-500 bg-green-500" : "border-gray-300"
                              }`}>
                                {pregunta.respuestaCorrecta === i && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              {opcion}
                            </div>
                          ))}
                        </div>
                      )}
                      {pregunta.tipo === "escala" && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-500">1</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-xs text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer">
                                {n}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCrear(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Crear Nuevo Test</h2>
              <button onClick={() => setShowCrear(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del test</label>
                <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ej: Test de Liderazgo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Descripcion breve del test..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de test</label>
                  <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    {tiposTest.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duracion (minutos)</label>
                  <input type="number" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Calificacion minima para aprobar (%)</label>
                <input type="number" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="70" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowCrear(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                Crear Test
              </button>
            </div>
          </div>
        </div>
      )}

      {showAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAsignar(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Asignar Test</h2>
              <button onClick={() => setShowAsignar(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Seleccionar candidatos</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {["Maria Garcia", "Carlos Rodriguez", "Ana Martinez", "Luis Hernandez", "Laura Sanchez"].map((nombre) => (
                    <label key={nombre} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold text-xs">
                          {nombre.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha limite</label>
                <input type="date" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mensaje opcional</label>
                <textarea rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Instruccion para el candidato..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAsignar(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Asignar Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
