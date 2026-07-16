"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { RutaAprendizaje } from "@/types/ruta-aprendizaje"
import {
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
  Wrench,
  FileText,
  Search,
  X,
  Loader2,
  Edit3,
  Route,
  GraduationCap,
  Lock,
  Sparkles,
  Construction,
  ChevronDown,
  Users,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

interface CargoData {
  id: string
  nombre: string
  descripcion: string
  nivel: string
  created_at: string
}

interface EstudianteCargoInfo {
  cargoNombre: string
  cargoId: string | null
  tieneCargo: boolean
}

function RutasContent() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const isDecano = user?.rol === "decano"
  const isFacilitador = user?.rol === "facilitador"
  const isEstudiante = user?.rol === "estudiante"

  const [cargos, setCargos] = useState<CargoData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCargo, setNewCargo] = useState({ nombre: "", descripcion: "", nivel: "operadores" })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", nivel: "operadores" })

  const [pestaña, setPestaña] = useState<"obligatoria" | "selectiva">("obligatoria")
  const [studentCargo, setStudentCargo] = useState<EstudianteCargoInfo | null>(null)
  const [cursosEnRuta, setCursosEnRuta] = useState<{ id: string; titulo: string; duracion: string; estado: string; orden: number }[]>([])

  useEffect(() => {
    if (isEstudiante) {
      fetchStudentData()
    } else {
      fetchCargos()
    }
  }, [user])

  async function fetchStudentData() {
    if (!user) return
    setLoading(true)

    const { data: profile } = await supabase
      .from("profiles")
      .select("cargo")
      .eq("id", user.id)
      .single()

    const cargoNombre = profile?.cargo || ""
    let cargoId: string | null = null

    if (cargoNombre) {
      const { data: cargoMatch } = await supabase
        .from("cargos")
        .select("id")
        .ilike("nombre", cargoNombre)
        .limit(1)
        .single()

      cargoId = cargoMatch?.id || null

      if (cargoId) {
        const { data: elementos } = await supabase
          .from("cargo_elementos")
          .select("id, nombre, tipo, duracion, orden")
          .eq("cargo_id", cargoId)
          .order("orden")

        if (elementos) {
          const cursoIds = elementos.filter((e) => e.tipo === "curso").map((e) => e.id)

          let cursosData: { id: string; titulo: string; duracion: string; estado: string; orden: number }[] = []

          if (cursoIds.length > 0) {
            const { data: cursos } = await supabase
              .from("cursos")
              .select("id, titulo, duracion, estado")
              .in("id", cursoIds)

            if (cursos) {
              cursosData = cursos.map((c) => {
                const elem = elementos.find((e) => e.id === c.id)
                return {
                  id: c.id,
                  titulo: c.titulo,
                  duracion: c.duracion || "Sin definir",
                  estado: c.estado,
                  orden: elem?.orden || 0,
                }
              }).sort((a, b) => a.orden - b.orden)
            }
          }

          setCursosEnRuta(cursosData)
        }
      }
    }

    setStudentCargo({ cargoNombre, cargoId, tieneCargo: !!cargoNombre })
    setLoading(false)
  }

  async function fetchCargos() {
    setLoading(true)
    const { data } = await supabase
      .from("cargos")
      .select("*")
      .order("created_at", { ascending: true })

    setCargos(data || [])
    setLoading(false)
  }

  const filtered = cargos.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDeleteCargo(cargo: CargoData, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await supabase.from("cargos").delete().eq("id", cargo.id)
    fetchCargos()
  }

  function startEdit(cargo: CargoData, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(cargo.id)
    setEditForm({ nombre: cargo.nombre, descripcion: cargo.descripcion, nivel: cargo.nivel || "operadores" })
  }

  async function handleSaveEdit() {
    if (!editingId || !editForm.nombre.trim()) return
    setSaving(true)
    await supabase
      .from("cargos")
      .update({ nombre: editForm.nombre.trim(), descripcion: editForm.descripcion.trim(), nivel: editForm.nivel })
      .eq("id", editingId)
    setEditingId(null)
    setSaving(false)
    fetchCargos()
  }

  async function handleCreateCustomCargo() {
    if (!newCargo.nombre.trim()) return
    setSaving(true)
    const id = `custom_${Date.now()}`
    await supabase.from("cargos").insert({
      id,
      nombre: newCargo.nombre.trim(),
      descripcion: newCargo.descripcion.trim() || "Cargo personalizado",
      nivel: newCargo.nivel,
    })
    setNewCargo({ nombre: "", descripcion: "", nivel: "operadores" })
    setShowCreateForm(false)
    setSaving(false)
    fetchCargos()
  }

  if (isEstudiante) {
    return (
      <div className="space-y-6">
        {/* Pestañas */}
        <div className="flex p-1 bg-gray-100 rounded-xl max-w-md">
          <button
            onClick={() => setPestaña("obligatoria")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              pestaña === "obligatoria"
                ? "bg-white text-luxor-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            Capacitación Obligatoria
          </button>
          <button
            onClick={() => setPestaña("selectiva")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              pestaña === "selectiva"
                ? "bg-white text-luxor-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Formación Selectiva
          </button>
        </div>

        {/* Capacitación Obligatoria */}
        {pestaña === "obligatoria" && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
            </div>
          ) : !studentCargo?.tieneCargo ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Construction className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Estamos construyendo algo especial para ti
              </h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Muy pronto tendrás noticias. Estamos diseñando una ruta de capacitación
                obligatoria personalizada para tu cargo.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span>Próximamente</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info del cargo */}
              <div className="bg-gradient-to-r from-luxor-primary to-luxor-secondary rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <GraduationCap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{studentCargo.cargoNombre}</h2>
                    <p className="text-sm text-white/70">Tu ruta de capacitación obligatoria</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {cursosEnRuta.length} cursos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {cursosEnRuta.reduce((sum, c) => {
                      const min = parseInt(c.duracion) || 0
                      return sum + min
                    }, 0)} min total
                  </span>
                </div>
              </div>

              {/* Lista de cursos */}
              {cursosEnRuta.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aún no hay cursos asignados a tu cargo</p>
                  <p className="text-sm text-gray-400 mt-1">Pronto se agregarán cursos a tu ruta de formación</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursosEnRuta.map((curso, index) => (
                    <Link
                      key={curso.id}
                      href={`/dashboard/cursos/${curso.id}`}
                      className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-luxor-primary/40 hover:shadow-md transition-all group"
                    >
                      <span className="w-10 h-10 bg-luxor-primary/10 rounded-xl flex items-center justify-center text-luxor-primary font-bold text-sm shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-luxor-primary transition-colors truncate">
                          {curso.titulo}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {curso.duracion}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            curso.estado === "aprobado" ? "bg-green-100 text-green-700" :
                            curso.estado === "pendiente" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {curso.estado}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-luxor-primary transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Formación Selectiva */}
        {pestaña === "selectiva" && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Formación Selectiva
            </h2>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Aquí encontrarás rutas de formación voluntaria para complementar tu desarrollo
              profesional. Próximamente podrás explorar cursos adicionales.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              <span>Próximamente</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista admin (decano/facilitador)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-luxor-primary">{cargos.length}</p>
          <p className="text-xs text-gray-500">Cargos definidos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {cargos.reduce((sum, c) => {
              const elemCount = 0
              return sum + elemCount
            }, 0)}
          </p>
          <p className="text-xs text-gray-500">Cursos asignados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-violet-600">
            {cargos.filter((c) => c.nivel === "gerentes" || c.nivel === "coordinadores").length}
          </p>
          <p className="text-xs text-gray-500">Nivel gerencial</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-amber-600">
            {cargos.filter((c) => c.nivel === "operadores" || c.nivel === "administrativos").length}
          </p>
          <p className="text-xs text-gray-500">Nivel operativo</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cargo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
          />
        </div>
        {isDecano && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors text-sm flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            Crear Cargo
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl border border-luxor-primary/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Nuevo Cargo</h3>
            <button
              onClick={() => { setShowCreateForm(false); setNewCargo({ nombre: "", descripcion: "", nivel: "operadores" }) }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nombre del cargo *</label>
              <input
                type="text"
                value={newCargo.nombre}
                onChange={(e) => setNewCargo({ ...newCargo, nombre: e.target.value })}
                placeholder="Ej: Auxiliar de Almacen"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nivel *</label>
              <select
                value={newCargo.nivel}
                onChange={(e) => setNewCargo({ ...newCargo, nivel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
              >
                <option value="gerentes">Gerentes</option>
                <option value="coordinadores">Coordinadores</option>
                <option value="administrativos">Administrativos</option>
                <option value="operadores">Operadores</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-medium text-gray-700">Descripcion</label>
            <input
              type="text"
              value={newCargo.descripcion}
              onChange={(e) => setNewCargo({ ...newCargo, descripcion: e.target.value })}
              placeholder="Funciones principales del cargo"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setShowCreateForm(false); setNewCargo({ nombre: "", descripcion: "", nivel: "operadores" }) }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCustomCargo}
              disabled={!newCargo.nombre.trim() || saving}
              className="px-4 py-2 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Crear Cargo
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
        </div>
      ) : cargos.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay cargos creados</p>
          <p className="text-sm text-gray-400 mt-1">Crea el primer cargo para definir su ruta de aprendizaje</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cargo) => {
            const isEditing = editingId === cargo.id

            return (
              <Link
                key={cargo.id}
                href={`/dashboard/rutas-aprendizaje/${cargo.id}`}
                prefetch={true}
                className={`group bg-white rounded-xl border p-5 transition-all ${
                  isEditing ? "border-luxor-primary/40 shadow-md" : "border-gray-200 hover:border-luxor-primary/40 hover:shadow-md"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3" onClick={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    />
                    <select
                      value={editForm.nivel}
                      onChange={(e) => setEditForm({ ...editForm, nivel: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                    >
                      <option value="gerentes">Gerentes</option>
                      <option value="coordinadores">Coordinadores</option>
                      <option value="administrativos">Administrativos</option>
                      <option value="operadores">Operadores</option>
                    </select>
                    <input
                      type="text"
                      value={editForm.descripcion}
                      onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                      placeholder="Descripcion"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex-1 px-3 py-1.5 bg-luxor-primary text-white rounded-lg text-xs font-medium hover:bg-luxor-secondary disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-luxor-primary transition-colors">
                          {cargo.nombre}
                        </h3>
                        <p className="text-xs text-luxor-primary font-medium mt-0.5 capitalize">
                          {cargo.nivel || "operadores"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cargo.descripcion}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isDecano && (
                          <>
                            <button
                              onClick={(e) => startEdit(cargo, e)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Editar cargo"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCargo(cargo, e)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar cargo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-luxor-primary transition-colors" />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center">Haz clic para ver y gestionar</p>
                    </div>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RutasAprendizajePage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "facilitador", "estudiante"]}>
      <RutasContent />
    </ProtectedRoute>
  )
}
