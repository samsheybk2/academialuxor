"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { formatDuration } from "@/lib/duration"
import { Card, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Users,
  Clock,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Curso {
  id: string
  titulo: string
  nivel: string[] | string
  tipo: string
  facilitador_nombre: string
  facilitador_id: string
  facilitador_avatar?: string
  descripcion: string
  introduccion?: string
  modulos_count: number
  estudiantes_count: number
  activo: boolean
  duracion: string
  estado: "borrador" | "pendiente" | "aprobado" | "rechazado"
  observaciones?: string
  imagen_portada?: string
}

const nivelColors: Record<string, string> = {
  gerentes: "bg-blue-100 text-blue-700",
  coordinadores: "bg-blue-100 text-blue-700",
  administrativos: "bg-violet-100 text-violet-700",
  operativos: "bg-green-100 text-green-700",
  supervisores: "bg-amber-100 text-amber-700",
}

const hoverColors = [
  "hover:!bg-blue-100",
  "hover:!bg-green-100",
  "hover:!bg-yellow-100",
  "hover:!bg-purple-100",
  "hover:!bg-pink-100",
  "hover:!bg-indigo-100",
  "hover:!bg-teal-100",
  "hover:!bg-orange-100",
]

function getHoverColor(index: number): string {
  return hoverColors[index % hoverColors.length]
}

const estadoConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aprobado: { label: "Aprobado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700", icon: XCircle },
  borrador: { label: "Borrador", color: "bg-gray-100 text-gray-500", icon: Edit3 },
}

