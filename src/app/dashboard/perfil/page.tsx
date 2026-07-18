"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { updatePassword } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { User, Loader2, CheckCircle2, AlertCircle, Camera, X, Eye, EyeOff, ChevronDown, ChevronUp, Pencil, Flame, Target, BookOpen, Award, Star, TrendingUp, Trophy, Zap, Calendar } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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
  xp: number
}

function getStudentBadges(stats: StudentStats): Badge[] {
  return [
    { id: "primera-inscripcion", nombre: "Primera Inscripcion", desc: "Te inscribiste en tu primer curso", icon: "📋", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosInscritos >= 1, p: Math.min(stats.cursosInscritos, 1), t: 1, xp: 10 },
    { id: "estudiante-activo", nombre: "Estudiante Activo", desc: "Inscrito en 3 cursos", icon: "📚", color: "text-indigo-700", bg: "bg-indigo-100", ok: stats.cursosInscritos >= 3, p: Math.min(stats.cursosInscritos, 3), t: 3, xp: 30 },
    { id: "explorador", nombre: "Explorador", desc: "Inscrito en 5 cursos", icon: "🔍", color: "text-violet-700", bg: "bg-violet-100", ok: stats.cursosInscritos >= 5, p: Math.min(stats.cursosInscritos, 5), t: 5, xp: 50 },
    { id: "primera-finalizacion", nombre: "Primera Finalizacion", desc: "Completaste tu primer curso", icon: "🎯", color: "text-green-700", bg: "bg-green-100", ok: stats.cursosCompletados >= 1, p: Math.min(stats.cursosCompletados, 1), t: 1, xp: 100 },
    { id: "estudiante-dedicado", nombre: "Estudiante Dedicado", desc: "Completaste 3 cursos", icon: "🏅", color: "text-amber-700", bg: "bg-amber-100", ok: stats.cursosCompletados >= 3, p: Math.min(stats.cursosCompletados, 3), t: 3, xp: 300 },
    { id: "maestro-conocimiento", nombre: "Maestro del Conocimiento", desc: "Completaste 5 cursos", icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.cursosCompletados >= 5, p: Math.min(stats.cursosCompletados, 5), t: 5, xp: 500 },
    { id: "quiz-master", nombre: "Quiz Master", desc: "Aprobaste 5 quizzes", icon: "🧠", color: "text-cyan-700", bg: "bg-cyan-100", ok: stats.quizzesAprobados >= 5, p: Math.min(stats.quizzesAprobados, 5), t: 5, xp: 150 },
    { id: "excelencia-academica", nombre: "Excelencia Academica", desc: "Promedio mayor a 90%", icon: "💎", color: "text-purple-700", bg: "bg-purple-100", ok: stats.calificacionPromedio >= 90, p: Math.min(stats.calificacionPromedio, 90), t: 90, xp: 200 },
    { id: "calidad-comprobada", nombre: "Calidad Comprobada", desc: "Promedio mayor a 80%", icon: "⭐", color: "text-pink-700", bg: "bg-pink-100", ok: stats.calificacionPromedio >= 80, p: Math.min(stats.calificacionPromedio, 80), t: 80, xp: 100 },
    { id: "racha-fuego", nombre: "Racha de Fuego", desc: "7 dias consecutivos", icon: "🔥", color: "text-orange-700", bg: "bg-orange-100", ok: stats.rachaActual >= 7 || stats.mejorRacha >= 7, p: Math.min(stats.mejorRacha, 7), t: 7, xp: 70 },
    { id: "imparable", nombre: "Imparable", desc: "14 dias consecutivos", icon: "⚡", color: "text-red-700", bg: "bg-red-100", ok: stats.rachaActual >= 14 || stats.mejorRacha >= 14, p: Math.min(stats.mejorRacha, 14), t: 14, xp: 140 },
    { id: "leyenda", nombre: "Leyenda", desc: "30 dias consecutivos", icon: "👑", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.rachaActual >= 30 || stats.mejorRacha >= 30, p: Math.min(stats.mejorRacha, 30), t: 30, xp: 300 },
  ]
}

