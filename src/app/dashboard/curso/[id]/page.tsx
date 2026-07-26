"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { formatDuration } from "@/lib/duration"
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
  RotateCcw,
  CalendarClock,
  AlertTriangle,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface ModuloData {
  id: string
  titulo: string
  descripcion: string
  video_url: string
  imagen_portada?: string
  duracion: string
  orden: number
  preguntas: Pregunta[]
  max_intentos?: number
}

interface MaterialPDF {
  id: string
  curso_id: string
  modulo_id?: string | null
  nombre: string
  url: string
  tipo: string
  icono?: string
  orden: number
}

interface CursoData {
  id: string
  titulo: string
  nivel: string[] | string
  tipo?: string
  facilitador_id: string
  facilitador_nombre: string
  descripcion: string
  duracion: string
  modulos_count: number
  video_bienvenida?: string
  introduccion?: string
  imagen_portada?: string
  duracion_dias?: number | null
  max_intentos?: number
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
  children,
}: {
  activa: Pestaña
  onChange: (p: Pestaña) => void
  children?: React.ReactNode
}) {
  const tabs: { id: Pestaña; label: string; icon: React.ElementType }[] = [
    { id: "informacion", label: "Informacion", icon: Info },
    { id: "contenido", label: "Contenido", icon: ListChecks },
    { id: "opiniones", label: "Opiniones", icon: MessageSquare },
  ]

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-col items-center gap-2 py-1">
        <div className="flex gap-0 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activa === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-medium transition-colors ${
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
        {children && <div className="flex items-center justify-center gap-2 pb-2">{children}</div>}
      </div>
    </div>
  )
}

