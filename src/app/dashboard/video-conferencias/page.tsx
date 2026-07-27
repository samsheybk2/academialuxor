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
  CheckCircle2,
  UserCheck,
  Briefcase,
  Search,
  ChevronDown,
} from "lucide-react"

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
  cargos_invitados?: string[]
  cargos_nombres?: string[]
  asistencia_count?: number
  ya_asistio?: boolean
}

interface Curso {
  id: string
  titulo: string
}

interface Cargo {
  id: string
  nombre: string
}

interface Asistente {
  id: string
  nombre: string
  email: string
  fecha_registro: string
}

function VideoConferenciasContent() {
  const { user } = useAuth()
  const isFacilitador = user?.rol === "facilitador"
  const isDecano = user?.rol === "decano" || user?.rol === "developer"
  const isEstudiante = user?.rol === "estudiante"
  const supabase = createSupabaseClient()

  const [conferencias, setConferencias] = useState<VideoConferencia[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAsistencia, setShowAsistencia] = useState<VideoConferencia | null>(null)
  const [asistentes, setAsistentes] = useState<Asistente[]>([])
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
  const [selectedCargos, setSelectedCargos] = useState<string[]>([])
  const [showCargoDropdown, setShowCargoDropdown] = useState(false)
  const [cargoSearch, setCargoSearch] = useState("")
  const cargoDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConferencias()
    if (isFacilitador || isDecano) {
      fetchCursos()
      fetchCargos()
    }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(e.target as Node)) {
        setShowCargoDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function fetchConferencias() {
    setLoading(true)
    const { data } = await supabase
      .from("video_conferencias")
      .select("*, profiles!video_conferencias_facilitador_id_fkey(nombre, avatar_url), cursos(titulo)")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (data) {
      const mapped: VideoConferencia[] = await Promise.all(
        (data as any[]).map(async (vc) => {
          const { data: cargosData } = await supabase
            .from("video_conferencias_cargos")
            .select("cargo_id")
            .eq("video_conferencia_id", vc.id)

          const { data: asistenciaCount } = await supabase
            .from("video_conferencias_asistencia")
            .select("id", { count: "exact", head: true })
            .eq("video_conferencia_id", vc.id)

          const { data: miAsistencia } = await supabase
            .from("video_conferencias_asistencia")
            .select("id")
            .eq("video_conferencia_id", vc.id)
            .eq("user_id", user?.id || "")
            .limit(1)

          const cargoIds = (cargosData || []).map((c: any) => c.cargo_id)
          const cargosNombres: string[] = []
          for (const cid of cargoIds) {
            const { data: cargoData } = await supabase
              .from("cargos")
              .select("nombre")
              .eq("id", cid)
              .single()
            if (cargoData) cargosNombres.push(cargoData.nombre)
          }

          return {
            ...vc,
            facilitador_nombre: vc.profiles?.nombre || "Facilitador",
            facilitador_avatar: vc.profiles?.avatar_url,
            curso_titulo: vc.cursos?.titulo,
            cargos_invitados: cargoIds,
            cargos_nombres: cargosNombres,
            asistencia_count: asistenciaCount || 0,
            ya_asistio: (miAsistencia || []).length > 0,
          }
        })
      )
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

  async function fetchCargos() {
    const { data } = await supabase
      .from("cargos")
      .select("id, nombre")
      .order("nombre")
    setCargos(data || [])
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
    setSelectedCargos([])
    setShowModal(true)
  }

  async function openEdit(vc: VideoConferencia) {
    setEditingId(vc.id)
    setForm({
      titulo: vc.titulo,
      descripcion: vc.descripcion || "",
      curso_id: vc.curso_id || "",
      fecha: vc.fecha,
      hora_inicio: vc.hora_inicio,
      hora_fin: vc.hora_fin,
    })
    setSelectedCargos(vc.cargos_invitados || [])
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.titulo.trim() || !form.fecha || !form.hora_inicio || !form.hora_fin) return

    const salaJitsi = editingId
      ? (conferencias.find((c) => c.id === editingId)?.sala_jitsi || `AcademiaLuxor-${Date.now()}`)
      : `AcademiaLuxor-${Date.now()}`

    let vcId = editingId

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

      await supabase.from("video_conferencias_cargos").delete().eq("video_conferencia_id", editingId)
    } else {
      const { data } = await supabase
        .from("video_conferencias")
        .insert({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          facilitador_id: user!.id,
          curso_id: form.curso_id || null,
          fecha: form.fecha,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          sala_jitsi: salaJitsi,
        })
        .select("id")
        .single()
      vcId = data?.id
    }

    if (vcId && selectedCargos.length > 0) {
      await supabase
        .from("video_conferencias_cargos")
        .insert(selectedCargos.map((cargo_id) => ({ video_conferencia_id: vcId, cargo_id })))
    }

    setShowModal(false)
    fetchConferencias()
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta video conferencia?")) return
    await supabase.from("video_conferencias").delete().eq("id", id)
    fetchConferencias()
  }

  async function handleJoinSala(vc: VideoConferencia) {
    // Marcar asistencia automáticamente al unirse
    if (!vc.ya_asistio && user) {
      await supabase
        .from("video_conferencias_asistencia")
        .upsert({ video_conferencia_id: vc.id, user_id: user.id }, { onConflict: "video_conferencia_id,user_id" })
    }
    setSalaActiva(vc)
  }

  async function openAsistencia(vc: VideoConferencia) {
    setShowAsistencia(vc)
    const { data } = await supabase
      .from("video_conferencias_asistencia")
      .select("user_id, fecha_registro, profiles!inner(nombre, email)")
      .eq("video_conferencia_id", vc.id)
      .order("fecha_registro", { ascending: true })

    setAsistentes(
      (data || []).map((a: any) => ({
        id: a.user_id,
        nombre: a.profiles?.nombre || "Usuario",
        email: a.profiles?.email || "",
        fecha_registro: a.fecha_registro,
      }))
    )
  }

  async function toggleAsistencia(vc: VideoConferencia, userId: string) {
    const { data: existing } = await supabase
      .from("video_conferencias_asistencia")
      .select("id")
      .eq("video_conferencia_id", vc.id)
      .eq("user_id", userId)
      .single()

    if (existing) {
      await supabase
        .from("video_conferencias_asistencia")
        .delete()
        .eq("video_conferencia_id", vc.id)
        .eq("user_id", userId)
    } else {
      await supabase
        .from("video_conferencias_asistencia")
        .insert({ video_conferencia_id: vc.id, user_id: userId })
    }

    openAsistencia(vc)
    fetchConferencias()
  }

  function formatFecha(fecha: string) {
    return new Date(fecha + "T12:00:00").toLocaleDateString("es-VE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function esHoy(fecha: string) {
    return fecha === new Date().toISOString().split("T")[0]
  }

  function esAhora(vc: VideoConferencia) {
    const ahora = new Date()
    const inicio = new Date(`${vc.fecha}T${vc.hora_inicio}:00`)
    const fin = new Date(`${vc.fecha}T${vc.hora_fin}:00`)
    return ahora >= inicio && ahora <= fin
  }

  const puedeCrear = isFacilitador || isDecano

  const hoy = new Date().toISOString().split("T")[0]
  const conferenciasHoy = conferencias.filter((vc) => vc.fecha === hoy && vc.activa)
  const conferenciasFuturas = conferencias.filter((vc) => vc.fecha > hoy && vc.activa)
  const conferenciasPasadas = conferencias.filter((vc) => vc.fecha < hoy || !vc.activa)

  const cargosFiltrados = cargos.filter((c) =>
    c.nombre.toLowerCase().includes(cargoSearch.toLowerCase())
  )

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
                {vc.cargos_nombres && vc.cargos_nombres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vc.cargos_nombres.slice(0, 3).map((cn, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5" />
                        {cn}
                      </span>
                    ))}
                    {vc.cargos_nombres.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">
                        +{vc.cargos_nombres.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {vc.hora_inicio} - {vc.hora_fin}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <UserCheck className="w-3 h-3" />
                    {vc.asistencia_count} asistentes
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
                  {puedeCrear && (isDecano || vc.facilitador_id === user?.id) && (
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => openEdit(vc)}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vc.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoinSala(vc)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      esAhora(vc)
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {vc.ya_asistio ? "Entrar de nuevo" : esAhora(vc) ? "Unirse ahora" : "Unirse"}
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
                  {puedeCrear && (isDecano || vc.facilitador_id === user?.id) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(vc)}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vc.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {vc.curso_titulo && (
                  <p className="text-xs text-purple-600 font-medium mb-1">{vc.curso_titulo}</p>
                )}
                {vc.cargos_nombres && vc.cargos_nombres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vc.cargos_nombres.slice(0, 3).map((cn, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5" />
                        {cn}
                      </span>
                    ))}
                    {vc.cargos_nombres.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">
                        +{vc.cargos_nombres.length - 3}
                      </span>
                    )}
                  </div>
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
                <div className="flex items-center justify-between">
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
                  {puedeCrear && (isDecano || vc.facilitador_id === user?.id) && (
                    <button
                      onClick={() => openAsistencia(vc)}
                      className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      {vc.asistencia_count} asistentes
                    </button>
                  )}
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
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-700">{vc.titulo}</h3>
                  {puedeCrear && (isDecano || vc.facilitador_id === user?.id) && (
                    <button
                      onClick={() => handleDelete(vc.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
                  {vc.asistencia_count !== undefined && vc.asistencia_count > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">{vc.asistencia_count} asistentes</span>
                  )}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                <label className="block text-xs font-medium text-gray-500">Invitar cargos</label>
                <div className="relative" ref={cargoDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCargoDropdown(!showCargoDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-left text-sm text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <span>
                      {selectedCargos.length === 0
                        ? "Seleccionar cargos..."
                        : `${selectedCargos.length} cargo${selectedCargos.length !== 1 ? "s" : ""} seleccionado${selectedCargos.length !== 1 ? "s" : ""}`}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {selectedCargos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCargos.map((cid) => {
                        const cargo = cargos.find((c) => c.id === cid)
                        return cargo ? (
                          <span key={cid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {cargo.nombre}
                            <button onClick={() => setSelectedCargos(selectedCargos.filter((c) => c !== cid))} className="hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {showCargoDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCargoDropdown(false)} />
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              value={cargoSearch}
                              onChange={(e) => setCargoSearch(e.target.value)}
                              placeholder="Buscar cargo..."
                              className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-luxor-primary/30"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {cargosFiltrados.length === 0 ? (
                            <div className="p-3 text-xs text-gray-400 text-center">Sin resultados</div>
                          ) : (
                            cargosFiltrados.map((c) => {
                              const isSelected = selectedCargos.includes(c.id)
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCargos(
                                      isSelected
                                        ? selectedCargos.filter((x) => x !== c.id)
                                        : [...selectedCargos, c.id]
                                    )
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors ${
                                    isSelected ? "bg-purple-50" : ""
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-luxor-primary border-luxor-primary" : "border-gray-300"
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="font-medium text-gray-900 truncate">{c.nombre}</span>
                                </button>
                              )
                            })
                          )}
                        </div>
                        <div className="border-t border-gray-100 p-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCargos(cargos.map((c) => c.id))}
                            className="flex-1 text-xs text-luxor-primary hover:bg-luxor-primary/5 rounded px-2 py-1"
                          >
                            Seleccionar todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCargos([])}
                            className="flex-1 text-xs text-gray-500 hover:bg-gray-50 rounded px-2 py-1"
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

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

      {showAsistencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAsistencia(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Asistencia</h2>
                <p className="text-xs text-gray-500">{showAsistencia.titulo}</p>
              </div>
              <button onClick={() => setShowAsistencia(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {asistentes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aún no hay asistentes registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {asistentes.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{a.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Registrado: {new Date(a.fecha_registro).toLocaleString("es-VE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {puedeCrear && showAsistencia.facilitador_id === user?.id && (
                        <button
                          onClick={() => toggleAsistencia(showAsistencia, a.id)}
                          className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Quitar asistencia"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!(puedeCrear && showAsistencia.facilitador_id === user?.id) && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-gray-900">{asistentes.length}</span> asistente{asistentes.length !== 1 ? "s" : ""} registrado{asistentes.length !== 1 ? "s" : ""}
              </p>
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