function getStudentNivel(badges: Badge[]) {
  const totalXP = badges.reduce((sum, b) => sum + b.xp, 0)
  const earnedXP = badges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const percentage = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  
  if (percentage >= 95) return { n: "Leyenda", bg: "bg-yellow-500", bar: "from-yellow-400 to-amber-500", i: "👑", score: earnedXP, from: Math.floor(totalXP * 0.95), to: totalXP, pct: percentage, frame: "from-yellow-400 via-amber-500 to-orange-400", glow: "shadow-yellow-500/50" }
  if (percentage >= 60) return { n: "Experto", bg: "bg-purple-500", bar: "from-purple-400 to-violet-500", i: "🏆", score: earnedXP, from: Math.floor(totalXP * 0.60), to: Math.floor(totalXP * 0.95), pct: percentage, frame: "from-purple-400 via-violet-500 to-purple-400", glow: "shadow-purple-500/50" }
  if (percentage >= 30) return { n: "Avanzado", bg: "bg-blue-500", bar: "from-blue-400 to-indigo-500", i: "⭐", score: earnedXP, from: Math.floor(totalXP * 0.30), to: Math.floor(totalXP * 0.60), pct: percentage, frame: "from-blue-400 via-indigo-500 to-blue-400", glow: "shadow-blue-500/50" }
  if (percentage >= 10) return { n: "Intermedio", bg: "bg-green-500", bar: "from-green-400 to-emerald-500", i: "📈", score: earnedXP, from: Math.floor(totalXP * 0.10), to: Math.floor(totalXP * 0.30), pct: percentage, frame: "from-green-400 via-emerald-500 to-green-400", glow: "shadow-green-500/50" }
  if (percentage >= 1.8) return { n: "Principiante", bg: "bg-gray-500", bar: "from-gray-400 to-gray-500", i: "🌱", score: earnedXP, from: Math.floor(totalXP * 0.018), to: Math.floor(totalXP * 0.10), pct: percentage, frame: "from-gray-400 via-gray-500 to-gray-400", glow: "shadow-gray-400/30" }
  return { n: "Novato", bg: "bg-gray-400", bar: "from-gray-300 to-gray-400", i: "📋", score: earnedXP, from: 0, to: Math.floor(totalXP * 0.018), pct: percentage, frame: "from-gray-300 via-gray-400 to-gray-300", glow: "shadow-gray-300/20" }
}