function TabInformacion({
  curso,
  modulos,
  isEstudiante,
  inscrito,
  cursoCompletado,
  modoRepaso,
  setModoRepaso,
  setModuloCompletados,
  setModuloActual,
  setShowQuiz,
  setVideoCompletado,
  setPestaña,
}: {
  curso: CursoData
  modulos: ModuloData[]
  isEstudiante: boolean
  inscrito: boolean
  cursoCompletado: boolean
  modoRepaso: boolean
  setModoRepaso: (v: boolean) => void
  setModuloCompletados: (v: string[]) => void
  setModuloActual: (v: number) => void
  setShowQuiz: (v: boolean) => void
  setVideoCompletado: (v: boolean) => void
  setPestaña: (v: Pestaña) => void
}) {
  const id = curso.id
  const [showVideo, setShowVideo] = useState(false)
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
    coordinadores: "bg-luxor-primary/10 text-luxor-primary",
    administrativos: "bg-violet-100 text-violet-700",
    operadores: "bg-amber-100 text-amber-700",
  }

  const tipoLabel: Record<string, string> = {
    sincronico: "Sincronico",
    asincronico: "Asincronico",
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 px-4 sm:px-6">
        <div className="space-y-4 flex flex-col items-center">
          {curso.imagen_portada && !showVideo && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full relative">
              <img
                src={curso.imagen_portada}
                alt={`Portada de ${curso.titulo}`}
                className="w-full h-auto object-contain max-h-[500px]"
              />
              {curso.video_bienvenida && getYouTubeVideoId(curso.video_bienvenida) && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 bg-luxor-primary/90 hover:bg-luxor-primary text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Reproducir video
                </button>
              )}
            </div>
          )}

          {(showVideo || !curso.imagen_portada) && curso.video_bienvenida && getYouTubeVideoId(curso.video_bienvenida) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full relative">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(curso.video_bienvenida)}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video de presentacion"
                />
              </div>
              {curso.imagen_portada && (
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute bottom-4 right-4 bg-white/80 hover:bg-white/95 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Play className="w-4 h-4 rotate-180" />
                  Volver a la imagen
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 pl-10 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-3">
            Descripcion del curso
          </h3>
          <p className="text-gray-600 leading-relaxed flex-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: curso.descripcion || curso.introduccion || "Este curso aun no tiene descripcion." }} />
          {isEstudiante && inscrito && cursoCompletado && !modoRepaso && (
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
              <a
                href={`/dashboard/curso/${id}?certificado=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Ver Certificado
              </a>
              <button
                onClick={() => {
                  setModoRepaso(true)
                  setModuloCompletados([])
                  setModuloActual(0)
                  setShowQuiz(false)
                  setVideoCompletado(false)
                  setPestaña("contenido")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Repetir Curso
              </button>
            </div>
          )}
        {isEstudiante && inscrito && modoRepaso && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Modo repaso activo</p>
                <p className="text-xs text-blue-600">Practica sin afectar tus resultados</p>
              </div>
              <button
                onClick={() => {
                  setModoRepaso(false)
                  window.location.reload()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Salir del repaso
              </button>
            </div>
          )}
        </div>
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
  curso,
  setModuloActual,
  showQuiz,
  setShowQuiz,
  videoCompletado,
  setVideoCompletado,
  modoRepaso,
  intentosByModulo,
  onModuloCompletado,
}: {
  modulos: ModuloData[]
  moduloActual: number
  moduloCompletados: string[]
  isDecano: boolean
  inscrito: boolean
  materialPdf: MaterialPDF[]
  curso: CursoData
  setModuloActual: (i: number) => void
  showQuiz: boolean
  setShowQuiz: (v: boolean) => void
  videoCompletado: boolean
  setVideoCompletado: (v: boolean) => void
  modoRepaso: boolean
  intentosByModulo: Record<string, number>
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

  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (prevModuloRef.current !== moduloActual) {
      prevModuloRef.current = moduloActual
      setVideoCompletado(false)
      setShowQuiz(false)
      setShowVideo(false)
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
      <div className="space-y-5 min-w-0">
        {showQuiz ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <Quiz
              preguntas={modulo.preguntas}
              onCompletar={onModuloCompletado}
              intentosUsados={intentosByModulo[modulo.id] || 0}
              maxIntentos={modulo.max_intentos || curso?.max_intentos || 3}
            />
          </div>
        ) : (
          <>
            <div className="bg-black rounded-xl overflow-hidden w-full aspect-video relative">
              {modulo.imagen_portada && !showVideo ? (
                <div className="relative w-full h-full">
                  <img
                    src={modulo.imagen_portada}
                    alt={`Portada de ${modulo.titulo}`}
                    className="w-full h-full object-contain"
                  />
                  {embedUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-7 h-7 text-luxor-primary ml-1" />
                      </div>
                    </button>
                  )}
                </div>
              ) : embedUrl ? (
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
              {formatDuration(modulo.duracion)}
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
          <p className="text-gray-500 mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: modulo.descripcion }} />

          {materialPdf.filter(
            (m) => m.modulo_id === modulo.id || m.modulo_id === null
          ).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                Recursos de descarga
              </p>
              <div className="space-y-2">
                {materialPdf
                  .filter(
                    (m) =>
                      m.modulo_id === modulo.id || m.modulo_id === null
                  )
                  .map((m) => {
                    const iconoTipo = m.icono || "link"
                    const colorMap: Record<string, string> = {
                      "file-text": "bg-red-50 border-red-200 text-red-700",
                      video: "bg-blue-50 border-blue-200 text-blue-700",
                      file: "bg-amber-50 border-amber-200 text-amber-700",
                      link: "bg-violet-50 border-violet-200 text-violet-700",
                    }
                    const labelMap: Record<string, string> = {
                      "file-text": "PDF",
                      video: "Video",
                      file: "Doc",
                      link: "Link",
                    }
                    return (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity ${colorMap[iconoTipo] || colorMap.link}`}
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60 shrink-0">
                          {iconoTipo === "file-text" && <FileText className="w-4 h-4" />}
                          {iconoTipo === "video" && <Play className="w-4 h-4" />}
                          {iconoTipo === "file" && <BookOpen className="w-4 h-4" />}
                          {iconoTipo === "link" && <Globe className="w-4 h-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{m.nombre}</p>
                          <p className="text-[10px] opacity-60">{labelMap[iconoTipo] || "Recurso"}</p>
                        </div>
                      </a>
                    )
                  })}
              </div>
            </div>
          )}

          {!isDecano &&
            !isModuloCompleted(modulo.id) &&
            inscrito &&
            !showQuiz && (
                  <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg lg:bottom-0">
                    <div className="max-w-2xl mx-auto">
                      {(() => {
                        const moduloMaxIntentos = modulo.max_intentos || curso?.max_intentos || 3
                        const intentosUsados = intentosByModulo[modulo.id] || 0
                        const sinIntentos = !modoRepaso && intentosUsados >= moduloMaxIntentos
                        const videoBloqueado = !modoRepaso && !!embedUrl && !videoCompletado

                        return (
                          <button
                            onClick={() => {
                              setShowQuiz(true)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            disabled={videoBloqueado || sinIntentos}
                            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              sinIntentos
                                ? "bg-red-100 text-red-500 cursor-not-allowed"
                                : videoBloqueado
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-luxor-primary text-white hover:bg-luxor-secondary"
                            }`}
                          >
                            {sinIntentos ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Sin intentos restantes ({moduloMaxIntentos}/{moduloMaxIntentos})
                              </>
                            ) : videoBloqueado ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Mira el video completo para desbloquear la evaluacion
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Iniciar Evaluacion del Modulo
                                {intentosUsados > 0 && !modoRepaso && (
                                  <span className="text-xs opacity-75 ml-1">
                                    (Intento {intentosUsados + 1} de {moduloMaxIntentos})
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        )
                      })()}
                    </div>
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
          </>
        )}
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
  const isDecano = user?.rol === "decano" || user?.rol === "developer"
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
  const [modoRepaso, setModoRepaso] = useState(false)
  const [fechaLimite, setFechaLimite] = useState<string | null>(null)
  const [cursoExpirado, setCursoExpirado] = useState(false)
  const [intentosByModulo, setIntentosByModulo] = useState<Record<string, number>>({})
  const [vistaEstudiante, setVistaEstudiante] = useState(false)

  const canPreview = isDecano || curso?.facilitador_id === user?.id
  const isDecanoEff = canPreview && !vistaEstudiante
  const isEstudianteEff = isEstudiante || vistaEstudiante
  const inscritoEff = inscrito

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
          modulosData.map(async (mod: { id: string; titulo: string; descripcion?: string; video_url?: string; duracion?: string; orden: number; max_intentos?: number }) => {
            const { data: preguntasData } = await supabase
              .from("preguntas")
              .select("*")
              .eq("modulo_id", mod.id)
              .order("orden")

            const preguntas: Pregunta[] = (
              preguntasData || []
            ).map((p: { id: string; pregunta: string; opciones?: any; respuesta_correcta?: any; tipo?: string }) => ({
              id: p.id,
              pregunta: p.pregunta,
              opciones: Array.isArray(p.opciones) ? p.opciones : typeof p.opciones === "string" ? JSON.parse(p.opciones || "[]") : [],
              respuestaCorrecta: typeof p.respuesta_correcta === "string" ? parseInt(p.respuesta_correcta) : p.respuesta_correcta,
              tipo: p.tipo || "multiple",
            }))

            return {
              id: mod.id,
              titulo: mod.titulo,
              descripcion: mod.descripcion || "",
              video_url: mod.video_url || "",
              duracion: mod.duracion || "",
              orden: mod.orden,
              max_intentos: mod.max_intentos,
              preguntas,
            }
          })
        )
        setModulos(modulosConPreguntas)
      }

      if (user) {
        const { data: inscripcion } = await supabase
          .from("inscripciones")
          .select("id, estado, fecha_limite")
          .eq("user_id", user?.id)
          .eq("curso_id", id)
          .maybeSingle()

        setInscrito(!!inscripcion)

        if (inscripcion?.estado === "completada") {
          setCursoCompletado(true)
        }

        if (inscripcion?.fecha_limite) {
          setFechaLimite(inscripcion.fecha_limite)
          if (new Date(inscripcion.fecha_limite) < new Date()) {
            setCursoExpirado(true)
          }
        }

        if (inscripcion) {
          const { data: progreso } = await supabase
            .from("progreso_modulos")
            .select("modulo_id, intentos")
            .eq("user_id", user?.id)
            .eq("curso_id", id)
            .eq("completado", true)

          if (progreso) {
            setModuloCompletados(progreso.map((p: { modulo_id: string }) => p.modulo_id))
          }

          const { data: todoProgreso } = await supabase
            .from("progreso_modulos")
            .select("modulo_id, intentos")
            .eq("user_id", user?.id)
            .eq("curso_id", id)

          if (todoProgreso) {
            const map: Record<string, number> = {}
            todoProgreso.forEach((p: { modulo_id: string; intentos: number }) => {
              map[p.modulo_id] = p.intentos || 0
            })
            setIntentosByModulo(map)
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

    const { error } = await supabase.from("inscripciones").insert({
      user_id: user.id,
      curso_id: curso.id,
      estado: "activa",
      fecha_limite: null,
    })

    if (error && error.code !== "23505") {
      setInscribiendo(false)
      return
    }

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
    if (respuestas && user && curso && modulo && !modoRepaso) {
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

      if (user && !isDecano && !modoRepaso) {
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
        if (modoRepaso) {
          setShowQuiz(false)
        } else {
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
        }
      } else {
        const nextIndex = modulos.findIndex(
          (m) => !newCompletados.includes(m.id)
        )
        if (nextIndex !== -1) setModuloActual(nextIndex)
      }
    } else {
      if (user && curso && modulo && !modoRepaso) {
        const { data: existing } = await supabase
          .from("progreso_modulos")
          .select("intentos")
          .eq("user_id", user.id)
          .eq("modulo_id", modulo.id)
          .maybeSingle()

        const nuevosIntentos = (existing?.intentos || 0) + 1

        await supabase.from("progreso_modulos").upsert(
          {
            user_id: user.id,
            modulo_id: modulo.id,
            curso_id: curso.id,
            completado: false,
            quiz_aprobado: false,
            intentos: nuevosIntentos,
          },
          { onConflict: "user_id,modulo_id" }
        )

        setIntentosByModulo(prev => ({ ...prev, [modulo.id]: nuevosIntentos }))
      }
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
            fecha={new Date().toLocaleDateString("es-VE", {
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
      <div className="space-y-6 pb-20 px-4 sm:px-6">
        {canPreview && !vistaEstudiante && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                Modo Solo Lectura
              </p>
              <p className="text-sm text-blue-600">
                Puedes revisar el contenido del curso como lo vería un estudiante
              </p>
            </div>
            <button
              onClick={() => setVistaEstudiante(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <Eye className="w-4 h-4" />
              Ver como Estudiante
            </button>
          </div>
        )}

        {vistaEstudiante && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-800">
                Vista Previa - Modo Estudiante
              </p>
              <p className="text-sm text-purple-600">
                Estas viendo el curso como lo veria un estudiante inscrito
              </p>
            </div>
            <button
              onClick={() => setVistaEstudiante(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shrink-0"
            >
              Salir de Vista Estudiante
            </button>
          </div>
        )}

        {isEstudianteEff && !inscritoEff && curso.imagen_portada && (
          <div className="flex justify-center">
            <div className="w-48 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={curso.imagen_portada}
                alt={`Portada de ${curso.titulo}`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        {isEstudianteEff && !inscritoEff && (
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

        {isEstudiante && inscrito && modoRepaso && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Modo repaso activo</p>
              <p className="text-sm text-blue-600">Practica sin afectar tus resultados anteriores</p>
            </div>
            <button
              onClick={() => {
                setModoRepaso(false)
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Salir del repaso
            </button>
          </div>
        )}

        {isEstudiante && inscrito && cursoExpirado && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-800 font-semibold mb-1">Tiempo agotado</p>
            <p className="text-red-600 text-sm mb-1">
              El plazo para completar este curso expiro el {fechaLimite ? new Date(fechaLimite + "T00:00:00").toLocaleDateString("es-DO") : ""}.
            </p>
            <p className="text-red-500 text-xs">Contacta a tu facilitador para mas informacion.</p>
          </div>
        )}

        {isEstudiante && inscrito && !cursoExpirado && fechaLimite && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-amber-800 font-medium text-sm">Fecha limite: {new Date(fechaLimite + "T00:00:00").toLocaleDateString("es-DO")}</p>
              <p className="text-amber-600 text-xs">
                {(() => {
                  const diasRestantes = Math.ceil((new Date(fechaLimite + "T00:00:00").getTime() - Date.now()) / 86400000)
                  return diasRestantes <= 3
                    ? `Quedan ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}. ¡Apurate!`
                    : `${diasRestantes} dias restantes para completar el curso.`
                })()}
              </p>
            </div>
          </div>
        )}

        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mt-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 ml-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {curso.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-luxor-primary/10 text-luxor-primary text-xs font-medium">
                <GraduationCap className="w-3.5 h-3.5" />
                {curso.facilitador_nombre}
              </span>
              {curso.tipo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {curso.tipo === "asincronico" ? <Globe className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  {curso.tipo === "asincronico" ? "Asincronico" : "Sincronico"}
                </span>
              )}
              {modulos.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  {modulos.length} {modulos.length === 1 ? "Modulo" : "Modulos"}
                </span>
              )}
              {curso.duracion && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(curso.duracion)}
                </span>
              )}
            </div>
          </div>

          {(isDecanoEff || inscritoEff) && (
            <Pestañas activa={pestaña} onChange={setPestaña} />
          )}
        </div>

        {(isDecanoEff || inscritoEff) && (
          <>
            {pestaña === "informacion" && (
              <TabInformacion
                curso={curso}
                modulos={modulos}
                isEstudiante={isEstudianteEff}
                inscrito={inscritoEff}
                cursoCompletado={cursoCompletado}
                modoRepaso={modoRepaso}
                setModoRepaso={setModoRepaso}
                setModuloCompletados={setModuloCompletados}
                setModuloActual={setModuloActual}
                setShowQuiz={setShowQuiz}
                setVideoCompletado={setVideoCompletado}
                setPestaña={setPestaña}
              />
            )}

            {pestaña === "contenido" && (
              <TabContenido
                modulos={modulos}
                moduloActual={moduloActual}
                moduloCompletados={moduloCompletados}
                isDecano={isDecanoEff}
                inscrito={inscritoEff}
                materialPdf={materialPdf}
                curso={curso!}
                setModuloActual={setModuloActual}
                showQuiz={showQuiz}
                setShowQuiz={setShowQuiz}
                videoCompletado={videoCompletado}
                setVideoCompletado={setVideoCompletado}
                modoRepaso={modoRepaso}
                intentosByModulo={intentosByModulo}
                onModuloCompletado={handleModuloCompletado}
              />
            )}

            {pestaña === "opiniones" && (
              <OpinionesCurso
                cursoId={curso.id}
                inscrito={!!inscritoEff}
                cursoCompletado={cursoCompletado}
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