function CursosContent() {
  const { user } = useAuth()
  const isDecano = user?.rol === "decano" || user?.rol === "developer"
  const isFacilitador = user?.rol === "facilitador"
  const supabase = createSupabaseClient()

  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterNivel, setFilterNivel] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showAprobarModal, setShowAprobarModal] = useState(false)
  const [cursoToAprobar, setCursoToAprobar] = useState<Curso | null>(null)

  async function fetchCursos() {
    setLoading(true)
    const { data } = await supabase
      .from("cursos")
      .select("*, profiles!facilitador_id(avatar_url)")
      .order("created_at", { ascending: false })
    if (data) {
      setCursos(data.map((c: any) => ({ ...c, facilitador_avatar: c.profiles?.avatar_url })) as Curso[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCursos()
  }, [])

  const filtered = cursos.filter((c) => {
    if (c.estado !== "aprobado" && c.facilitador_id !== user?.id && !isDecano) return false
    const matchSearch =
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      c.facilitador_nombre.toLowerCase().includes(search.toLowerCase())
    const niveles = Array.isArray(c.nivel) ? c.nivel : [c.nivel]
    const matchNivel = filterNivel === "todos" || niveles.includes(filterNivel)
    const matchEstado = filterEstado === "todos" || c.estado === filterEstado
    return matchSearch && matchNivel && matchEstado
  })

  async function handleEnviarRevision(id: string) {
    await supabase.from("cursos").update({ estado: "pendiente" }).eq("id", id)
    fetchCursos()
  }

  async function handleAprobar() {
    if (!cursoToAprobar) return
    await supabase
      .from("cursos")
      .update({ estado: "aprobado", activo: true })
      .eq("id", cursoToAprobar.id)
    setShowAprobarModal(false)
    setCursoToAprobar(null)
    fetchCursos()
  }

  async function handleRechazar() {
    if (!cursoToAprobar) return
    await supabase
      .from("cursos")
      .update({ estado: "rechazado" })
      .eq("id", cursoToAprobar.id)
    setShowAprobarModal(false)
    setCursoToAprobar(null)
    fetchCursos()
  }

  const pendientesCount = cursos.filter((c) => c.estado === "pendiente").length

  return (
    <div className="space-y-6">
      {isDecano && pendientesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">
                {pendientesCount} curso{pendientesCount > 1 ? "s" : ""} esperando aprobación
              </p>
              <p className="text-sm text-amber-600">
                Revisa y aprueba los cursos enviados por los facilitadores
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso o facilitador..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-400" />
              {(filterNivel !== "todos" || filterEstado !== "todos") && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-luxor-primary rounded-full" />
              )}
            </button>
          {showFilterDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Nivel</label>
                  <select
                    value={filterNivel}
                    onChange={(e) => setFilterNivel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                  >
                    <option value="todos">Todos los niveles</option>
                    <option value="gerentes">Gerentes</option>
                    <option value="coordinadores">Coordinadores</option>
                    <option value="administrativos">Administrativos</option>
                    <option value="operadores">Operadores</option>
                  </select>
                </div>
                <div className="p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="aprobado">Aprobados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="rechazado">Rechazados</option>
                    <option value="borrador">Borradores</option>
                  </select>
                </div>
                {(filterNivel !== "todos" || filterEstado !== "todos") && (
                  <button
                    onClick={() => { setFilterNivel("todos"); setFilterEstado("todos"); setShowFilterDropdown(false) }}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {(isFacilitador || isDecano) && (
          <Link href="/dashboard/cursos/nuevo">
            <Button>
              <Plus className="w-4 h-4" />
              Nuevo Curso
            </Button>
          </Link>
        )}
      </div>
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    ) : (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((curso, index) => {
            const estadoInfo = estadoConfig[curso.estado]
            const EstadoIcon = estadoInfo.icon

            return (
              <div key={curso.id} className="relative">
                <Link
                  href={`/dashboard/cursos/${curso.id}`}
                  className="block"
                >
                    <Card className={`!bg-transparent !rounded-none ${getHoverColor(index)} transition-colors cursor-pointer overflow-hidden !border-transparent !shadow-none`}>
                    <CardContent className="p-0">
                      {curso.imagen_portada && (
                        <div className="w-full overflow-hidden bg-gray-100 relative">
                          <img
                            src={curso.imagen_portada}
                            alt={`Portada de ${curso.titulo}`}
                            className="w-full h-auto object-cover max-h-48"
                          />
                          {curso.estado === "aprobado" && (
                            <div className="absolute top-0 right-0 w-11 h-11 bg-green-500 z-10" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} title="Aprobado" />
                          )}
                          {curso.estado === "rechazado" && (
                            <div className="absolute top-0 right-0 w-11 h-11 bg-red-500 z-10" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} title="Rechazado" />
                          )}
                          {curso.estado === "pendiente" && (
                            <div className="absolute top-0 right-0 w-11 h-11 bg-yellow-500 z-10" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} title="Pendiente" />
                          )}
                          {curso.estado === "borrador" && (
                            <div className="absolute top-0 right-0 w-11 h-11 bg-blue-500 z-10" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} title="Borrador" />
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-luxor-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {curso.facilitador_avatar ? (
                              <img src={curso.facilitador_avatar} alt={curso.facilitador_nombre} className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap className="w-4 h-4 text-luxor-primary" />
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate text-sm">
                            {curso.titulo}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(curso.duracion)}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {curso.modulos_count} modulos
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {curso.estudiantes_count}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1 ${estadoInfo.color}`}
                          >
                            <EstadoIcon className="w-2.5 h-2.5" />
                            {estadoInfo.label}
                          </span>
                          {(Array.isArray(curso.nivel) ? curso.nivel : [curso.nivel]).map((n) => (
                            <span
                              key={n}
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                                nivelColors[n] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {(isDecano || isFacilitador) && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                    {isDecano && curso.estado === "pendiente" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCursoToAprobar(curso)
                            setShowAprobarModal(true)
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCursoToAprobar(curso)
                            setShowAprobarModal(true)
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Rechazar"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {isFacilitador && curso.estado === "borrador" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEnviarRevision(curso.id)
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Enviar a revisión"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    )}

    {!loading && filtered.length === 0 && (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No se encontraron cursos</p>
      </div>
    )}

    {/* Modal Aprobar/Rechazar */}
      <Modal
        show={showAprobarModal}
        onClose={() => setShowAprobarModal(false)}
        title="Revisar Curso"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{cursoToAprobar?.titulo}</p>
            <p className="text-sm text-gray-500 mt-1">{cursoToAprobar?.facilitador_nombre}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAprobarModal(false)} className="flex-1">
              Cancelar
            </Button>
            <button
              onClick={handleRechazar}
              className="flex-1 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </button>
            <Button onClick={handleAprobar} className="flex-1">
              <CheckCircle2 className="w-4 h-4" />
              Aprobar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function CursosPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador"]}>
      <CursosContent />
    </ProtectedRoute>
  )
}