function getBadges(stats: FacilitadorStats): Badge[] {
  return [
    { id: "primer-curso", nombre: "Primer Curso", desc: "Creaste tu primer curso", icon: "📘", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosCreados >= 1, p: Math.min(stats.cursosCreados, 1), t: 1, xp: 10 },
    { id: "creador-activo", nombre: "Creador Activo", desc: "Creaste 5 cursos", icon: "📚", color: "text-indigo-700", bg: "bg-indigo-100", ok: stats.cursosCreados >= 5, p: Math.min(stats.cursosCreados, 5), t: 5, xp: 50 },
    { id: "maestro-creador", nombre: "Maestro Creador", desc: "Creaste 10 cursos", icon: "🎓", color: "text-violet-700", bg: "bg-violet-100", ok: stats.cursosCreados >= 10, p: Math.min(stats.cursosCreados, 10), t: 10, xp: 100 },
    { id: "primera-aprobacion", nombre: "Primera Aprobacion", desc: "Tu primer curso fue aprobado", icon: "✅", color: "text-green-700", bg: "bg-green-100", ok: stats.cursosAprobados >= 1, p: Math.min(stats.cursosAprobados, 1), t: 1, xp: 10 },
    { id: "instructor-cert", nombre: "Instructor Certificado", desc: "5 cursos aprobados", icon: "🏅", color: "text-amber-700", bg: "bg-amber-100", ok: stats.cursosAprobados >= 5, p: Math.min(stats.cursosAprobados, 5), t: 5, xp: 50 },
    { id: "maestro-instructor", nombre: "Maestro Instructor", desc: "10 cursos aprobados", icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-100", ok: stats.cursosAprobados >= 10, p: Math.min(stats.cursosAprobados, 10), t: 10, xp: 100 },
    { id: "primer-estudiante", nombre: "Primer Estudiante", desc: "1 estudiante inscrito", icon: "👤", color: "text-cyan-700", bg: "bg-cyan-100", ok: stats.estudiantesCapacitados >= 1, p: Math.min(stats.estudiantesCapacitados, 1), t: 1, xp: 10 },
    { id: "mentor-activo", nombre: "Mentor Activo", desc: "10 estudiantes capacitados", icon: "👥", color: "text-teal-700", bg: "bg-teal-100", ok: stats.estudiantesCapacitados >= 10, p: Math.min(stats.estudiantesCapacitados, 10), t: 10, xp: 100 },
    { id: "lider-aprendizaje", nombre: "Lider de Aprendizaje", desc: "50 estudiantes capacitados", icon: "🌟", color: "text-orange-700", bg: "bg-orange-100", ok: stats.estudiantesCapacitados >= 50, p: Math.min(stats.estudiantesCapacitados, 50), t: 50, xp: 500 },
    { id: "excelencia", nombre: "Excelencia Academica", desc: "Calificacion promedio > 90%", icon: "💎", color: "text-purple-700", bg: "bg-purple-100", ok: stats.calificacionPromedio >= 90, p: Math.min(stats.calificacionPromedio, 90), t: 90, xp: 200 },
    { id: "calidad", nombre: "Calidad Comprobada", desc: "Calificacion promedio > 80%", icon: "⭐", color: "text-pink-700", bg: "bg-pink-100", ok: stats.calificacionPromedio >= 80, p: Math.min(stats.calificacionPromedio, 80), t: 80, xp: 100 },
    { id: "impacto", nombre: "Impacto Total", desc: "100 estudiantes capacitados", icon: "🚀", color: "text-red-700", bg: "bg-red-100", ok: stats.estudiantesCapacitados >= 100, p: Math.min(stats.estudiantesCapacitados, 100), t: 100, xp: 1000 },
  ]
}

function getNivel(badges: Badge[]) {
  const totalXP = badges.reduce((sum, b) => sum + b.xp, 0)
  const earnedXP = badges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const percentage = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  
  if (percentage >= 95) return { n: "Leyenda", bg: "bg-yellow-500", bar: "from-yellow-400 to-amber-500", i: "👑", score: earnedXP, from: Math.floor(totalXP * 0.95), to: totalXP, pct: percentage, frame: "from-yellow-400 via-amber-500 to-orange-400", glow: "shadow-yellow-500/50" }
  if (percentage >= 60) return { n: "Experto", bg: "bg-purple-500", bar: "from-purple-400 to-violet-500", i: "🏆", score: earnedXP, from: Math.floor(totalXP * 0.60), to: Math.floor(totalXP * 0.95), pct: percentage, frame: "from-purple-400 via-violet-500 to-purple-400", glow: "shadow-purple-500/50" }
  if (percentage >= 30) return { n: "Avanzado", bg: "bg-blue-500", bar: "from-blue-400 to-indigo-500", i: "⭐", score: earnedXP, from: Math.floor(totalXP * 0.30), to: Math.floor(totalXP * 0.60), pct: percentage, frame: "from-blue-400 via-indigo-500 to-blue-400", glow: "shadow-blue-500/50" }
  if (percentage >= 10) return { n: "Intermedio", bg: "bg-green-500", bar: "from-green-400 to-emerald-500", i: "📈", score: earnedXP, from: Math.floor(totalXP * 0.10), to: Math.floor(totalXP * 0.30), pct: percentage, frame: "from-green-400 via-emerald-500 to-green-400", glow: "shadow-green-500/50" }
  if (percentage >= 1.8) return { n: "Principiante", bg: "bg-gray-500", bar: "from-gray-400 to-gray-500", i: "🌱", score: earnedXP, from: Math.floor(totalXP * 0.018), to: Math.floor(totalXP * 0.10), pct: percentage, frame: "from-gray-400 via-gray-500 to-gray-400", glow: "shadow-gray-400/30" }
  return { n: "Novato", bg: "bg-gray-400", bar: "from-gray-300 to-gray-400", i: "📋", score: earnedXP, from: 0, to: Math.floor(totalXP * 0.018), pct: percentage, frame: "from-gray-300 via-gray-400 to-gray-300", glow: "shadow-gray-300/20" }
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
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [godMode, setGodMode] = useState(false)
  const [godModeCollapsed, setGodModeCollapsed] = useState(false)
  const [simulatedRole, setSimulatedRole] = useState<"facilitador" | "estudiante">("facilitador")
  const [simulatedStudentStats, setSimulatedStudentStats] = useState({
    rachaActual: 0,
    mejorRacha: 0,
    calificacionPromedio: 0,
    cursosInscritos: 0,
    cursosCompletados: 0,
    modulosCompletados: 0,
    quizzesAprobados: 0,
  })
  const [simulatedFacStats, setSimulatedFacStats] = useState({
    estudiantesCapacitados: 0,
    calificacionPromedio: 0,
    cursosCreados: 0,
    cursosAprobados: 0,
    cursosPendientes: 0,
    cursosRechazados: 0,
  })
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".badge-container")) {
        setSelectedBadge(null)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  async function fetchFacilitadorStats() {
    setLoadingStats(true)
    const { data: cursos } = await supabase.from("cursos").select("id, estado").eq("facilitador_id", user!.id)
    const cursoIds = (cursos || []).map((c: { id: string }) => c.id)
    const aprobados = (cursos || []).filter((c: { estado: string }) => c.estado === "aprobado").length
    const rechazados = (cursos || []).filter((c: { estado: string }) => c.estado === "rechazado").length
    const pendientes = (cursos || []).filter((c: { estado: string }) => c.estado === "pendiente").length
    let estudiantes = 0
    if (cursoIds.length > 0) {
      const { count } = await supabase.from("inscripciones").select("*", { count: "exact", head: true }).in("curso_id", cursoIds)
      estudiantes = count || 0
    }
    let calificacion = 0
    if (cursoIds.length > 0 && estudiantes > 0) {
      const { data: opiniones } = await supabase.from("opiniones").select("calificacion").in("curso_id", cursoIds)
      if (opiniones && opiniones.length > 0) {
        const sumaEstrellas = opiniones.reduce((sum: number, o: { calificacion: number }) => sum + o.calificacion, 0)
        const maxPosible = estudiantes * 5
        calificacion = Math.round((sumaEstrellas / maxPosible) * 100)
      }
    }
    setFacStats({ cursosCreados: cursos?.length || 0, cursosAprobados: aprobados, cursosRechazados: rechazados, cursosPendientes: pendientes, estudiantesCapacitados: estudiantes, calificacionPromedio: calificacion })
    setLoadingStats(false)
  }

  async function fetchStudentStats() {
    setLoadingStats(true)
    const { data: inscripciones } = await supabase.from("inscripciones").select("id, curso_id, estado, fecha_inscripcion").eq("user_id", user!.id)
    const cursoIds = (inscripciones || []).map((i: { curso_id: string }) => i.curso_id)
    const cursosCompletados = (inscripciones || []).filter((i: { estado: string }) => i.estado === "completada").length

    let modulosCompletados = 0
    let quizzesAprobados = 0
    let calificaciones: number[] = []
    if (cursoIds.length > 0) {
      const { data: progreso } = await supabase.from("progreso_modulos").select("completado, quiz_aprobado, puntuacion").eq("user_id", user!.id)
      if (progreso) {
        modulosCompletados = progreso.filter((p: { completado: boolean }) => p.completado).length
        quizzesAprobados = progreso.filter((p: { quiz_aprobado: boolean }) => p.quiz_aprobado).length
        calificaciones = progreso.filter((p: { puntuacion?: number | null }) => p.puntuacion != null).map((p: { puntuacion?: number | null }) => p.puntuacion!)
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
    const fechasActividad = (actividad || []).map((a: { fecha: string }) => a.fecha)
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

  const rolL: Record<string, string> = { decano: "Decano", developer: "Developer", facilitador: "Facilitador", estudiante: "Estudiante" }
  const isFac = user?.rol === "facilitador"
  const isStu = user?.rol === "estudiante"
  const isDev = user?.rol === "developer"
  
  // Calcular estadísticas para insignias (reales o simuladas)
  const effectiveFacStats = isDev && godMode 
    ? simulatedFacStats 
    : facStats || { cursosCreados: 0, cursosAprobados: 0, cursosRechazados: 0, cursosPendientes: 0, estudiantesCapacitados: 0, calificacionPromedio: 0 }
  
  const effectiveStuStats = isDev && godMode
    ? { ...simulatedStudentStats, puntosTotales: 0, ultimaActividad: null }
    : stuStats || { cursosInscritos: 0, cursosCompletados: 0, modulosCompletados: 0, quizzesAprobados: 0, calificacionPromedio: 0, puntosTotales: 0, rachaActual: 0, mejorRacha: 0, ultimaActividad: null }
  
  // En Modo Dios, calcular insignias automáticamente según datos simulados
  let facBadges = getBadges(effectiveFacStats)
  let stuBadges = getStudentBadges(effectiveStuStats)
  
  // Si NO está en Modo Dios, usar las insignias reales
  if (!isDev || !godMode) {
    facBadges = facStats ? getBadges(facStats) : []
    stuBadges = stuStats ? getStudentBadges(stuStats) : []
  }
  
  const facNivel = getNivel(facBadges)
  const stuNivel = getStudentNivel(stuBadges)
  const facUnlocked = facBadges.filter((b) => b.ok).length
  const stuUnlocked = stuBadges.filter((b) => b.ok).length

  return (
    <div className="w-full space-y-4">
      {/* God Mode Switch - Solo para Developer */}
      {isDev && (
        <Card>
          <CardContent className={godModeCollapsed ? "p-3" : "p-4"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setGodModeCollapsed(!godModeCollapsed)} className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Modo Dios</h3>
                    {godMode && godModeCollapsed && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
                        {simulatedRole === "facilitador" ? "Facilitador" : "Estudiante"}
                      </span>
                    )}
                  </div>
                  {!godModeCollapsed && <p className="text-xs text-gray-500">Simula marcos e insignias</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setGodModeCollapsed(!godModeCollapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  {godModeCollapsed ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={() => setGodMode(!godMode)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${godMode ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${godMode ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            {godMode && !godModeCollapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Simular como:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSimulatedRole("facilitador")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${simulatedRole === "facilitador" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      Facilitador
                    </button>
                    <button
                      onClick={() => setSimulatedRole("estudiante")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${simulatedRole === "estudiante" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      Estudiante
                    </button>
                  </div>
                </div>

                {simulatedRole === "estudiante" && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Estadísticas de Estudiante</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Racha actual</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.rachaActual}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, rachaActual: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Mejor racha</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.mejorRacha}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, mejorRacha: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Promedio %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={simulatedStudentStats.calificacionPromedio}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, calificacionPromedio: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Cursos inscritos</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.cursosInscritos}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, cursosInscritos: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Cursos completados</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.cursosCompletados}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, cursosCompletados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Módulos</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.modulosCompletados}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, modulosCompletados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Quizzes</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedStudentStats.quizzesAprobados}
                          onChange={(e) => setSimulatedStudentStats({ ...simulatedStudentStats, quizzesAprobados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {simulatedRole === "facilitador" && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Estadísticas de Facilitador</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Estudiantes</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedFacStats.estudiantesCapacitados}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, estudiantesCapacitados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Calificación %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={simulatedFacStats.calificacionPromedio}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, calificacionPromedio: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Cursos creados</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedFacStats.cursosCreados}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, cursosCreados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Aprobados</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedFacStats.cursosAprobados}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, cursosAprobados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Pendientes</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedFacStats.cursosPendientes}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, cursosPendientes: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Rechazados</label>
                        <input
                          type="number"
                          min="0"
                          value={simulatedFacStats.cursosRechazados}
                          onChange={(e) => setSimulatedFacStats({ ...simulatedFacStats, cursosRechazados: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">Las insignias se marcan automáticamente según los datos simulados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {(isFac && facNivel) || (isStu && stuNivel) || (isDev && godMode && (simulatedRole === "facilitador" ? facNivel : stuNivel)) ? (
                <div className={`p-1.5 rounded-full bg-gradient-to-br ${
                  isDev && godMode 
                    ? (simulatedRole === "facilitador" ? facNivel?.frame : stuNivel?.frame)
                    : (isFac ? facNivel?.frame : stuNivel?.frame)
                } ${
                  isDev && godMode 
                    ? (simulatedRole === "facilitador" ? facNivel?.glow : stuNivel?.glow)
                    : (isFac ? facNivel?.glow : stuNivel?.glow)
                } shadow-lg`}>
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-white overflow-hidden cursor-pointer group" onClick={() => setShowModal(true)}>
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
              ) : (
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
              )}
              {(isFac && facNivel) && !godMode && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <span className="text-xl">{facNivel.i}</span>
                </div>
              )}
              {(isStu && stuNivel) && !godMode && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <span className="text-xl">{stuNivel.i}</span>
                </div>
              )}
              {isDev && godMode && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <span className="text-xl">{simulatedRole === "facilitador" ? facNivel?.i : stuNivel?.i}</span>
                </div>
              )}
            </div>

            {/* Texto + Botón */}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{user?.nombre}</h1>
              <p className="text-sm text-gray-500">{rolL[user?.rol || ""]}</p>
              {user?.cargo && <p className="text-sm text-gray-400">{user.cargo}</p>}
              {user?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>}
              <div className="mt-3">
                <Button onClick={() => setShowModal(true)} size="sm" variant="outline">
                  <Pencil className="w-4 h-4 mr-2" /> Editar perfil
                </Button>
              </div>
            </div>

            {/* Level badge - tarjeta a la derecha */}
            {((isFac || (isDev && godMode && simulatedRole === "facilitador")) && facNivel) || ((isStu || (isDev && godMode && simulatedRole === "estudiante")) && stuNivel) ? (
              <div className={`w-52 rounded-xl p-4 ${isDev && godMode ? "bg-purple-50/50 border border-purple-200" : "bg-gray-50 border border-gray-200"}`}>
                {(() => {
                  const nivel = isDev && godMode 
                    ? (simulatedRole === "facilitador" ? facNivel : stuNivel)
                    : (isFac ? facNivel : stuNivel)
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{nivel?.i}</span>
                        <span className="text-sm font-semibold text-gray-900">{nivel?.n}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${isDev && godMode ? "text-purple-600" : "text-gray-500"}`}>
                          {isDev && godMode ? "Simulación" : "Puntos"}
                        </span>
                        <span className={`text-xs font-bold ${isDev && godMode ? "text-purple-600" : "text-gray-700"}`}>
                          {nivel?.pct.toFixed(1)}%
                        </span>
                      </div>
                      {nivel?.from !== nivel?.to && (
                        <div className="w-full">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full bg-gradient-to-r ${nivel?.bar}`} style={{ width: `${((nivel!.score - nivel!.from) / (nivel!.to - nivel!.from)) * 100}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-400">{nivel?.from}</span>
                            <span className="text-[10px] text-gray-400">{nivel?.to}</span>
                          </div>
                        </div>
                      )}
                      {isDev && godMode && (
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-[10px] text-purple-600 font-medium">⚡ Modo Dios</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          {/* Insignias */}
          {(isFac || isStu || (isDev && godMode)) && (
            <Accordion title="Insignias" badge={`${isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.filter(b => b.ok).length : stuBadges.filter(b => b.ok).length) : isFac ? facUnlocked : stuUnlocked}/${isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.length : stuBadges.length) : isFac ? facBadges.length : stuBadges.length}`} defaultOpen={true}>
              <div className="badge-container pt-3 flex flex-wrap gap-2">
                {(isDev && godMode ? (simulatedRole === "facilitador" ? facBadges : stuBadges) : isFac ? facBadges : stuBadges).map((b) => (
                  <div key={b.id} className="relative group">
                    <button
                      onClick={() => {
                        if (!(isDev && godMode)) {
                          setSelectedBadge(selectedBadge === b.id ? null : b.id)
                        }
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                        b.ok 
                          ? `${b.bg} shadow-sm` 
                          : "bg-gray-100 opacity-40 grayscale"
                      } ${isDev && godMode ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {b.icon}
                    </button>
                    {/* Tooltip desktop (hover) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden sm:block">
                      <p className="font-semibold">{b.nombre}</p>
                      <p className="opacity-75 mt-0.5">{b.desc}</p>
                      <div className="mt-1.5">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div className={`h-1 rounded-full ${b.ok ? "bg-green-400" : "bg-gray-500"}`} style={{ width: `${(b.p / b.t) * 100}%` }} />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <p className="opacity-60">{b.p}/{b.t}</p>
                          <p className="opacity-60">+{b.xp} XP</p>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                    {/* Tooltip móvil (tap) - solo si no está en modo Dios */}
                    {selectedBadge === b.id && !godMode && (
                      <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setSelectedBadge(null)}>
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                          <p className="font-semibold">{b.nombre}</p>
                          <p className="opacity-75 mt-0.5">{b.desc}</p>
                          <div className="mt-2">
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${b.ok ? "bg-green-400" : "bg-gray-500"}`} style={{ width: `${(b.p / b.t) * 100}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="opacity-60 text-[10px]">{b.p}/{b.t}</p>
                              <p className="opacity-60 text-[10px]">+{b.xp} XP</p>
                            </div>
                            <p className="opacity-60 mt-1 text-[10px]">
                              {b.ok ? "¡Insignia desbloqueada!" : `${b.t - b.p} más para desbloquear`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Accordion>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Estudiante - Stats */}
          {(isStu || (isDev && godMode && simulatedRole === "estudiante")) && (
            loadingStats && !isDev ? (
              <Card><CardContent><div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></div></CardContent></Card>
            ) : (stuStats || isDev) && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(() => {
                    const stats = isDev && godMode ? {
                      rachaActual: simulatedStudentStats.rachaActual,
                      mejorRacha: simulatedStudentStats.mejorRacha,
                      calificacionPromedio: simulatedStudentStats.calificacionPromedio,
                      cursosInscritos: simulatedStudentStats.cursosInscritos,
                      cursosCompletados: simulatedStudentStats.cursosCompletados,
                      modulosCompletados: simulatedStudentStats.modulosCompletados,
                      quizzesAprobados: simulatedStudentStats.quizzesAprobados,
                    } : stuStats!
                    return [
                      { label: "Puntos", value: stuNivel ? stuNivel.score : 0, icon: <Zap className="w-5 h-5" />, color: "from-amber-400 to-orange-500", textColor: "text-amber-700" },
                      { label: "Racha", value: `${stats.rachaActual}d`, icon: <Flame className="w-5 h-5" />, color: "from-red-400 to-orange-500", textColor: "text-red-700" },
                      { label: "Promedio", value: `${stats.calificacionPromedio}%`, icon: <Target className="w-5 h-5" />, color: "from-blue-400 to-indigo-500", textColor: "text-blue-700" },
                      { label: "Cursos", value: `${stats.cursosCompletados}/${stats.cursosInscritos}`, icon: <BookOpen className="w-5 h-5" />, color: "from-green-400 to-emerald-500", textColor: "text-green-700" },
                    ]
                  })().map((stat) => (
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
                    {(() => {
                      const stats = isDev && godMode ? simulatedStudentStats : stuStats!
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Progreso Total</h3>
                            <span className="text-xs text-gray-500">{stats.modulosCompletados} modulos completados</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-luxor-primary to-luxor-accent transition-all duration-500"
                              style={{ width: `${stats.cursosInscritos > 0 ? Math.round((stats.cursosCompletados / stats.cursosInscritos) * 100) : 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>{stats.cursosCompletados} cursos completados</span>
                            <span>{stats.quizzesAprobados} quizzes aprobados</span>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Activity Streak Visual */}
                <Card>
                  <CardContent className="p-4">
                    {(() => {
                      const stats = isDev && godMode ? simulatedStudentStats : stuStats!
                      return (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <h3 className="text-sm font-semibold text-gray-700">Racha de Actividad</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-orange-500">{stats.rachaActual}</p>
                              <p className="text-xs text-gray-500">dias actual</p>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Calendar className="w-3 h-3" />
                                <span>Mejor racha: {stats.mejorRacha} dias</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                                  style={{ width: `${Math.min((stats.rachaActual / 30) * 100, 100)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Meta: 30 dias para insignia Leyenda</p>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              </>
            )
          )}

          {/* Facilitador - Stats */}
          {(isFac || (isDev && godMode && simulatedRole === "facilitador")) && (
            loadingStats && !isDev ? (
              <Card><CardContent><div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></div></CardContent></Card>
            ) : (facStats || isDev) && (
              <Accordion title="Estadisticas" defaultOpen={true}>
                <div className="pt-4 space-y-4">
                  {/* Tags de métricas */}
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const stats = isDev && godMode ? simulatedFacStats : facStats!
                      return (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg">
                            <span className="text-lg">👥</span>
                            <div>
                              <div className="text-lg font-bold leading-tight">{stats.estudiantesCapacitados}</div>
                              <div className="text-xs opacity-75">Estudiantes</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg">
                            <span className="text-lg">⭐</span>
                            <div>
                              <div className="text-lg font-bold leading-tight">{stats.calificacionPromedio}%</div>
                              <div className="text-xs opacity-75">Calificación</div>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Gráfico de dona */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Aprobados", value: isDev && godMode ? simulatedFacStats.cursosAprobados : facStats!.cursosAprobados },
                              { name: "Pendientes", value: isDev && godMode ? simulatedFacStats.cursosPendientes : facStats!.cursosPendientes },
                              { name: "Rechazados", value: isDev && godMode ? simulatedFacStats.cursosRechazados : facStats!.cursosRechazados },
                            ].filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {(() => {
                        const stats = isDev && godMode ? simulatedFacStats : facStats!
                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-luxor-primary" />
                                <span className="text-gray-700">Total creados</span>
                              </span>
                              <span className="font-semibold text-gray-900">{stats.cursosCreados}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-gray-700">Aprobados</span>
                              </span>
                              <span className="font-semibold text-green-600">{stats.cursosAprobados}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-gray-700">Pendientes</span>
                              </span>
                              <span className="font-semibold text-amber-600">{stats.cursosPendientes}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-gray-700">Rechazados</span>
                              </span>
                              <span className="font-semibold text-red-600">{stats.cursosRechazados}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </Accordion>
            )
          )}

          {/* Decano - simple info */}
          {!isFac && !isStu && !(isDev && godMode) && (
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
