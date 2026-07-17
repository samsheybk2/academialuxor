"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { Quiz } from "@/components/course/Quiz"
import { Certificado } from "@/components/course/Certificado"
import { OpinionesCurso } from "@/components/course/OpinionesCurso"
import { createSupabaseClient } from "@/lib/supabase"
import type { Pregunta } from "@/lib/cursos-detalle"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Lock,
  BookOpen,
  Eye,
  Loader2,
  UserPlus,
  GraduationCap,
  Users,
  Info,
  ListChecks,
  MessageSquare,
  Globe,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface ModuloData {
  id: string
  titulo: string
  descripcion: string
  video_url: string
  duracion: string
  orden: number
  preguntas: Pregunta[]
}

interface MaterialPDF {
  id: string
  curso_id: string
  modulo_id?: string | null
  nombre: string
  url: string
  tipo: string
  orden: number
}

interface CursoData {
  id: string
  titulo: string
  nivel: string[] | string
  tipo?: string
  facilitador_nombre: string
  descripcion: string
  duracion: string
  modulos_count: number
  video_bienvenida?: string
  introduccion?: string
}

type Pestaña = "informacion" | "contenido" | "opiniones"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return ""
  if (url.includes("/embed/")) return url
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  return url
}

function getYouTubeVideoId(url: string): string {
  if (!url) return ""
  if (url.includes("/embed/")) {
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]
  }
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (match) return match[1]
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  return ""
}

