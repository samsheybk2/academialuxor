"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { updatePassword } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { User, Loader2, CheckCircle2, AlertCircle, Camera, X, Eye, EyeOff, ChevronDown, ChevronUp, Pencil, Flame, Target, BookOpen, Award, Star, TrendingUp, Trophy, Zap, Calendar } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface FacilitadorStats {
  cursosCreados: number
  cursosAprobados: number
  cursosRechazados: number
  cursosPendientes: number
  estudiantesCapacitados: number
  calificacionPromedio: number
}

interface StudentStats {
  cursosInscritos: number
  cursosCompletados: number
  modulosCompletados: number
  quizzesAprobados: number
  calificacionPromedio: number
  puntosTotales: number
  rachaActual: number
  mejorRacha: number
  ultimaActividad: string | null
}

interface Badge {
  id: string
  nombre: string
  desc: string
  icon: string
  color: string
  bg: string
  ok: boolean
  p: number
  t: number
}

function getStudentBadges(stats: StudentStats): Badge[] {
  return [
    { id: "primera-inscripcion", nombre: "Primera Inscripcion", desc: "Te inscribiste en tu primer curso", icon: "📋", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosInscritos >= 1, p: Math.min(stats.cursosInscritos, 1), t: 1 },
    { id: "estudiante-activo", nombre: "Estudiante Activo", desc: "Inscrito en 3 cursos", icon: "📚", color: "text-indigo-700", bg: "bg-indigo-100", ok: stats.cursosInscritos >= 3, p: Math.min(stats.cursosInscritos, 3), t: 3 },
    { id: "explorador", nombre: "Explorador", desc: "Inscrito en 5 cursos", icon: "🔍", color: "text-violet-700", bg: "bg-violet-100", ok: stats.cursosInscritos >= 5, p: Math.min(stats.cursosInscritos, 5), t: 5 },
    { id: "primera-finalizacion", nombre: "Primera Finalizacion", desc: "Completaste tu primer curso", icon: "🎯", color: "text-green-700", bg: "bg-green-100", ok: stats.cursosCompletados >= 1, p: Math.min(stats.cursosCompletados, 1), t: 1 },
    { id: "estudiante-dedicado", nombre: "Estudiante Dedicado", desc: "Completaste 3 cursos", icon: "🏅", color: "text-amber-700", bg: "bg-amber-100", ok: stats.cursosCompletados >= 3, p: Math.min(stats.cursosCompletados, 3), t: 3 },
    { id: "maestro-conocimiento", nombre: "Maestro del Conocimiento", desc: "Completaste 5 cursos", icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.cursosCompletados >= 5, p: Math.min(stats.cursosCompletados, 5), t: 5 },
    { id: "quiz-master", nombre: "Quiz Master", desc: "Aprobaste 5 quizzes", icon: "🧠", color: "text-cyan-700", bg: "bg-cyan-100", ok: stats.quizzesAprobados >= 5, p: Math.min(stats.quizzesAprobados, 5), t: 5 },
    { id: "excelencia-academica", nombre: "Excelencia Academica", desc: "Promedio mayor a 90%", icon: "💎", color: "text-purple-700", bg: "bg-purple-100", ok: stats.calificacionPromedio >= 90, p: Math.min(stats.calificacionPromedio, 90), t: 90 },
    { id: "calidad-comprobada", nombre: "Calidad Comprobada", desc: "Promedio mayor a 80%", icon: "⭐", color: "text-pink-700", bg: "bg-pink-100", ok: stats.calificacionPromedio >= 80, p: Math.min(stats.calificacionPromedio, 80), t: 80 },
    { id: "racha-fuego", nombre: "Racha de Fuego", desc: "7 dias consecutivos", icon: "🔥", color: "text-orange-700", bg: "bg-orange-100", ok: stats.rachaActual >= 7 || stats.mejorRacha >= 7, p: Math.min(stats.mejorRacha, 7), t: 7 },
    { id: "imparable", nombre: "Imparable", desc: "14 dias consecutivos", icon: "⚡", color: "text-red-700", bg: "bg-red-100", ok: stats.rachaActual >= 14 || stats.mejorRacha >= 14, p: Math.min(stats.mejorRacha, 14), t: 14 },
    { id: "leyenda", nombre: "Leyenda", desc: "30 dias consecutivos", icon: "👑", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.rachaActual >= 30 || stats.mejorRacha >= 30, p: Math.min(stats.mejorRacha, 30), t: 30 },
  ]
}

