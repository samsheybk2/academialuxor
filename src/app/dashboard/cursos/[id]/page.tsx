"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { formatDuration } from "@/lib/duration"
import { OpinionesCurso } from "@/components/course/OpinionesCurso"
import {
  BookOpen,
  Clock,
  GraduationCap,
  Users,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Edit3,
  Trash2,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Loader2,
  Award,
  Info,
  ListChecks,
  MessageSquare,
  Globe,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Modulo {
  id: string
  titulo: string
  introduccion?: string
  video_url?: string
  imagen_portada?: string
  duracion: string
  orden: number
  preguntas: Pregunta[]
}

interface Pregunta {
  id: string
  pregunta: string
  opciones: string[]
  respuesta_correcta: number
  orden: number
}

interface Curso {
  id: string
  titulo: string
  nivel: string[] | string
  tipo: string
  facilitador_nombre: string
  facilitador_id: string
  descripcion: string
  introduccion?: string
  video_bienvenida?: string
  imagen_portada?: string
  modulos_count: number
  estudiantes_count: number
  activo: boolean
  duracion: string
  estado: "borrador" | "pendiente" | "aprobado" | "rechazado"
  observaciones?: string
  created_at: string
}

type Pestaña = "informacion" | "contenido" | "opiniones"

const nivelColors: Record<string, string> = {
  gerentes: "bg-blue-100 text-blue-700",
  coordinadores: "bg-luxor-primary/10 text-luxor-primary",
  administrativos: "bg-violet-100 text-violet-700",
  operadores: "bg-amber-100 text-amber-700",
}

const nivelLabel: Record<string, string> = {
  gerentes: "Gerentes",
  coordinadores: "Coordinadores",
  administrativos: "Administrativos",
  operadores: "Operadores",
}

const estadoConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aprobado: { label: "Aprobado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700", icon: XCircle },
  borrador: { label: "Borrador", color: "bg-gray-100 text-gray-500", icon: Edit3 },
}

