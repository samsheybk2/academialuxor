"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { tipoEtapaConfig } from "@/types/ruta-aprendizaje"
import type { ElementoRuta, TipoEtapa } from "@/types/ruta-aprendizaje"
import {
  ArrowLeft,
  BookOpen,
  Wrench,
  FileText,
  Users,
  GraduationCap,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  List,
  LayoutList,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  GripVertical,
  Save,
  Route,
} from "lucide-react"
import Link from "next/link"

const iconMap: Record<TipoEtapa, React.ElementType> = {
  curso: BookOpen,
  taller: Wrench,
  examen: FileText,
}

const stepColors: Record<TipoEtapa, { ring: string; bg: string; line: string; text: string }> = {
  curso: { ring: "border-blue-400", bg: "bg-blue-50", line: "bg-blue-300", text: "text-blue-700" },
  taller: { ring: "border-violet-400", bg: "bg-violet-50", line: "bg-violet-300", text: "text-violet-700" },
  examen: { ring: "border-amber-400", bg: "bg-amber-50", line: "bg-amber-300", text: "text-amber-700" },
}

interface StudentData {
  id: string
  nombre: string
  email: string
  nivel: string
  estado: string
  progreso: number
  certificado: boolean
}

const emptyForm = { titulo: "", tipo: "curso" as TipoEtapa, descripcion: "", duracion: "", obligatorio: true, cursoId: "" as string | null }