function YouTubePlayer({
  videoId,
  className,
  onEnd,
  noSkip = false,
}: {
  videoId: string
  className?: string
  onEnd?: () => void
  noSkip?: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const lastTimeRef = useRef(0)
  const watchedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endedRef = useRef(false)

  useEffect(() => {
    if (!videoId || !wrapperRef.current) return

    const wrapper = wrapperRef.current
    wrapper.innerHTML = ""
    const playerDiv = document.createElement("div")
    playerDiv.style.width = "100%"
    playerDiv.style.height = "100%"
    wrapper.appendChild(playerDiv)

    endedRef.current = false
    lastTimeRef.current = 0
    watchedRef.current = 0

    function initPlayer() {
      playerRef.current = new window.YT.Player(playerDiv, {
        videoId,
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          disablekb: noSkip ? 1 : 0,
          fs: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (noSkip && playerRef.current) {
              lastTimeRef.current = 0
              watchedRef.current = 0
              intervalRef.current = setInterval(() => {
                const p = playerRef.current
                if (!p || typeof p.getCurrentTime !== "function") return
                try {
                  const ct = p.getCurrentTime()
                  const ps = p.getPlayerState?.()
                  if (ps === 1) {
                    if (ct >= lastTimeRef.current && ct < lastTimeRef.current + 3) {
                      watchedRef.current += 0.5
                    }
                    if (ct > lastTimeRef.current + 2) {
                      p.seekTo(lastTimeRef.current + 0.1, true)
                    } else {
                      lastTimeRef.current = ct
                    }
                  }
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_e) {}
              }, 500)
            }
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              if (endedRef.current) return
              if (noSkip) {
                const duration = playerRef.current?.getDuration?.() || 0
                if (duration > 0 && watchedRef.current < duration * 0.9) {
                  playerRef.current?.seekTo?.(0, true)
                  playerRef.current?.playVideo?.()
                  lastTimeRef.current = 0
                  watchedRef.current = 0
                  return
                }
              }
              endedRef.current = true
              onEnd?.()
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = () => initPlayer()
      const timer = setTimeout(() => initPlayer(), 2000)
      return () => {
        clearTimeout(timer)
        if (intervalRef.current) clearInterval(intervalRef.current)
        playerRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      playerRef.current = null
      if (wrapperRef.current) wrapperRef.current.innerHTML = ""
    }
  }, [videoId, noSkip])

  return <div ref={wrapperRef} className={className} />
}

function Pestañas({
  activa,
  onChange,
}: {
  activa: Pestaña
  onChange: (p: Pestaña) => void
}) {
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
                active
                  ? "text-luxor-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxor-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TabInformacion({
  curso,
  modulos,
}: {
  curso: CursoData
  modulos: ModuloData[]
}) {
  const niveles = Array.isArray(curso.nivel)
    ? curso.nivel
    : [curso.nivel]

  const nivelLabel: Record<string, string> = {
    gerentes: "Gerentes",
    coordinadores: "Coordinadores",
    administrativos: "Administrativos",
    operadores: "Operadores",
  }

  const nivelIcon: Record<string, string> = {
    gerentes: "bg-blue-100 text-blue-700",
    coordinadores: "bg-indigo-100 text-indigo-700",
    administrativos: "bg-violet-100 text-violet-700",
    operadores: "bg-amber-100 text-amber-700",
  }

  const tipoLabel: Record<string, string> = {
    sincronico: "Sincronico",
    asincronico: "Asincronico",
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {curso.video_bienvenida && getYouTubeVideoId(curso.video_bienvenida) && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-luxor-primary" />
                Video de presentacion
              </h3>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(curso.video_bienvenida)}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video de presentacion"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-3">
            Descripcion del curso
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line flex-1">
            {curso.descripcion || curso.introduccion || "Este curso aun no tiene descripcion."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-luxor-primary/10 text-luxor-primary text-xs font-medium">
          <GraduationCap className="w-3.5 h-3.5" />
          {curso.facilitador_nombre}
        </span>

        {niveles.map((n) => (
          <span
            key={n}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
              nivelIcon[n] || "bg-gray-100 text-gray-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {nivelLabel[n] || n}
          </span>
        ))}

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
          {curso.tipo === "asincronico" ? (
            <Globe className="w-3.5 h-3.5" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          {tipoLabel[curso.tipo || ""] || curso.tipo || "Sin definir"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          {modulos.length} {modulos.length === 1 ? "Módulo" : "Módulos"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          {curso.duracion}
        </span>
      </div>
    </div>
  )
}

function TabContenido({
  modulos,
  moduloActual,
  moduloCompletados,
  isDecano,
  inscrito,
  materialPdf,
  setModuloActual,
  showQuiz,
  setShowQuiz,
  videoCompletado,
  setVideoCompletado,
  onModuloCompletado,
}: {
  modulos: ModuloData[]
  moduloActual: number
  moduloCompletados: string[]
  isDecano: boolean
  inscrito: boolean
  materialPdf: MaterialPDF[]
  setModuloActual: (i: number) => void
  showQuiz: boolean
  setShowQuiz: (v: boolean) => void
  videoCompletado: boolean
  setVideoCompletado: (v: boolean) => void
  onModuloCompletado: (
    aprobado: boolean,
    respuestas: {
      pregunta_id: string
      seleccionada: number | null
      libre: string | null
    }[]
  ) => void
}) {
  const modulo = modulos[moduloActual]
  const prevModuloRef = useRef(moduloActual)

  useEffect(() => {
    if (prevModuloRef.current !== moduloActual) {
      prevModuloRef.current = moduloActual
      setVideoCompletado(false)
      setShowQuiz(false)
    }
  }, [moduloActual])
  if (!modulo) return null

  const isModuloCompleted = (modId: string) =>
    moduloCompletados.includes(modId)

  const isModuloLocked = (index: number) => {
    if (isDecano) return false
    if (index === 0) return false
    return !isModuloCompleted(modulos[index - 1].id)
  }

  const embedUrl = getYouTubeEmbedUrl(modulo.video_url)

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
      <div className="space-y-5">
        <div className="bg-black rounded-xl overflow-hidden max-w-2xl mx-auto aspect-video">
          {embedUrl ? (
            <YouTubePlayer
              key={modulo.id}
              videoId={getYouTubeVideoId(modulo.video_url)}
              className="w-full h-full"
              noSkip={!isDecano && inscrito}
              onEnd={() => {
                if (!isDecano && inscrito && !isModuloCompleted(modulo.id)) {
                  if (modulo.preguntas.length === 0) {
                    onModuloCompletado(true, [])
                  } else {
                    const evt = new CustomEvent("video-modulo-completado")
                    window.dispatchEvent(evt)
                  }
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-luxor-primary/10 text-luxor-primary rounded-full text-xs font-medium">
              Modulo {modulo.orden}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {modulo.duracion}
            </span>
            {isModuloCompleted(modulo.id) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completado
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {modulo.titulo}
          </h3>
          <p className="text-gray-500 mt-1">{modulo.descripcion}</p>

          {materialPdf.filter(
            (m) => m.modulo_id === modulo.id || m.modulo_id === null
          ).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                Material de apoyo
              </p>
              <div className="flex gap-2 flex-wrap">
                {materialPdf
                  .filter(
                    (m) =>
                      m.modulo_id === modulo.id || m.modulo_id === null
                  )
                  .map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors"
                    >
                      {m.nombre}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {!isDecano &&
            !isModuloCompleted(modulo.id) &&
            inscrito && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {!showQuiz ? (
                  <button
                    onClick={() => setShowQuiz(true)}
                    disabled={!videoCompletado}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      videoCompletado
                        ? "bg-luxor-primary text-white hover:bg-luxor-secondary"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {videoCompletado ? (
                      <>
                        <Play className="w-4 h-4" />
                        Iniciar Evaluacion del Modulo
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Mira el video completo para desbloquear la
                        evaluacion
                      </>
                    )}
                  </button>
                ) : (
                  <Quiz
                    preguntas={modulo.preguntas}
                    onCompletar={onModuloCompletado}
                  />
                )}
              </div>
            )}

          {isDecano && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 italic">
                Contenido del modulo disponible para revision
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 h-fit lg:sticky lg:top-24">
        <h4 className="font-semibold text-gray-900 mb-2 px-2">
          Modulos del Curso
        </h4>
        <p className="text-xs text-gray-500 mb-3 px-2">
          {isDecano
            ? `${modulos.length} modulos`
            : `${moduloCompletados.length} de ${modulos.length} completados`}
        </p>

        {!isDecano && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 mx-2">
            <div
              className="h-1.5 rounded-full bg-luxor-primary transition-all duration-500"
              style={{
                width: `${
                  (moduloCompletados.length / modulos.length) * 100
                }%`,
              }}
            />
          </div>
        )}

        <div className="space-y-0.5">
          {modulos.map((mod, index) => {
            const locked = isModuloLocked(index)
            const completed = isModuloCompleted(mod.id)
            const active = index === moduloActual

            return (
              <button
                key={mod.id}
                onClick={() => !locked && setModuloActual(index)}
                disabled={locked}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                  active
                    ? "bg-luxor-primary/10 border border-luxor-primary/20"
                    : locked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                }`}
              >
                <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
                    completed
                      ? "bg-blue-500 text-white"
                      : active
                        ? "bg-luxor-primary text-white"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    mod.orden
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      active ? "text-luxor-primary" : "text-gray-700"
                    }`}
                  >
                    {mod.titulo}
                  </p>
                  <p className="text-xs text-gray-400">{mod.duracion}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CursoContent({ id }: { id: string }) {
  const { user } = useAuth()
  const isDecano = user?.rol === "decano"
  const isEstudiante = user?.rol === "estudiante"
  const supabase = createSupabaseClient()
  const searchParams = useSearchParams()
  const verCertificado = searchParams.get("certificado") === "1"

  const [curso, setCurso] = useState<CursoData | null>(null)
  const [modulos, setModulos] = useState<ModuloData[]>([])
  const [loading, setLoading] = useState(true)
  const [inscrito, setInscrito] = useState(false)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [pestaña, setPestaña] = useState<Pestaña>("informacion")

  const [moduloActual, setModuloActual] = useState(0)
  const [moduloCompletados, setModuloCompletados] = useState<string[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [cursoCompletado, setCursoCompletado] = useState(false)
  const [videoCompletado, setVideoCompletado] = useState(false)
  const [materialPdf, setMaterialPdf] = useState<MaterialPDF[]>([])

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true)
      const { data: cursoData } = await supabase
        .from("cursos")
        .select("*")
        .eq("id", id)
        .single()

      if (!cursoData) {
        setLoading(false)
        return
      }

      setCurso(cursoData as CursoData)

      const { data: modulosData } = await supabase
        .from("modulos")
        .select("*")
        .eq("curso_id", id)
        .order("orden")

      if (modulosData) {
        const modulosConPreguntas = await Promise.all(
          modulosData.map(async (mod) => {
            const { data: preguntasData } = await supabase
              .from("preguntas")
              .select("*")
              .eq("modulo_id", mod.id)
              .order("orden")

            const preguntas: Pregunta[] = (
              preguntasData || []
            ).map((p) => ({
              id: p.id,
              pregunta: p.pregunta,
              opciones: p.opciones,
              respuestaCorrecta: p.respuesta_correcta,
              tipo: p.tipo || "multiple",
            }))

            return {
              id: mod.id,
              titulo: mod.titulo,
              descripcion: mod.descripcion || "",
              video_url: mod.video_url || "",
              duracion: mod.duracion || "",
              orden: mod.orden,
              preguntas,
            }
          })
        )
        setModulos(modulosConPreguntas)
      }

      if (isEstudiante) {
        const { data: inscripcion } = await supabase
          .from("inscripciones")
          .select("id, estado")
          .eq("user_id", user?.id)
          .eq("curso_id", id)
          .maybeSingle()

        setInscrito(!!inscripcion)

        if (inscripcion?.estado === "completada") {
          setCursoCompletado(true)
        }

        if (inscripcion) {
          const { data: progreso } = await supabase
            .from("progreso_modulos")
            .select("modulo_id")
            .eq("user_id", user?.id)
            .eq("curso_id", id)
            .eq("completado", true)

          if (progreso) {
            setModuloCompletados(progreso.map((p) => p.modulo_id))
          }
        }

        const { data: materialData } = await supabase
          .from("material_pdf")
          .select("*")
          .eq("curso_id", id)
          .order("modulo_id", {
            ascending: true,
            nullsFirst: false,
          })
          .order("orden", { ascending: true })

        if (materialData) {
          setMaterialPdf(materialData as MaterialPDF[])
        }
      }

      setLoading(false)
    }

    fetchCurso()
  }, [id, user?.id, isEstudiante])

  useEffect(() => {
    function handleVideoEnd() {
      setVideoCompletado(true)
    }
    window.addEventListener("video-modulo-completado", handleVideoEnd)
    return () => {
      window.removeEventListener("video-modulo-completado", handleVideoEnd)
    }
  }, [])

  async function handleInscribirse() {
    if (!user || !curso) return
    setInscribiendo(true)
    await supabase.from("inscripciones").insert({
      user_id: user.id,
      curso_id: curso.id,
      estado: "activa",
    })

    await supabase.from("actividad_usuario").upsert(
      {
        user_id: user.id,
        fecha: new Date().toISOString().slice(0, 10),
        tipo: "inscribio_curso",
        puntos: 10,
        metadata: { curso_id: curso.id },
      },
      { onConflict: "user_id,fecha,tipo" }
    )

    setInscrito(true)
    setInscribiendo(false)
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
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Curso no encontrado</p>
        <Link
          href="/dashboard/cursos"
          className="text-luxor-primary text-sm mt-2 inline-block"
        >
          Volver al catalogo
        </Link>
      </div>
    )
  }

  async function handleModuloCompletado(
    aprobado: boolean,
    respuestas: {
      pregunta_id: string
      seleccionada: number | null
      libre: string | null
    }[]
  ) {
    const modulo = modulos[moduloActual]
    if (respuestas && user && curso && modulo) {
      for (const r of respuestas) {
        if (r.libre || r.seleccionada !== null) {
          const payload: any = {
            user_id: user.id,
            modulo_id: modulo.id,
            curso_id: curso.id,
            pregunta_id: r.pregunta_id,
          }
          if (r.libre !== null) payload.respuesta_libre = r.libre
          if (r.seleccionada !== null)
            payload.respuesta_seleccionada = r.seleccionada
          await supabase.from("respuestas_preguntas").upsert(payload, {
            onConflict: "user_id,pregunta_id",
          })
        }
      }
    }

    if (aprobado && curso && modulo) {
      const newCompletados = [...moduloCompletados, modulo.id]
      setModuloCompletados(newCompletados)
      setShowQuiz(false)
      setVideoCompletado(false)

      if (user && !isDecano) {
        await supabase.from("progreso_modulos").upsert(
          {
            user_id: user.id,
            modulo_id: modulo.id,
            curso_id: curso.id,
            completado: true,
            quiz_aprobado: true,
            fecha_completado: new Date().toISOString(),
          },
          { onConflict: "user_id,modulo_id" }
        )

        await supabase.from("actividad_usuario").upsert(
          {
            user_id: user.id,
            fecha: new Date().toISOString().slice(0, 10),
            tipo: "aprobo_quiz",
            puntos: 30,
            metadata: { modulo_id: modulo.id, curso_id: curso.id },
          },
          { onConflict: "user_id,fecha,tipo" }
        )
      }

      if (newCompletados.length === modulos.length) {
        setCursoCompletado(true)
        if (user && !isDecano) {
          await supabase
            .from("inscripciones")
            .update({
              estado: "completada",
              fecha_completado: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("curso_id", curso.id)

          await supabase.from("actividad_usuario").upsert(
            {
              user_id: user.id,
              fecha: new Date().toISOString().slice(0, 10),
              tipo: "completo_curso",
              puntos: 100,
              metadata: { curso_id: curso.id },
            },
            { onConflict: "user_id,fecha,tipo" }
          )

          const certId = `LX-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}-${Date.now()
            .toString(36)
            .toUpperCase()
            .slice(-4)}`
          await supabase.from("certificados").insert({
            user_id: user.id,
            curso_id: curso.id,
            cert_id: certId,
            user_nombre: user.nombre || "",
            curso_nombre: curso.titulo,
            duracion: curso.duracion,
          })
        }
      } else {
        const nextIndex = modulos.findIndex(
          (m) => !newCompletados.includes(m.id)
        )
        if (nextIndex !== -1) setModuloActual(nextIndex)
      }
    } else {
      setShowQuiz(false)
    }
  }

  if (verCertificado && cursoCompletado && !isDecano) {
    return (
      <ProtectedRoute>
        <div className="max-w-full">
          <Link
            href={`/dashboard/curso/${id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al curso
          </Link>
          <Certificado
            nombre={user?.nombre || "Estudiante"}
            curso={curso.titulo}
            fecha={new Date().toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            duracion={curso.duracion}
          />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {isDecano && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">
                Modo Solo Lectura
              </p>
              <p className="text-sm text-blue-600">
                Como Decano, puedes revisar el contenido del curso pero
                no participar en evaluaciones
              </p>
            </div>
          </div>
        )}

        {isEstudiante && !inscrito && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-800 font-medium mb-3">
              Necesitas inscribirte para acceder al curso
            </p>
            <button
              onClick={handleInscribirse}
              disabled={inscribiendo}
              className="px-6 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {inscribiendo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Inscribirme en este Curso
            </button>
          </div>
        )}

        {isEstudiante && inscrito && cursoCompletado && (
          <Link
            href={`/dashboard/curso/${id}?certificado=1`}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 hover:from-amber-100 hover:to-yellow-100 transition-colors"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Curso completado</p>
              <p className="text-sm text-amber-600">Toca aquí para ver tu certificado</p>
            </div>
          </Link>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {curso.titulo}
          </h1>
        </div>

        {(isDecano || inscrito) && (
          <>
            <Pestañas activa={pestaña} onChange={setPestaña} />

            {pestaña === "informacion" && (
              <TabInformacion curso={curso} modulos={modulos} />
            )}

            {pestaña === "contenido" && (
              <TabContenido
                modulos={modulos}
                moduloActual={moduloActual}
                moduloCompletados={moduloCompletados}
                isDecano={isDecano}
                inscrito={inscrito}
                materialPdf={materialPdf}
                setModuloActual={setModuloActual}
                showQuiz={showQuiz}
                setShowQuiz={setShowQuiz}
                videoCompletado={videoCompletado}
                setVideoCompletado={setVideoCompletado}
                onModuloCompletado={handleModuloCompletado}
              />
            )}

            {pestaña === "opiniones" && (
              <OpinionesCurso
                cursoId={curso.id}
                inscrito={!!inscrito}
              />
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default function CursoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CursoContent id={id} />
}