function getStudentNivel(puntos: number) {
  if (puntos >= 500) return { n: "Leyenda", c: "from-yellow-400 to-amber-500", i: "👑", score: puntos, from: 500, to: 500 }
  if (puntos >= 300) return { n: "Experto", c: "from-purple-400 to-violet-500", i: "🏆", score: puntos, from: 300, to: 500 }
  if (puntos >= 150) return { n: "Avanzado", c: "from-blue-400 to-indigo-500", i: "⭐", score: puntos, from: 150, to: 300 }
  if (puntos >= 50) return { n: "Intermedio", c: "from-green-400 to-emerald-500", i: "📈", score: puntos, from: 50, to: 150 }
  if (puntos >= 10) return { n: "Principiante", c: "from-gray-400 to-gray-500", i: "🌱", score: puntos, from: 10, to: 50 }
  return { n: "Novato", c: "from-gray-300 to-gray-400", i: "📋", score: puntos, from: 0, to: 10 }
}

function getBadges(stats: FacilitadorStats): Badge[] {
  return [
    { id: "primer-curso", nombre: "Primer Curso", desc: "Creaste tu primer curso", icon: "📘", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosCreados >= 1, p: Math.min(stats.cursosCreados, 1), t: 1 },
    { id: "creador-activo", nombre: "Creador Activo", desc: "Creaste 5 cursos", icon: "📚", color: "text-indigo-700", bg: "bg-indigo-100", ok: stats.cursosCreados >= 5, p: Math.min(stats.cursosCreados, 5), t: 5 },
    { id: "maestro-creador", nombre: "Maestro Creador", desc: "Creaste 10 cursos", icon: "🎓", color: "text-violet-700", bg: "bg-violet-100", ok: stats.cursosCreados >= 10, p: Math.min(stats.cursosCreados, 10), t: 10 },
    { id: "primera-aprobacion", nombre: "Primera Aprobacion", desc: "Tu primer curso fue aprobado", icon: "✅", color: "text-green-700", bg: "bg-green-100", ok: stats.cursosAprobados >= 1, p: Math.min(stats.cursosAprobados, 1), t: 1 },
    { id: "instructor-cert", nombre: "Instructor Certificado", desc: "5 cursos aprobados", icon: "🏅", color: "text-amber-700", bg: "bg-amber-100", ok: stats.cursosAprobados >= 5, p: Math.min(stats.cursosAprobados, 5), t: 5 },
    { id: "maestro-instructor", nombre: "Maestro Instructor", desc: "10 cursos aprobados", icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.cursosAprobados >= 10, p: Math.min(stats.cursosAprobados, 10), t: 10 },
    { id: "primer-estudiante", nombre: "Primer Estudiante", desc: "1 estudiante inscrito", icon: "👤", color: "text-cyan-700", bg: "bg-cyan-100", ok: stats.estudiantesCapacitados >= 1, p: Math.min(stats.estudiantesCapacitados, 1), t: 1 },
    { id: "mentor-activo", nombre: "Mentor Activo", desc: "10 estudiantes capacitados", icon: "👥", color: "text-teal-700", bg: "bg-teal-100", ok: stats.estudiantesCapacitados >= 10, p: Math.min(stats.estudiantesCapacitados, 10), t: 10 },
    { id: "lider-aprendizaje", nombre: "Lider de Aprendizaje", desc: "50 estudiantes capacitados", icon: "🌟", color: "text-orange-700", bg: "bg-orange-100", ok: stats.estudiantesCapacitados >= 50, p: Math.min(stats.estudiantesCapacitados, 50), t: 50 },
    { id: "excelencia", nombre: "Excelencia Academica", desc: "Calificacion promedio > 90%", icon: "💎", color: "text-purple-700", bg: "bg-purple-100", ok: stats.calificacionPromedio >= 90, p: Math.min(stats.calificacionPromedio, 90), t: 90 },
    { id: "calidad", nombre: "Calidad Comprobada", desc: "Calificacion promedio > 80%", icon: "⭐", color: "text-pink-700", bg: "bg-pink-100", ok: stats.calificacionPromedio >= 80, p: Math.min(stats.calificacionPromedio, 80), t: 80 },
    { id: "impacto", nombre: "Impacto Total", desc: "100 estudiantes capacitados", icon: "🚀", color: "text-red-700", bg: "bg-red-100", ok: stats.estudiantesCapacitados >= 100, p: Math.min(stats.estudiantesCapacitados, 100), t: 100 },
  ]
}