function Pestañas({ activa, onChange }: { activa: Pestaña; onChange: (p: Pestaña) => void }) {
  const tabs: { id: Pestaña; label: string; icon: React.ElementType }[] = [
    { id: "informacion", label: "Informacion", icon: Info },
    { id: "contenido", label: "Contenido", icon: ListChecks },
    { id: "opiniones", label: "Opiniones", icon: MessageSquare },
  ]

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activa === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                active ? "text-luxor-primary" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxor-primary rounded-full" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TabInformacion({ curso, modulos }: { curso: Curso; modulos: Modulo[] }) {
  const niveles = Array.isArray(curso.nivel) ? curso.nivel : [curso.nivel]

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {curso.imagen_portada ? (
            <img
              src={curso.imagen_portada}
              alt={`Portada de ${curso.titulo}`}
              className="w-full h-auto object-cover"
            />
          ) : curso.video_bienvenida ? (
            <div className="aspect-video">
              <iframe
                src={curso.video_bienvenida}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-3">Descripcion del curso</h3>
          <p className="text-gray-600 leading-relaxed flex-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: curso.descripcion || curso.introduccion || "Este curso aun no tiene descripcion." }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-luxor-primary" />
            <span className="text-sm text-gray-500">Facilitador</span>
            <span className="text-sm font-medium text-gray-900">{curso.facilitador_nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-500">Nivel</span>
            <div className="flex gap-1">
              {niveles.map((n) => (
                <span key={n} className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${nivelColors[n] || "bg-gray-100 text-gray-700"}`}>
                  {nivelLabel[n] || n}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {curso.tipo === "asincronico" ? (
              <Globe className="w-4 h-4 text-emerald-600" />
            ) : (
              <Zap className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-sm text-gray-500">Tipo</span>
            <span className="text-sm font-medium text-gray-900">
              {curso.tipo === "asincronico" ? "Asincronico" : curso.tipo === "sincronico" ? "Sincronico" : curso.tipo || "Sin definir"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-500">Modulos</span>
            <span className="text-sm font-semibold text-gray-900">{modulos.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-gray-500">Duracion</span>
            <span className="text-sm font-medium text-gray-900">{curso.duracion}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabContenido({
  modulos,
  modulosExpandidos,
  toggleModulo,
  isEstudiante,
}: {
  modulos: Modulo[]
  modulosExpandidos: string[]
  toggleModulo: (id: string) => void
  isEstudiante: boolean
}) {
  if (modulos.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay modulos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {modulos.map((modulo) => {
        const expandido = modulosExpandidos.includes(modulo.id)
        return (
          <div key={modulo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleModulo(modulo.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-luxor-primary/10 rounded-lg flex items-center justify-center text-luxor-primary font-bold text-sm">
                  {modulo.orden}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{modulo.titulo || `Modulo ${modulo.orden}`}</p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(modulo.duracion)} · {modulo.preguntas.length} pregunta{modulo.preguntas.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {expandido ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandido && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-4">
                  {modulo.imagen_portada ? (
                    <img
                      src={modulo.imagen_portada}
                      alt={`Portada de ${modulo.titulo}`}
                      className="w-full h-auto object-cover rounded-lg aspect-video"
                    />
                  ) : modulo.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={modulo.video_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    {modulo.introduccion && (
                      <div className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: modulo.introduccion }} />
                    )}
                  </div>
                </div>

                {modulo.preguntas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Preguntas</p>
                    <div className="space-y-2">
                      {modulo.preguntas.map((preg, idx) => (
                        <div key={preg.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 mb-1.5">
                            {idx + 1}. {preg.pregunta}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {preg.opciones.map((op, opIdx) => (
                              <div
                                key={opIdx}
                                className={`text-xs px-2.5 py-1.5 rounded-md ${
                                  opIdx === preg.respuesta_correcta
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "bg-white text-gray-600 border border-gray-200"
                                }`}
                              >
                                {opIdx === preg.respuesta_correcta && "✓ "}{op}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CursoDetalleContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const isDecano = user?.rol === "decano" || user?.rol === "developer"
  const isFacilitador = user?.rol === "facilitador"
  const isEstudiante = user?.rol === "estudiante"
  const supabase = createSupabaseClient()

  const [curso, setCurso] = useState<Curso | null>(null)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(true)
  const [showAprobarModal, setShowAprobarModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pestaña, setPestaña] = useState<Pestaña>("informacion")
  const [inscrito, setInscrito] = useState(false)
  const [modulosExpandidos, setModulosExpandidos] = useState<string[]>([])

  async function fetchCurso() {
    setLoading(true)
    const { data: cursoData } = await supabase
      .from("cursos")
      .select("*")
      .eq("id", id)
      .single()

    if (cursoData) {
      setCurso(cursoData as Curso)

      const { data: modulosData } = await supabase
        .from("modulos")
        .select("*")
        .eq("curso_id", id)
        .order("orden")

      if (modulosData) {
        const modulosConPreguntas = await Promise.all(
          modulosData.map(async (mod: { id: string; [key: string]: any }) => {
            const { data: preguntasData } = await supabase
              .from("preguntas")
              .select("*")
              .eq("modulo_id", mod.id)
              .order("orden")
            return { ...mod, preguntas: preguntasData || [] }
          })
        )
        setModulos(modulosConPreguntas as Modulo[])
      }

      if (isEstudiante && user) {
        const { data: inscripcion } = await supabase
          .from("inscripciones")
          .select("id")
          .eq("user_id", user.id)
          .eq("curso_id", id)
          .maybeSingle()
        setInscrito(!!inscripcion)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCurso()
  }, [id])

  async function handleEnviarRevision() {
    if (!curso) return
    await supabase.from("cursos").update({ estado: "pendiente" }).eq("id", curso.id)
    fetchCurso()
  }

  async function handleAprobar() {
    if (!curso) return
    await supabase.from("cursos").update({ estado: "aprobado", activo: true }).eq("id", curso.id)
    setShowAprobarModal(false)
    fetchCurso()
  }

  async function handleRechazar() {
    if (!curso) return
    await supabase.from("cursos").update({ estado: "rechazado" }).eq("id", curso.id)
    setShowAprobarModal(false)
    fetchCurso()
  }

  async function handleDelete() {
    if (!curso) return
    await supabase.from("cursos").delete().eq("id", curso.id)
    router.push("/dashboard/cursos")
  }

  function toggleModulo(moduloId: string) {
    setModulosExpandidos((prev) =>
      prev.includes(moduloId) ? prev.filter((mid) => mid !== moduloId) : [...prev, moduloId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Curso no encontrado</p>
        <Link href="/dashboard/cursos" className="text-luxor-primary hover:underline mt-2 inline-block">
          Volver al catalogo
        </Link>
      </div>
    )
  }

  const estadoInfo = estadoConfig[curso.estado]
  const EstadoIcon = estadoInfo.icon

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{curso.titulo}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${estadoInfo.color}`}>
                <EstadoIcon className="w-3 h-3" />
                {estadoInfo.label}
              </span>
            </div>
            <p className="text-gray-500">{curso.facilitador_nombre} &bull; {curso.duracion}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {isFacilitador && curso.estado === "borrador" && (
              <button
                onClick={handleEnviarRevision}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Enviar a Revision
              </button>
            )}
            {isDecano && curso.estado === "pendiente" && (
              <>
                <button
                  onClick={() => setShowAprobarModal(true)}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={() => setShowAprobarModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar
                </button>
              </>
            )}
            {isDecano && (
              <Link
                href={`/dashboard/cursos/${curso.id}/certificado`}
                target="_blank"
                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-2 text-sm"
              >
                <Award className="w-4 h-4" />
                Simular Certificado
              </Link>
            )}
            {(isFacilitador || isDecano) && (
              <Link
                href={`/dashboard/cursos/${curso.id}/editar`}
                className="px-4 py-2 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-primary/90 transition-colors flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Link>
            )}
            {(isFacilitador || isDecano) && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Pestañas activa={pestaña} onChange={setPestaña} />

      {pestaña === "informacion" && <TabInformacion curso={curso} modulos={modulos} />}

      {pestaña === "contenido" && (
        <TabContenido
          modulos={modulos}
          modulosExpandidos={modulosExpandidos}
          toggleModulo={toggleModulo}
          isEstudiante={isEstudiante}
        />
      )}

      {pestaña === "opiniones" && <OpinionesCurso cursoId={curso.id} inscrito={inscrito} />}

      {showAprobarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-gray-900">Revisar Curso</h3>
            <p className="text-sm text-gray-600">{curso.titulo}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAprobarModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="flex-1 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
              <button
                onClick={handleAprobar}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-gray-900">Eliminar Curso</h3>
            <p className="text-sm text-gray-600">
              Estas seguro de eliminar <strong>{curso.titulo}</strong>? Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CursoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador", "estudiante"]}>
      <CursoDetalleContent params={params} />
    </ProtectedRoute>
  )
}