function CargoContent({ id }: { id: string }) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const isDecano = user?.rol === "decano" || user?.rol === "developer"

  const [cargoName, setCargoName] = useState("")
  const [cargoDesc, setCargoDesc] = useState("")
  const [cargoNivel, setCargoNivel] = useState("")
  const [isCustom, setIsCustom] = useState(id.startsWith("custom_"))
  const [elementos, setElementos] = useState<ElementoRuta[]>([])
  const [cursosDisponibles, setCursosDisponibles] = useState<{ id: string; titulo: string; descripcion: string; duracion: string }[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"sequential" | "grouped">("sequential")
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase.from("cargos").select("*").eq("id", id).single()
      const nombre = data?.nombre || ""
      const nivel = data?.nivel || "operadores"
      if (data) {
        setCargoName(nombre)
        setCargoDesc(data.descripcion || "Define la ruta de aprendizaje para este cargo")
        setCargoNivel(nivel)
      }

      const { data: cursosAll } = await supabase
        .from("cursos")
        .select("id, titulo, descripcion, duracion, nivel")
        .eq("estado", "aprobado")

      const cursosFiltrados = (cursosAll || []).filter((c: any) => {
        if (!c.nivel) return false
        if (Array.isArray(c.nivel)) return c.nivel.includes(nivel)
        return c.nivel === nivel
      })

      setCursosDisponibles(cursosFiltrados)

      const { data: elems } = await supabase
        .from("cargo_elementos")
        .select("*")
        .eq("cargo_id", id)
        .order("orden", { ascending: true })

      if (elems) {
        setElementos(
           elems.map((e: any) => ({
            id: e.id,
            titulo: e.titulo,
            tipo: e.tipo,
            descripcion: e.descripcion || "",
            duracion: e.duracion || "Sin definir",
            orden: e.orden,
            obligatorio: e.obligatorio ?? true,
            cursoId: e.curso_id || undefined,
          }))
        )
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nombre, email, nivel")
        .eq("rol", "estudiante")
        .eq("cargo", nombre)

      if (profiles) {
        const studentsWithProgress = await Promise.all(
           profiles.map(async (p: any) => {
            const { data: inscripciones } = await supabase
              .from("inscripciones")
              .select("id, estado")
              .eq("user_id", p.id)

            const { data: certificados } = await supabase
              .from("certificados")
              .select("id")
              .eq("user_id", p.id)
              .limit(1)

            const total = inscripciones?.length || 0
            const completadas = inscripciones?.filter((i: any) => i.estado === "completada").length || 0
            const activas = inscripciones?.filter((i: any) => i.estado === "activa").length || 0

            let estado = "sin_iniciar"
            if (completadas > 0 && total === completadas) estado = "graduado"
            else if (activas > 0 || completadas > 0) estado = "en_curso"

            return {
              id: p.id,
              nombre: p.nombre,
              email: p.email,
              nivel: p.nivel || "N/A",
              estado,
              progreso: total > 0 ? Math.round((completadas / total) * 100) : 0,
              certificado: (certificados?.length || 0) > 0,
            }
          })
        )
        setStudents(studentsWithProgress)
      }

      setLoading(false)
    }

    load()
  }, [id])

  async function handleAddElemento() {
    if (!form.titulo.trim()) return
    setSaving(true)

    const maxOrden = elementos.length > 0 ? Math.max(...elementos.map((e) => e.orden)) : 0
    const newId = `e_${Date.now()}`

    const { error } = await supabase.from("cargo_elementos").insert({
      id: newId,
      cargo_id: id,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      duracion: form.duracion.trim() || "Sin definir",
      orden: maxOrden + 1,
      obligatorio: form.obligatorio,
      curso_id: form.cursoId || null,
    })

    if (!error) {
      setElementos((prev) => [
        ...prev,
        { id: newId, titulo: form.titulo.trim(), tipo: form.tipo, descripcion: form.descripcion.trim(), duracion: form.duracion.trim() || "Sin definir", orden: maxOrden + 1, obligatorio: form.obligatorio },
      ])
    }

    setForm(emptyForm)
    setShowAddForm(false)
    setSaving(false)
  }

  async function handleEditElemento() {
    if (!editingId || !form.titulo.trim()) return
    setSaving(true)

    const { error } = await supabase
      .from("cargo_elementos")
      .update({
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        descripcion: form.descripcion.trim(),
        duracion: form.duracion.trim() || "Sin definir",
        obligatorio: form.obligatorio,
        curso_id: form.cursoId || null,
      })
      .eq("id", editingId)

    if (!error) {
      setElementos((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, titulo: form.titulo.trim(), tipo: form.tipo, descripcion: form.descripcion.trim(), duracion: form.duracion.trim() || e.duracion, obligatorio: form.obligatorio }
            : e
        )
      )
    }

    setEditingId(null)
    setForm(emptyForm)
    setSaving(false)
  }

  async function handleDeleteElemento(elementoId: string) {
    setSaving(true)
    await supabase.from("cargo_elementos").delete().eq("id", elementoId)
    const filtered = elementos.filter((e) => e.id !== elementoId)
    const reordered = filtered.map((e, i) => ({ ...e, orden: i + 1 }))

    for (const e of reordered) {
      await supabase.from("cargo_elementos").update({ orden: e.orden }).eq("id", e.id)
    }

    setElementos(reordered)
    setSaving(false)
  }

  function startEdit(elem: ElementoRuta) {
    setEditingId(elem.id)
    setShowAddForm(false)
    setForm({ titulo: elem.titulo, tipo: elem.tipo, descripcion: elem.descripcion, duracion: elem.duracion, obligatorio: elem.obligatorio, cursoId: elem.cursoId || null })
  }

  function cancelForm() {
    setShowAddForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  if (!loading && !cargoName) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Ruta no encontrada</p>
        <Link href="/dashboard/rutas-aprendizaje" className="text-luxor-primary text-sm mt-2 inline-block">
          Volver a Rutas
        </Link>
      </div>
    )
  }

  const sorted = [...elementos].sort((a, b) => a.orden - b.orden)
  const elementosByType = {
    curso: sorted.filter((e) => e.tipo === "curso"),
    taller: sorted.filter((e) => e.tipo === "taller"),
    examen: sorted.filter((e) => e.tipo === "examen"),
  }

  const totalStudents = students.length
  const graduados = students.filter((s) => s.estado === "graduado").length
  const enCurso = students.filter((s) => s.estado === "en_curso").length
  const sinIniciar = students.filter((s) => s.estado === "sin_iniciar").length

  const filteredStudents = students.filter(
    (s) => s.nombre.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const estadoColors: Record<string, { bg: string; text: string; label: string }> = {
    graduado: { bg: "bg-blue-100", text: "text-blue-700", label: "Graduado" },
    en_curso: { bg: "bg-blue-100", text: "text-blue-700", label: "En Curso" },
    sin_iniciar: { bg: "bg-gray-100", text: "text-gray-500", label: "Sin Iniciar" },
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/rutas-aprendizaje"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Rutas
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{cargoName}</h1>
              <p className="text-sm text-gray-500 mt-1">{cargoDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStudents}</p>
                  <p className="text-xs text-gray-500">Estudiantes</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{graduados}</p>
                  <p className="text-xs text-gray-500">Graduados</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{enCurso}</p>
                  <p className="text-xs text-gray-500">En Curso</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-500">{sinIniciar}</p>
                  <p className="text-xs text-gray-500">Sin Iniciar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 sm:gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Ruta de Aprendizaje</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sorted.length} etapas en secuencia
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("sequential")}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === "sequential" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Secuencial</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grouped")}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === "grouped" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Agrupado</span>
                  </button>
                </div>
                {isDecano && (
                  <button
                    onClick={() => { setShowAddForm(true); setEditingId(null); setForm(emptyForm) }}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-luxor-primary text-white rounded-lg text-xs font-medium hover:bg-luxor-secondary transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                )}
              </div>
            </div>

            {(showAddForm || editingId) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {editingId ? "Editar Elemento" : "Nuevo Elemento"}
                  </h3>
                  <button onClick={cancelForm} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Tipo *</label>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoEtapa })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    >
                      <option value="curso">Curso</option>
                      <option value="taller">Taller Practico</option>
                      <option value="examen">Examen Escrito</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Duracion</label>
                    <input
                      type="text"
                      value={form.duracion}
                      onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                      placeholder="Ej: 2 semanas"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  <label className="block text-xs font-medium text-gray-600">
                    {form.tipo === "curso" ? "Seleccionar Curso *" : "Titulo *"}
                  </label>
                  {form.tipo === "curso" ? (
                    <select
                      value={form.titulo}
                      onChange={(e) => {
                        const curso = cursosDisponibles.find((c) => c.titulo === e.target.value)
                        setForm({
                          ...form,
                          titulo: curso?.titulo || "",
                          descripcion: curso?.descripcion || "",
                          duracion: curso?.duracion || "",
                          cursoId: curso?.id || null,
                        })
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    >
                      <option value="">Selecciona un curso...</option>
                      {cursosDisponibles.map((c) => (
                        <option key={c.id} value={c.titulo}>{c.titulo}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Nombre del elemento"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    />
                  )}
                </div>
                <div className="space-y-1.5 mt-3">
                  <label className="block text-xs font-medium text-gray-600">Descripcion</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 resize-none"
                    placeholder="Descripcion breve..."
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id="obligatorio"
                    checked={form.obligatorio}
                    onChange={(e) => setForm({ ...form, obligatorio: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-luxor-primary focus:ring-luxor-primary"
                  />
                  <label htmlFor="obligatorio" className="text-sm text-gray-700">
                    Obligatorio para esta ruta
                  </label>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={cancelForm}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingId ? handleEditElemento : handleAddElemento}
                    disabled={!form.titulo.trim() || saving}
                    className="flex-1 px-4 py-2 bg-luxor-primary text-white rounded-lg font-medium text-sm hover:bg-luxor-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Save className="w-3.5 h-3.5" />
                    {editingId ? "Guardar Cambios" : "Agregar Elemento"}
                  </button>
                </div>
              </div>
            )}

            {sorted.length === 0 && !showAddForm && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <Route className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sin elementos en la ruta</p>
                <p className="text-sm text-gray-400 mt-1">
                  {isDecano ? 'Haz clic en "Agregar" para crear el primer elemento' : "El Decano debe definir la ruta de aprendizaje"}
                </p>
              </div>
            )}

            {viewMode === "sequential" && sorted.length > 0 && (
              <div className="relative">
                {sorted.map((elemento, index) => {
                  const config = tipoEtapaConfig[elemento.tipo]
                  const Icon = iconMap[elemento.tipo]
                  const colors = stepColors[elemento.tipo]
                  const isLast = index === sorted.length - 1
                  const isExpanded = expandedStep === elemento.id
                  const isEditing = editingId === elemento.id

                  return (
                    <div key={elemento.id} className="relative flex gap-4 pb-2">
                      {!isLast && <div className={`absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-16px)] ${colors.line}`} />}

                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 ${colors.ring} shadow-sm`}>
                        <span className={`text-xs font-bold ${colors.text}`}>{elemento.orden}</span>
                      </div>

                      <div className="flex-1 min-w-0 pb-4">
                        <div className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
                          isEditing ? `${colors.bg} border-current/20 ring-2 ring-luxor-primary/20` : isExpanded ? `${colors.bg} border-current/20` : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <button onClick={() => setExpandedStep(isExpanded ? null : elemento.id)} className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                                  <Icon className="w-3 h-3" />
                                  {config.label}
                                </span>
                                {elemento.obligatorio && <span className="text-xs font-medium text-red-500">Obligatorio</span>}
                              </div>
                              <h4 className="font-medium text-gray-900 mt-1.5 text-sm sm:text-base">{elemento.titulo}</h4>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">{elemento.descripcion}</p>
                            </button>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {isDecano && (
                                <>
                                  <button onClick={() => startEdit(elemento)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteElemento(elemento.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => setExpandedStep(isExpanded ? null : elemento.id)} className="p-1.5 text-gray-400">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={`mt-2 p-3 sm:p-4 rounded-xl ${colors.bg} border border-current/10`}>
                            <p className="text-sm text-gray-700">{elemento.descripcion || "Sin descripcion"}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                              <span>Etapa {elemento.orden} de {sorted.length}</span>
                              <span>Duracion: {elemento.duracion}</span>
                              <span className={`font-medium ${colors.text}`}>{config.label}</span>
                            </div>
                            {elemento.tipo === "taller" && !isDecano && (
                              <Link
                                href={`/dashboard/rutas-aprendizaje/taller/${elemento.id}`}
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm hover:bg-violet-700 transition-colors"
                              >
                                <Users className="w-4 h-4" />
                                Evaluar Estudiantes
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {viewMode === "grouped" && sorted.length > 0 && (
              <div className="space-y-6">
                {(["curso", "taller", "examen"] as TipoEtapa[]).map((tipo) => {
                  const items = elementosByType[tipo]
                  const config = tipoEtapaConfig[tipo]
                  const Icon = iconMap[tipo]
                  const colors = stepColors[tipo]

                  if (items.length === 0) return null

                  return (
                    <div key={tipo}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{config.label}s</h3>
                        <span className="text-sm text-gray-400">({items.length})</span>
                      </div>
                          <div className="space-y-2 ml-4">
                        {items.map((elem) => (
                          <div key={elem.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border ${colors.bg} border-current/10`}>
                            <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block" />
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text} border ${colors.ring} flex-shrink-0`}>{elem.orden}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{elem.titulo}</p>
                              <p className="text-xs text-gray-500 truncate">{elem.descripcion}</p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">{elem.duracion}</span>
                            {elem.obligatorio && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium flex-shrink-0 hidden sm:inline">Obligatorio</span>}
                            {elem.tipo === "taller" && !isDecano && (
                              <Link
                                href={`/dashboard/rutas-aprendizaje/taller/${elem.id}`}
                                className="px-2 py-1 bg-violet-600 text-white text-xs rounded-lg font-medium hover:bg-violet-700 transition-colors flex-shrink-0 hidden sm:inline-flex items-center gap-1"
                              >
                                <Users className="w-3 h-3" />
                                Evaluar
                              </Link>
                            )}
                            {isDecano && (
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button onClick={() => startEdit(elem)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteElemento(elem.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit lg:sticky lg:top-24 order-first lg:order-last">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Estudiantes</h3>
            <span className="text-xs text-gray-400">{totalStudents} total</span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar estudiante..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {Object.entries(estadoColors).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${val.bg}`} />
                {val.label}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {totalStudents === 0 ? "No hay estudiantes asignados a este cargo" : "No se encontraron estudiantes"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Asigna un cargo a los estudiantes desde Gestion de Usuarios</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => {
                const estado = estadoColors[student.estado]
                return (
                  <div key={student.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{student.nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{student.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${estado.bg} ${estado.text}`}>{estado.label}</span>
                    </div>
                    {student.estado !== "sin_iniciar" && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progreso</span>
                          <span>{student.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${student.estado === "graduado" ? "bg-blue-500" : "bg-blue-500"}`} style={{ width: `${student.progreso}%` }} />
                        </div>
                      </div>
                    )}
                    {student.certificado && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Certificado obtenido
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CargoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador", "estudiante"]}>
      <CargoContent id={id} />
    </ProtectedRoute>
  )
}