function getNivel(stats: FacilitadorStats) {
  const s = stats.cursosAprobados * 10 + stats.estudiantesCapacitados * 2 + (stats.calificacionPromedio / 10)
  if (s >= 200) return { n: "Leyenda", c: "from-yellow-400 to-amber-500", i: "👑", score: s, from: 200, to: 200 }
  if (s >= 100) return { n: "Experto", c: "from-purple-400 to-violet-500", i: "🏆", score: s, from: 100, to: 200 }
  if (s >= 50) return { n: "Avanzado", c: "from-blue-400 to-indigo-500", i: "⭐", score: s, from: 50, to: 100 }
  if (s >= 20) return { n: "Intermedio", c: "from-green-400 to-emerald-500", i: "📈", score: s, from: 20, to: 50 }
  if (s >= 5) return { n: "Principiante", c: "from-gray-400 to-gray-500", i: "🌱", score: s, from: 5, to: 20 }
  return { n: "Novato", c: "from-gray-300 to-gray-400", i: "📋", score: s, from: 0, to: 5 }
}

function calcRacha(fechas: string[]): { actual: number; mejor: number } {
  if (fechas.length === 0) return { actual: 0, mejor: 0 }
  const unique = [...new Set(fechas.map((f) => f.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let mejor = 0
  let actual = 0
  let racha = 1
  for (let i = 0; i < unique.length; i++) {
    if (i === 0) {
      if (unique[i] === today || unique[i] === yesterday) {
        actual = 1
      }
    } else {
      const prev = new Date(unique[i - 1])
      const curr = new Date(unique[i])
      const diff = (prev.getTime() - curr.getTime()) / 86400000
      if (diff === 1) {
        racha++
        if (unique[i - 1] === today || unique[i - 1] === yesterday) actual = racha
      } else {
        mejor = Math.max(mejor, racha)
        racha = 1
      }
    }
  }
  mejor = Math.max(mejor, racha, actual)
  return { actual, mejor }
}

function Accordion({ title, children, defaultOpen = false, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-luxor-primary/10 text-luxor-primary rounded-full">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
    </Card>
  )
}

function PerfilContent() {
  const { user, refreshUser } = useAuth()
  const supabase = createSupabaseClient()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [facStats, setFacStats] = useState<FacilitadorStats | null>(null)
  const [stuStats, setStuStats] = useState<StudentStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const fetchedRef = useRef(false)

  const [modalForm, setModalForm] = useState({ nombre: "", bio: "", newPassword: "", confirmPassword: "" })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchedRef.current = true
      setModalForm({ nombre: user.nombre || "", bio: user.bio || "", newPassword: "", confirmPassword: "" })
      if (user.avatar_url) setAvatarPreview(user.avatar_url)
      if (user.rol === "facilitador") fetchFacilitadorStats()
      else if (user.rol === "estudiante") fetchStudentStats()
      else setLoadingStats(false)
    }
  }, [user])

  async function fetchFacilitadorStats() {
    setLoadingStats(true)
    const { data: cursos } = await supabase.from("cursos").select("id, estado").eq("facilitador_id", user!.id)
    const cursoIds = cursos?.map((c) => c.id) || []
    const aprobados = cursos?.filter((c) => c.estado === "aprobado").length || 0
    const rechazados = cursos?.filter((c) => c.estado === "rechazado").length || 0
    const pendientes = cursos?.filter((c) => c.estado === "pendiente").length || 0
    let estudiantes = 0
    if (cursoIds.length > 0) {
      const { count } = await supabase.from("inscripciones").select("*", { count: "exact", head: true }).in("curso_id", cursoIds)
      estudiantes = count || 0
    }
    let calificacion = 0
    if (cursoIds.length > 0) {
      const { data: progreso } = await supabase.from("progreso_modulos").select("puntuacion").in("curso_id", cursoIds).not("puntuacion", "is", null)
      if (progreso && progreso.length > 0) calificacion = Math.round(progreso.reduce((s, p) => s + (p.puntuacion || 0), 0) / progreso.length)
    }
    setFacStats({ cursosCreados: cursos?.length || 0, cursosAprobados: aprobados, cursosRechazados: rechazados, cursosPendientes: pendientes, estudiantesCapacitados: estudiantes, calificacionPromedio: calificacion })
    setLoadingStats(false)
  }

  async function fetchStudentStats() {
    setLoadingStats(true)
    const { data: inscripciones } = await supabase.from("inscripciones").select("id, curso_id, estado, fecha_inscripcion").eq("user_id", user!.id)
    const cursoIds = inscripciones?.map((i) => i.curso_id) || []
    const cursosCompletados = inscripciones?.filter((i) => i.estado === "completada").length || 0

    let modulosCompletados = 0
    let quizzesAprobados = 0
    let calificaciones: number[] = []
    if (cursoIds.length > 0) {
      const { data: progreso } = await supabase.from("progreso_modulos").select("completado, quiz_aprobado, puntuacion").eq("user_id", user!.id)
      if (progreso) {
        modulosCompletados = progreso.filter((p) => p.completado).length
        quizzesAprobados = progreso.filter((p) => p.quiz_aprobado).length
        calificaciones = progreso.filter((p) => p.puntuacion != null).map((p) => p.puntuacion!)
      }
    }

    const calificacionPromedio = calificaciones.length > 0 ? Math.round(calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length) : 0

    let puntos = 0
    puntos += (inscripciones?.length || 0) * 10
    puntos += modulosCompletados * 20
    puntos += quizzesAprobados * 30
    puntos += cursosCompletados * 100
    if (calificacionPromedio >= 90) puntos += 50

    const { data: actividad } = await supabase.from("actividad_usuario").select("fecha").eq("user_id", user!.id).order("fecha", { ascending: false })
    const fechasActividad = actividad?.map((a) => a.fecha) || []
    const { actual, mejor } = calcRacha(fechasActividad)

    setStuStats({
      cursosInscritos: inscripciones?.length || 0,
      cursosCompletados,
      modulosCompletados,
      quizzesAprobados,
      calificacionPromedio,
      puntosTotales: puntos,
      rachaActual: actual,
      mejorRacha: mejor,
      ultimaActividad: fechasActividad.length > 0 ? fechasActividad[0] : null,
    })
    setLoadingStats(false)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError("La imagen no puede superar 2MB"); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSaveProfile() {
    if (!modalForm.nombre.trim()) return
    setSaving(true); setError(""); setSaved(false)
    let avatarUrl = user?.avatar_url || null
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() || "jpg"
      const filePath = `avatars/${user!.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type })
      if (uploadErr) { setError("Error subiendo foto: " + uploadErr.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      avatarUrl = urlData.publicUrl + "?t=" + Date.now()
    }
    const updateData: Record<string, unknown> = { nombre: modalForm.nombre, bio: modalForm.bio || null }
    if (avatarUrl) updateData.avatar_url = avatarUrl
    const { error: e } = await supabase.from("profiles").update(updateData).eq("id", user!.id)
    if (e) { setError("Error: " + e.message); setSaving(false); return }
    if (modalForm.newPassword) {
      if (modalForm.newPassword !== modalForm.confirmPassword) { setError("Las contrasenas no coinciden"); setSaving(false); return }
      if (modalForm.newPassword.length < 6) { setError("Minimo 6 caracteres"); setSaving(false); return }
      try { await updatePassword(modalForm.newPassword) } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error al cambiar contrasena"); setSaving(false); return }
    }
    setSaved(true); await refreshUser(); setSaving(false)
    setTimeout(() => { setShowModal(false); setSaved(false) }, 1200)
  }

  const rolL: Record<string, string> = { decano: "Decano", facilitador: "Facilitador", estudiante: "Estudiante" }
  const isFac = user?.rol === "facilitador"
  const isStu = user?.rol === "estudiante"
  const facBadges = facStats ? getBadges(facStats) : []
  const facNivel = facStats ? getNivel(facStats) : null
  const stuBadges = stuStats ? getStudentBadges(stuStats) : []
  const stuNivel = stuStats ? getStudentNivel(stuStats.puntosTotales) : null
  const facUnlocked = facBadges.filter((b) => b.ok).length
  const stuUnlocked = stuBadges.filter((b) => b.ok).length

  return (
    <div className="w-full space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group" onClick={() => setShowModal(true)}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                    <span className="text-luxor-primary font-bold text-5xl">{user?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.nombre}</h1>
                  <p className="text-sm text-gray-500">{rolL[user?.rol || ""]}</p>
                  {user?.cargo && <p className="text-sm text-gray-400">{user.cargo}</p>}
                </div>
                <Button onClick={() => setShowModal(true)} size="sm" variant="outline">
                  <Pencil className="w-4 h-4 mr-2" /> Editar perfil
                </Button>
              </div>
              {user?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>}

              {/* Level badge - facilitador */}
              {isFac && facNivel && (
                <div className="mt-3 max-w-xs">
                  <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${facNivel.c} text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{facNivel.i} {facNivel.n}</span>
                      <span className="text-xs opacity-80">{facNivel.score} pts</span>
                    </div>
                    {facNivel.from !== facNivel.to && (
                      <div className="mt-1.5">
                        <div className="w-full bg-white/30 rounded-full h-1">
                          <div className="h-1 rounded-full bg-white" style={{ width: `${((facNivel.score - facNivel.from) / (facNivel.to - facNivel.from)) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Level badge - estudiante */}
              {isStu && stuNivel && (
                <div className="mt-3 max-w-xs">
                  <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${stuNivel.c} text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{stuNivel.i} {stuNivel.n}</span>
                      <span className="text-xs opacity-80">{stuNivel.score} pts</span>
                    </div>
                    {stuNivel.from !== stuNivel.to && (
                      <div className="mt-1.5">
                        <div className="w-full bg-white/30 rounded-full h-1">
                          <div className="h-1 rounded-full bg-white" style={{ width: `${((stuNivel.score - stuNivel.from) / (stuNivel.to - stuNivel.from)) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          {/* Insignias */}
          {(isFac || isStu) && (
            <Accordion title="Insignias" badge={`${isFac ? facUnlocked : stuUnlocked}/${isFac ? facBadges.length : stuBadges.length}`} defaultOpen={true}>
              <div className="pt-3 flex flex-wrap gap-2">
                {(isFac ? facBadges : stuBadges).map((b) => (
                  <div key={b.id} className="relative group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-default transition-all ${b.ok ? `${b.bg} shadow-sm` : "bg-gray-100 opacity-40 grayscale"}`}>
                      {b.icon}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      <p className="font-semibold">{b.nombre}</p>
                      <p className="opacity-75 mt-0.5">{b.desc}</p>
                      <div className="mt-1.5">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div className={`h-1 rounded-full ${b.ok ? "bg-green-400" : "bg-gray-500"}`} style={{ width: `${(b.p / b.t) * 100}%` }} />
                        </div>
                        <p className="opacity-60 mt-0.5">{b.p}/{b.t}</p>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Estudiante - Stats */}
          {isStu && (
            loadingStats ? (
              <Card><CardContent><div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></div></CardContent></Card>
            ) : stuStats && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Puntos", value: stuStats.puntosTotales, icon: <Zap className="w-5 h-5" />, color: "from-amber-400 to-orange-500", textColor: "text-amber-700" },
                    { label: "Racha", value: `${stuStats.rachaActual}d`, icon: <Flame className="w-5 h-5" />, color: "from-red-400 to-orange-500", textColor: "text-red-700" },
                    { label: "Promedio", value: `${stuStats.calificacionPromedio}%`, icon: <Target className="w-5 h-5" />, color: "from-blue-400 to-indigo-500", textColor: "text-blue-700" },
                    { label: "Cursos", value: `${stuStats.cursosCompletados}/${stuStats.cursosInscritos}`, icon: <BookOpen className="w-5 h-5" />, color: "from-green-400 to-emerald-500", textColor: "text-green-700" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mx-auto mb-2`}>
                        {stat.icon}
                      </div>
                      <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Progreso Total</h3>
                      <span className="text-xs text-gray-500">{stuStats.modulosCompletados} modulos completados</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-luxor-primary to-luxor-accent transition-all duration-500"
                        style={{ width: `${stuStats.cursosInscritos > 0 ? Math.round((stuStats.cursosCompletados / stuStats.cursosInscritos) * 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{stuStats.cursosCompletados} cursos completados</span>
                      <span>{stuStats.quizzesAprobados} quizzes aprobados</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Streak Visual */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-semibold text-gray-700">Racha de Actividad</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-500">{stuStats.rachaActual}</p>
                        <p className="text-xs text-gray-500">dias actual</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>Mejor racha: {stuStats.mejorRacha} dias</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                            style={{ width: `${Math.min((stuStats.rachaActual / 30) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Meta: 30 dias para insignia Leyenda</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          )}

          {/* Facilitador - Stats */}
          {isFac && (
            loadingStats ? (
              <Card><CardContent><div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></div></CardContent></Card>
            ) : facStats && (
              <Accordion title="Estadisticas" defaultOpen={true}>
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Cursos</h3>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-luxor-primary" />Creados</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Aprobados</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Rechazados</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Pendientes</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: "Creados", value: facStats.cursosCreados },
                          { name: "Aprobados", value: facStats.cursosAprobados },
                          { name: "Rechazados", value: facStats.cursosRechazados },
                          { name: "Pendientes", value: facStats.cursosPendientes },
                        ]}>
                          <defs>
                            <linearGradient id="gradCursos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#28315F" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#28315F" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#28315F" strokeWidth={2} fill="url(#gradCursos)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-36 shrink-0 space-y-3">
                      {[
                        { label: "Estudiantes", value: facStats.estudiantesCapacitados, icon: "👥", color: "bg-violet-50 text-violet-700" },
                        { label: "Calificacion", value: facStats.calificacionPromedio + "%", icon: "⭐", color: "bg-pink-50 text-pink-700" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                          <div className="text-xl mb-1">{s.icon}</div>
                          <div className="text-xl font-bold">{s.value}</div>
                          <div className="text-xs opacity-75">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Accordion>
            )
          )}

          {/* Decano - simple info */}
          {!isFac && !isStu && (
            <Accordion title="Mi informacion" defaultOpen={true}>
              <div className="pt-4 flex flex-col items-center py-4 text-center">
                <div className="w-16 h-16 bg-luxor-primary/10 rounded-full flex items-center justify-center mb-3"><span className="text-3xl">👤</span></div>
                <h2 className="text-lg font-semibold text-gray-900">{user?.nombre}</h2>
                <p className="text-sm text-gray-500">{rolL[user?.rol || ""]}</p>
              </div>
            </Accordion>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Editar perfil</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                  ) : (
                    <div className="w-28 h-28 bg-luxor-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-luxor-primary font-bold text-4xl">{modalForm.nombre?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-gray-400 mt-2">Maximo 2MB</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Nombre</label>
                <input type="text" value={modalForm.nombre} onChange={(e) => setModalForm({ ...modalForm, nombre: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Presentacion</label>
                <textarea value={modalForm.bio} onChange={(e) => setModalForm({ ...modalForm, bio: e.target.value.slice(0, 500) })} rows={3} placeholder="Cuentanos sobre ti..." className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none" />
                <p className={`text-xs text-right ${modalForm.bio.length >= 500 ? "text-red-500" : "text-gray-400"}`}>{modalForm.bio.length}/500</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Cambiar contrasena (opcional)</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-500">Nueva contrasena</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={modalForm.newPassword} onChange={(e) => setModalForm({ ...modalForm, newPassword: e.target.value })} placeholder="Minimo 6 caracteres" className="w-full px-3 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-500">Confirmar contrasena</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} value={modalForm.confirmPassword} onChange={(e) => setModalForm({ ...modalForm, confirmPassword: e.target.value })} placeholder="Repite la contrasena" className="w-full px-3 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                </div>
              </div>
              {error && <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs"><AlertCircle className="w-3 h-3" />{error}</div>}
              {saved && <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs"><CheckCircle2 className="w-3 h-3" />Guardado correctamente</div>}
              <div className="flex gap-3">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1" size="sm">Cancelar</Button>
                <Button onClick={handleSaveProfile} disabled={saving || !modalForm.nombre.trim()} className="flex-1" size="sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PerfilPage() {
  return <ProtectedRoute><PerfilContent /></ProtectedRoute>
}
