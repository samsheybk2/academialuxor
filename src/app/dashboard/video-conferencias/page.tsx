"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  Monitor,
} from "lucide-react"
import Link from "next/link"

interface VideoConferencia {
  id: string
  titulo: string
  descripcion: string
  facilitador_id: string
  facilitador_nombre?: string
  facilitador_avatar?: string
  curso_id: string | null
  curso_titulo?: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  sala_jitsi: string
  activa: boolean
  created_at: string
}

interface Curso {
  id: string
  titulo: string
}

function VideoConferenciasContent() {
  const { user } = useAuth()
  const isFacilitador = user?.rol === "facilitador"
  const isDecano = user?.rol === "decano" || user?.rol === "developer"
  const isEstudiante = user?.rol === "estudiante"
  const supabase = createSupabaseClient()

  const [conferencias, setConferencias] = useState<VideoConferencia[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [salaActiva, setSalaActiva] = useState<VideoConferencia | null>(null)

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    curso_id: "",
    fecha: "",
    hora_inicio: "09:00",
    hora_fin: "10:00",
  })

  useEffect(() => {
    fetchConferencias()
    if (isFacilitador || isDecano) {
      fetchCursos()
    }
  }, [])

  async function fetchConferencias() {
    setLoading(true)
    const { data } = await supabase
      .from("video_conferencias")
      .select("*, profiles!video_conferencias_facilitador_id_fkey(nombre, avatar_url), cursos(titulo)")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (data) {
      const mapped = data.map((vc: any) => ({
        ...vc,
        facilitador_nombre: vc.profiles?.nombre || "Facilitador",
        facilitador_avatar: vc.profiles?.avatar_url,
        curso_titulo: vc.cursos?.titulo,
      }))
      setConferencias(mapped)
    }
    setLoading(false)
  }

  async function fetchCursos() {
    const { data } = await supabase
      .from("cursos")
      .select("id, titulo")
      .eq("activo", true)
      .order("titulo")
    setCursos(data || [])
  }

  function openCreate() {
    setEditingId(null)
    setForm({
      titulo: "",
      descripcion: "",
      curso_id: "",
      fecha: new Date().toISOString().split("T")[0],
      hora_inicio: "09:00",
      hora_fin: "10:00",
    })
    setShowModal(true)
  }

  function openEdit(vc: VideoConferencia) {
    setEditingId(vc.id)
    setForm({
      titulo: vc.titulo,
      descripcion: vc.descripcion || "",
      curso_id: vc.curso_id || "",
      fecha: vc.fecha,
      hora_inicio: vc.hora_inicio,
      hora_fin: vc.hora_fin,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.titulo.trim() || !form.fecha || !form.hora_inicio || !form.hora_fin) return

    const salaJitsi = `AcademiaLuxor-${Date.now()}`

    if (editingId) {
      await supabase
        .from("video_conferencias")
        .update({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          curso_id: form.curso_id || null,
          fecha: form.fecha,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
        })
        .eq("id", editingId)
    } else {
      await supabase.from("video_conferencias").insert({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        facilitador_id: user!.id,
        curso_id: form.curso_id || null,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        sala_jitsi: salaJitsi,
      })
    }

    setShowModal(false)
    fetchConferencias()
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta video conferencia?")) return
    await supabase.from("video_conferencias").delete().eq("id", id)
    fetchConferencias()
  }

  function joinSala(vc: VideoConferencia) {
    setSalaActiva(vc)
  }

  const hoy = new Date().toISOString().split("T")[0]
  const conferenciasHoy = conferencias.filter((vc) => vc.fecha === hoy && vc.activa)
  const conferenciasFuturas = conferencias.filter((vc) => vc.fecha > hoy && vc.activa)
  const conferenciasPasadas = conferencias.filter((vc) => vc.fecha < hoy || !vc.activa)

  function formatFecha(fecha: string) {
    return new Date(fecha + "T12:00:00").toLocaleDateString("es-VE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function esHoy(fecha: string) {
    return fecha === hoy
  }

  function esAhora(vc: VideoConferencia) {
    const ahora = new Date()
    const inicio = new Date(`${vc.fecha}T${vc.hora_inicio}:00`)
    const fin = new Date(`${vc.fecha}T${vc.hora_fin}:00`)
    return ahora >= inicio && ahora <= fin
  }

  const puedeCrear = isFacilitador || isDecano

  return (
    <div className="space-y-6">
      {salaActiva && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white">
            <div>
              <h2 className="font-semibold">{salaActiva.titulo}</h2>
              <p className="text-sm text-gray-400">
                {salaActiva.facilitador_nombre} · {salaActiva.hora_inicio} - {salaActiva.hora_fin}
              </p>
            </div>
            <button
              onClick={() => setSalaActiva(null)}
              className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Salir de la sala
            </button>
          </div>
          <div className="flex-1">
            <iframe
              src={`https://meet.jit.si/${salaActiva.sala_jitsi}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg">
            <Video className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Video Conferencias</span>
          </div>
          {puedeCrear && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-luxor-primary text-white rounded-lg text-sm font-medium hover:bg-luxor-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agendar Clase
            </button>
          )}
        </div>
      </div>

      {conferenciasHoy.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Hoy
          </h2>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {conferenciasHoy.map((vc) => (
              <div
                key={vc.id}
                className={`bg-white rounded-xl border-2 p-4 transition-all ${
                  esAhora(vc)
                    ? "border-green-500 shadow-lg shadow-green-500/20"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                {esAhora(vc) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      EN VIVO
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{vc.titulo}</h3>
                {vc.curso_titulo && (
                  <p className="text-xs text-purple-600 font-medium mb-1">{vc.curso_titulo}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {vc.hora_inicio} - {vc.hora_fin}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {vc.facilitador_avatar ? (
                      <img src={vc.facilitador_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{vc.facilitador_nombre}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => joinSala(vc)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      esAhora(vc)
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {esAhora(vc) ? "Unirse ahora" : "Unirse"}
                  </button>
                  <a
                    href={`https://meet.jit.si/${vc.sala_jitsi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conferenciasFuturas.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Próximas clases
          </h2>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {conferenciasFuturas.map((vc) => (
              <div
                key={vc.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{vc.titulo}</h3>
                  {puedeCrear && vc.facilitador_id === user?.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(vc)}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vc.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {vc.curso_titulo && (
                  <p className="text-xs text-purple-600 font-medium mb-1">{vc.curso_titulo}</p>
                )}
                {vc.descripcion && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{vc.descripcion}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatFecha(vc.fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {vc.hora_inicio} - {vc.hora_fin}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {vc.facilitador_avatar ? (
                      <img src={vc.facilitador_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{vc.facilitador_nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conferenciasPasadas.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Clases anteriores
          </h2>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {conferenciasPasadas.slice(0, 6).map((vc) => (
              <div
                key={vc.id}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60"
              >
                <h3 className="font-semibold text-gray-700 mb-1">{vc.titulo}</h3>
                {vc.curso_titulo && (
                  <p className="text-xs text-gray-500 mb-1">{vc.curso_titulo}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatFecha(vc.fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {vc.hora_inicio} - {vc.hora_fin}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-xs text-gray-500">{vc.facilitador_nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && conferencias.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Video className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay video conferencias programadas</p>
          {puedeCrear && (
            <button
              onClick={openCreate}
              className="mt-3 text-sm text-luxor-primary hover:underline font-medium"
            >
              Agendar la primera clase virtual
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Editar Clase Virtual" : "Agendar Clase Virtual"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Clase de Seguridad Industrial"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  placeholder="Descripción de la clase (opcional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
                />
              </div>

              {cursos.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Curso relacionado</label>
                  <select
                    value={form.curso_id}
                    onChange={(e) => setForm({ ...form, curso_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                  >
                    <option value="">Sin curso</option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id}>{c.titulo}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Hora inicio *</label>
                  <input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Hora fin *</label>
                  <input
                    type="time"
                    value={form.hora_fin}
                    onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.titulo.trim() || !form.fecha}
                  className="flex-1 px-4 py-2.5 bg-luxor-primary text-white rounded-lg text-sm font-medium hover:bg-luxor-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "Actualizar" : "Agendar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VideoConferenciasPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador", "estudiante"]}>
      <VideoConferenciasContent />
    </ProtectedRoute>
  )
}
