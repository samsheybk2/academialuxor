"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { updatePassword } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { User, Loader2, CheckCircle2, AlertCircle, Camera, X, Eye, EyeOff, ChevronDown, ChevronUp, Pencil, Flame, Target, BookOpen, Award, Star, TrendingUp, Trophy, Zap, Calendar, Users } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

function CompositeAvatar({
  frameUrl,
  avatarSrc,
  initials,
  x,
  y,
  tamano,
  frameTamano,
  avatarDelante,
  onClick,
}: {
  frameUrl: string
  avatarSrc: string | null
  initials: string
  x: number
  y: number
  tamano: number
  frameTamano: number
  avatarDelante: boolean
  onClick: () => void
}) {
  const sizePercent = `${tamano}%`
  const frameScale = `${frameTamano}%`
  const frameZ = avatarDelante ? 10 : 20
  const avatarZ = avatarDelante ? 20 : 10
  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      <div className="w-40 h-40 sm:w-36 sm:h-36 relative">
        <img src={frameUrl} alt="" className="absolute pointer-events-none" style={{ zIndex: frameZ, left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: frameScale, height: frameScale, maxWidth: "none", maxHeight: "none", objectFit: "contain" }} />
        <div
          className="absolute rounded-full bg-white overflow-hidden"
          style={{
            zIndex: avatarZ,
            left: `${x}%`,
            top: `${y}%`,
            width: sizePercent,
            height: sizePercent,
            transform: "translate(-50%, -50%)",
          }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
              <span className="text-luxor-primary font-bold text-3xl">{initials}</span>
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Camera className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </div>
  )
}

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
  imagen_url?: string | null
  color: string
  bg: string
  ok: boolean
  p: number
  t: number
  xp: number
  categoria_nombre?: string
  categoria_color?: string
  categoria_icono?: string
  created_at?: string
}

interface DbInsignia {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  rol: string
  categoria_id: string | null
  min_cursos_creados: number
  min_cursos_aprobados: number
  min_estudiantes_capacitados: number
  min_calificacion_promedio: number
  min_cursos_inscritos: number
  min_cursos_completados: number
  min_modulos_completados: number
  min_quizzes_aprobados: number
  min_racha_dias: number
  xp: number
  color: string
  activa: boolean
  created_at: string
}

interface DbCategoria {
  id: string
  nombre: string
  color: string
  icono: string
}

function evaluateFacilitadorBadge(ins: DbInsignia, stats: FacilitadorStats): { ok: boolean; progress: number; total: number } {
  const checks: { current: number; min: number }[] = []
  if (ins.min_cursos_creados > 0) checks.push({ current: stats.cursosCreados, min: ins.min_cursos_creados })
  if (ins.min_cursos_aprobados > 0) checks.push({ current: stats.cursosAprobados, min: ins.min_cursos_aprobados })
  if (ins.min_estudiantes_capacitados > 0) checks.push({ current: stats.estudiantesCapacitados, min: ins.min_estudiantes_capacitados })
  if (ins.min_calificacion_promedio > 0) checks.push({ current: stats.calificacionPromedio, min: ins.min_calificacion_promedio })
  if (checks.length === 0) return { ok: false, progress: 0, total: 0 }
  const progress = checks.reduce((sum, c) => sum + Math.min(c.current, c.min), 0)
  const total = checks.reduce((sum, c) => sum + c.min, 0)
  const ok = checks.every((c) => c.current >= c.min)
  return { ok, progress, total }
}

function evaluateEstudianteBadge(ins: DbInsignia, stats: StudentStats): { ok: boolean; progress: number; total: number } {
  const checks: { current: number; min: number }[] = []
  if (ins.min_cursos_inscritos > 0) checks.push({ current: stats.cursosInscritos, min: ins.min_cursos_inscritos })
  if (ins.min_cursos_completados > 0) checks.push({ current: stats.cursosCompletados, min: ins.min_cursos_completados })
  if (ins.min_modulos_completados > 0) checks.push({ current: stats.modulosCompletados, min: ins.min_modulos_completados })
  if (ins.min_quizzes_aprobados > 0) checks.push({ current: stats.quizzesAprobados, min: ins.min_quizzes_aprobados })
  if (ins.min_racha_dias > 0) checks.push({ current: stats.mejorRacha, min: ins.min_racha_dias })
  if (ins.min_calificacion_promedio > 0) checks.push({ current: stats.calificacionPromedio, min: ins.min_calificacion_promedio })
  if (checks.length === 0) return { ok: false, progress: 0, total: 0 }
  const progress = checks.reduce((sum, c) => sum + Math.min(c.current, c.min), 0)
  const total = checks.reduce((sum, c) => sum + c.min, 0)
  const ok = checks.every((c) => c.current >= c.min)
  return { ok, progress, total }
}

function getDbFacilitadorBadges(insignias: DbInsignia[], stats: FacilitadorStats, categorias: DbCategoria[]): Badge[] {
  return insignias.filter(i => i.activa && (i.rol === "facilitador" || i.rol === "ambos")).map((ins) => {
    const { ok, progress, total } = evaluateFacilitadorBadge(ins, stats)
    const cat = categorias.find(c => c.id === ins.categoria_id)
    return {
      id: ins.id,
      nombre: ins.nombre,
      desc: ins.descripcion || ins.nombre,
      icon: "",
      imagen_url: ins.imagen_url,
      color: `text-[${ins.color}]`,
      bg: `bg-[${ins.color}]/15`,
      ok,
      p: progress,
      t: total,
      xp: ins.xp,
      categoria_nombre: cat?.nombre,
      categoria_color: cat?.color,
      categoria_icono: cat?.icono,
      created_at: ins.created_at,
    }
  })
}

function getDbEstudianteBadges(insignias: DbInsignia[], stats: StudentStats, categorias: DbCategoria[]): Badge[] {
  return insignias.filter(i => i.activa && (i.rol === "estudiante" || i.rol === "ambos")).map((ins) => {
    const { ok, progress, total } = evaluateEstudianteBadge(ins, stats)
    const cat = categorias.find(c => c.id === ins.categoria_id)
    return {
      id: ins.id,
      nombre: ins.nombre,
      desc: ins.descripcion || ins.nombre,
      icon: "",
      imagen_url: ins.imagen_url,
      color: `text-[${ins.color}]`,
      bg: `bg-[${ins.color}]/15`,
      ok,
      p: progress,
      t: total,
      xp: ins.xp,
      categoria_nombre: cat?.nombre,
      categoria_color: cat?.color,
      categoria_icono: cat?.icono,
      created_at: ins.created_at,
    }
  })
}

function getStudentBadges(stats: StudentStats): Badge[] {
  return [
    { id: "primera-inscripcion", nombre: "Primera Inscripcion", desc: "Te inscribiste en tu primer curso", icon: "📋", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosInscritos >= 1, p: Math.min(stats.cursosInscritos, 1), t: 1, xp: 10 },
    { id: "estudiante-activo", nombre: "Estudiante Activo", desc: "Inscrito en 3 cursos", icon: "📚", color: "text-luxor-primary", bg: "bg-luxor-primary/10", ok: stats.cursosInscritos >= 3, p: Math.min(stats.cursosInscritos, 3), t: 3, xp: 30 },
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
  if (percentage >= 30) return { n: "Avanzado", bg: "bg-blue-500", bar: "from-blue-400 to-luxor-primary", i: "⭐", score: earnedXP, from: Math.floor(totalXP * 0.30), to: Math.floor(totalXP * 0.60), pct: percentage, frame: "from-blue-400 via-luxor-primary to-blue-400", glow: "shadow-blue-500/50" }
  if (percentage >= 10) return { n: "Intermedio", bg: "bg-green-500", bar: "from-green-400 to-emerald-500", i: "📈", score: earnedXP, from: Math.floor(totalXP * 0.10), to: Math.floor(totalXP * 0.30), pct: percentage, frame: "from-green-400 via-emerald-500 to-green-400", glow: "shadow-green-500/50" }
  if (percentage >= 1.8) return { n: "Principiante", bg: "bg-gray-500", bar: "from-gray-400 to-gray-500", i: "🌱", score: earnedXP, from: Math.floor(totalXP * 0.018), to: Math.floor(totalXP * 0.10), pct: percentage, frame: "from-gray-400 via-gray-500 to-gray-400", glow: "shadow-gray-400/30" }
  return { n: "Novato", bg: "bg-gray-400", bar: "from-gray-300 to-gray-400", i: "📋", score: earnedXP, from: 0, to: Math.floor(totalXP * 0.018), pct: percentage, frame: "from-gray-300 via-gray-400 to-gray-300", glow: "shadow-gray-300/20" }
}

function getBadges(stats: FacilitadorStats): Badge[] {
  return [
    { id: "primer-curso", nombre: "Primer Curso", desc: "Creaste tu primer curso", icon: "📘", color: "text-blue-700", bg: "bg-blue-100", ok: stats.cursosCreados >= 1, p: Math.min(stats.cursosCreados, 1), t: 1, xp: 10 },
    { id: "creador-activo", nombre: "Creador Activo", desc: "Creaste 5 cursos", icon: "📚", color: "text-luxor-primary", bg: "bg-luxor-primary/10", ok: stats.cursosCreados >= 5, p: Math.min(stats.cursosCreados, 5), t: 5, xp: 50 },
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

interface BadgeGroup {
  categoria: string | null
  categoria_color: string | null
  categoria_icono: string | null
  badges: Badge[]
}

function groupBadgesByCategory(badges: Badge[]): BadgeGroup[] {
  const groups = new Map<string, BadgeGroup>()
  const sinCategoria: BadgeGroup = { categoria: null, categoria_color: null, categoria_icono: null, badges: [] }

  for (const b of badges) {
    if (b.categoria_nombre) {
      const key = b.categoria_nombre
      if (!groups.has(key)) {
        groups.set(key, { categoria: b.categoria_nombre, categoria_color: b.categoria_color || null, categoria_icono: b.categoria_icono || null, badges: [] })
      }
      groups.get(key)!.badges.push(b)
    } else {
      sinCategoria.badges.push(b)
    }
  }

  for (const group of groups.values()) {
    group.badges.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }
  sinCategoria.badges.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  const result: BadgeGroup[] = Array.from(groups.values())
  result.sort((a, b) => a.categoria!.localeCompare(b.categoria!))
  if (sinCategoria.badges.length > 0) result.push(sinCategoria)
  return result
}

interface DbNivel { id: string; nombre: string; descripcion: string | null; imagen_url: string | null; icono: string; rol: string; xp_minimo: number; color: string; avatar_x: number; avatar_y: number; avatar_tamano: number; frame_tamano: number; avatar_delante: boolean; activo: boolean }

interface NivelInfo {
  n: string; bg: string; bar: string; i: string; score: number; from: number; to: number; pct: number
  frame: string; glow: string; frame_url?: string | null
  avatar_x?: number; avatar_y?: number; avatar_tamano?: number; frame_tamano?: number; avatar_delante?: boolean
}

function getBaseNivel(earnedXP: number, totalXP: number): { n: string; bg: string; bar: string; i: string; from: number; to: number; frame: string; glow: string } {
  const pct = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  if (pct >= 95) return { n: "Leyenda", bg: "bg-yellow-500", bar: "from-yellow-400 to-amber-500", i: "👑", from: Math.floor(totalXP * 0.95), to: totalXP, frame: "from-yellow-400 via-amber-500 to-orange-400", glow: "shadow-yellow-500/50" }
  if (pct >= 60) return { n: "Experto", bg: "bg-purple-500", bar: "from-purple-400 to-violet-500", i: "🏆", from: Math.floor(totalXP * 0.60), to: Math.floor(totalXP * 0.95), frame: "from-purple-400 via-violet-500 to-purple-400", glow: "shadow-purple-500/50" }
  if (pct >= 30) return { n: "Avanzado", bg: "bg-blue-500", bar: "from-blue-400 to-luxor-primary", i: "⭐", from: Math.floor(totalXP * 0.30), to: Math.floor(totalXP * 0.60), frame: "from-blue-400 via-luxor-primary to-blue-400", glow: "shadow-blue-500/50" }
  if (pct >= 10) return { n: "Intermedio", bg: "bg-green-500", bar: "from-green-400 to-emerald-500", i: "📈", from: Math.floor(totalXP * 0.10), to: Math.floor(totalXP * 0.30), frame: "from-green-400 via-emerald-500 to-green-400", glow: "shadow-green-500/50" }
  if (pct >= 1.8) return { n: "Principiante", bg: "bg-gray-500", bar: "from-gray-400 to-gray-500", i: "🌱", from: Math.floor(totalXP * 0.018), to: Math.floor(totalXP * 0.10), frame: "from-gray-400 via-gray-500 to-gray-400", glow: "shadow-gray-400/30" }
  return { n: "Novato", bg: "bg-gray-400", bar: "from-gray-300 to-gray-400", i: "📋", from: 0, to: Math.floor(totalXP * 0.018), frame: "from-gray-300 via-gray-400 to-gray-300", glow: "shadow-gray-300/20" }
}

function getDbNivel(badges: Badge[], niveles: DbNivel[]): NivelInfo {
  const totalXP = badges.reduce((sum, b) => sum + b.xp, 0)
  const earnedXP = badges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const pct = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  const base = getBaseNivel(earnedXP, totalXP)
  const activeNiveles = niveles.filter(n => n.activo && (n.rol === "facilitador" || n.rol === "ambos")).sort((a, b) => b.xp_minimo - a.xp_minimo)
  const matched = activeNiveles.find(n => earnedXP >= n.xp_minimo) || activeNiveles[activeNiveles.length - 1] || null
  return {
    ...base,
    n: matched?.nombre || base.n,
    i: matched?.icono || base.i,
    frame_url: matched?.imagen_url || null,
    avatar_x: matched?.avatar_x ?? 50,
    avatar_y: matched?.avatar_y ?? 50,
    avatar_tamano: matched?.avatar_tamano ?? 70,
    frame_tamano: matched?.frame_tamano ?? 100,
    avatar_delante: matched?.avatar_delante ?? true,
    score: earnedXP,
    pct,
  }
}

function getDbStudentNivel(badges: Badge[], niveles: DbNivel[]): NivelInfo {
  const totalXP = badges.reduce((sum, b) => sum + b.xp, 0)
  const earnedXP = badges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const pct = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  const base = getBaseNivel(earnedXP, totalXP)
  const activeNiveles = niveles.filter(n => n.activo && (n.rol === "estudiante" || n.rol === "ambos")).sort((a, b) => b.xp_minimo - a.xp_minimo)
  const matched = activeNiveles.find(n => earnedXP >= n.xp_minimo) || activeNiveles[activeNiveles.length - 1] || null
  return {
    ...base,
    n: matched?.nombre || base.n,
    i: matched?.icono || base.i,
    frame_url: matched?.imagen_url || null,
    avatar_x: matched?.avatar_x ?? 50,
    avatar_y: matched?.avatar_y ?? 50,
    avatar_tamano: matched?.avatar_tamano ?? 70,
    frame_tamano: matched?.frame_tamano ?? 100,
    avatar_delante: matched?.avatar_delante ?? true,
    score: earnedXP,
    pct,
  }
}

function getNivel(badges: Badge[]) {
  const totalXP = badges.reduce((sum, b) => sum + b.xp, 0)
  const earnedXP = badges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const percentage = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0
  
  if (percentage >= 95) return { n: "Leyenda", bg: "bg-yellow-500", bar: "from-yellow-400 to-amber-500", i: "👑", score: earnedXP, from: Math.floor(totalXP * 0.95), to: totalXP, pct: percentage, frame: "from-yellow-400 via-amber-500 to-orange-400", glow: "shadow-yellow-500/50" }
  if (percentage >= 60) return { n: "Experto", bg: "bg-purple-500", bar: "from-purple-400 to-violet-500", i: "🏆", score: earnedXP, from: Math.floor(totalXP * 0.60), to: Math.floor(totalXP * 0.95), pct: percentage, frame: "from-purple-400 via-violet-500 to-purple-400", glow: "shadow-purple-500/50" }
  if (percentage >= 30) return { n: "Avanzado", bg: "bg-blue-500", bar: "from-blue-400 to-luxor-primary", i: "⭐", score: earnedXP, from: Math.floor(totalXP * 0.30), to: Math.floor(totalXP * 0.60), pct: percentage, frame: "from-blue-400 via-luxor-primary to-blue-400", glow: "shadow-blue-500/50" }
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

function FacEstadisticas({ isDev, godMode, simulatedFacStats, facStats, opiniones, loadingOpiniones }: {
  isDev: boolean; godMode: boolean; simulatedFacStats: any; facStats: FacilitadorStats | null; opiniones: { calificacion: number }[]; loadingOpiniones: boolean
}) {
  const stats = (isDev && godMode) ? simulatedFacStats : facStats
  if (!stats) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-luxor-primary animate-spin" /></div>

  const statCards = [
    { label: "Cursos Creados", value: stats.cursosCreados, icon: <BookOpen className="w-4 h-4" />, color: "from-blue-400 to-blue-600" },
    { label: "Aprobados", value: stats.cursosAprobados, icon: <CheckCircle2 className="w-4 h-4" />, color: "from-green-400 to-green-600" },
    { label: "Rechazados", value: stats.cursosRechazados, icon: <X className="w-4 h-4" />, color: "from-red-400 to-red-600" },
    { label: "Pendientes", value: stats.cursosPendientes, icon: <Loader2 className="w-4 h-4" />, color: "from-amber-400 to-amber-600" },
    { label: "Estudiantes", value: stats.estudiantesCapacitados, icon: <Users className="w-4 h-4" />, color: "from-violet-400 to-violet-600" },
    { label: "Calificacion", value: `${stats.calificacionPromedio}%`, icon: <Star className="w-4 h-4" />, color: "from-pink-400 to-pink-600" },
  ]

  const dist = [1, 2, 3, 4, 5].map(r => ({ name: `${r}`, value: opiniones.filter(o => o.calificacion === r).length }))
  const totalOps = dist.reduce((s, d) => s + d.value, 0)
  const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center mx-auto mb-1.5`}>{s.icon}</div>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      {!loadingOpiniones && opiniones.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Distribucion de Opiniones</h4>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dist.filter(d => d.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={24} outerRadius={48} paddingAngle={2}>
                    {dist.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(r => {
                const count = opiniones.filter(o => o.calificacion === r).length
                const pct = totalOps > 0 ? (count / totalOps) * 100 : 0
                return (
                  <div key={r} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-500">{r}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-500">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FacCursos({ loadingCursos, facCursos }: { loadingCursos: boolean; facCursos: any[] }) {
  if (loadingCursos) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-luxor-primary animate-spin" /></div>
  if (facCursos.length === 0) return (
    <div className="text-center py-8">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><BookOpen className="w-7 h-7 text-gray-400" /></div>
      <p className="text-sm text-gray-500">No tienes cursos aun</p>
    </div>
  )
  return (
    <div className="space-y-3">
      {facCursos.map((curso) => (
        <div key={curso.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${curso.estado === "aprobado" ? "bg-green-100 text-green-700" : curso.estado === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                {curso.estado}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate mb-2">{curso.titulo}</h4>
            
            {/* Estrellas de calificación */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(curso.calificacion_promedio || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">
                ({(curso.calificacion_promedio || 0).toFixed(1)})
              </span>
            </div>
            
            {/* Tags de estudiantes */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                {curso.estudiantes_en_curso || 0} en curso
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700">
                {curso.estudiantes_graduados || 0} graduados
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700">
                {curso.estudiantes_count || 0} total
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
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

export function PerfilContent({ viewUserId }: { viewUserId?: string }) {
  const { user, refreshUser } = useAuth()
  const supabase = createSupabaseClient()
  const [viewUser, setViewUser] = useState<any>(null)
  const [loadingViewUser, setLoadingViewUser] = useState(!!viewUserId)
  const isViewingOther = !!viewUserId && viewUser?.id !== user?.id
  const effectiveUser = isViewingOther ? viewUser : user
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [facStats, setFacStats] = useState<FacilitadorStats | null>(null)
  const [stuStats, setStuStats] = useState<StudentStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [detailBadge, setDetailBadge] = useState<Badge | null>(null)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showPhotoView, setShowPhotoView] = useState(false)
  const [godMode, setGodMode] = useState(false)
  const [godModeCollapsed, setGodModeCollapsed] = useState(true)
  const [simulatedRole, setSimulatedRole] = useState<"facilitador" | "estudiante">("facilitador")
  const [facTab, setFacTab] = useState<"estadisticas" | "cursos">("estadisticas")
  const [facCursos, setFacCursos] = useState<any[]>([])
  const [loadingCursos, setLoadingCursos] = useState(false)
  const [opiniones, setOpiniones] = useState<{ calificacion: number }[]>([])
  const [loadingOpiniones, setLoadingOpiniones] = useState(false)
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
  const [dbInsignias, setDbInsignias] = useState<DbInsignia[]>([])
  const [dbNiveles, setDbNiveles] = useState<DbNivel[]>([])
  const [dbCategorias, setDbCategorias] = useState<DbCategoria[]>([])
  const [selectedNivelId, setSelectedNivelId] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const [modalForm, setModalForm] = useState({ nombre: "", bio: "", newPassword: "", confirmPassword: "" })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (viewUserId) {
      setLoadingViewUser(true)
      fetchedRef.current = false
      supabase.from("profiles").select("*").eq("id", viewUserId).single().then(({ data }: { data: any }) => {
        setViewUser(data)
        setLoadingViewUser(false)
      })
    }
  }, [viewUserId])

  useEffect(() => {
    if (effectiveUser && !fetchedRef.current) {
      fetchedRef.current = true
      setModalForm({ nombre: effectiveUser.nombre || "", bio: effectiveUser.bio || "", newPassword: "", confirmPassword: "" })
      if (effectiveUser.avatar_url) setAvatarPreview(effectiveUser.avatar_url)
      fetchDbInsignias()
      if (effectiveUser.rol === "facilitador" || (isDev && godMode && simulatedRole === "facilitador")) {
        fetchFacilitadorStats()
        fetchFacilitadorCursos()
        fetchOpiniones()
      }
      else if (effectiveUser.rol === "estudiante" || (isDev && godMode && simulatedRole === "estudiante")) fetchStudentStats()
      else setLoadingStats(false)
    }
  }, [effectiveUser])

  useEffect(() => {
    if (isDev && godMode && effectiveUser) {
      if (simulatedRole === "facilitador") {
        fetchFacilitadorStats()
        fetchFacilitadorCursos()
        fetchOpiniones()
      } else if (simulatedRole === "estudiante") {
        fetchStudentStats()
      }
    }
  }, [godMode, simulatedRole])

  async function fetchDbInsignias() {
    const [insigniasRes, nivelesRes, categoriasRes] = await Promise.all([
      supabase.from("insignias").select("*").eq("activa", true),
      supabase.from("niveles").select("*").order("xp_minimo"),
      supabase.from("categoria_insignias").select("*").order("orden"),
    ])
    setDbInsignias(insigniasRes.data || [])
    setDbNiveles(nivelesRes.data || [])
    setDbCategorias(categoriasRes.data || [])
    if (effectiveUser) {
      const { data: profile } = await supabase.from("profiles").select("nivel_seleccionado_id").eq("id", effectiveUser.id).single()
      if (profile?.nivel_seleccionado_id) setSelectedNivelId(profile.nivel_seleccionado_id)
    }
  }

  async function fetchFacilitadorStats() {
    setLoadingStats(true)
    const { data: cursos } = await supabase.from("cursos").select("id, estado").eq("facilitador_id", effectiveUser!.id)
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

  async function fetchFacilitadorCursos() {
    setLoadingCursos(true)
    const { data: cursos } = await supabase
      .from("cursos")
      .select("id, titulo, descripcion, nivel, estado, created_at, estudiantes_count")
      .eq("facilitador_id", effectiveUser!.id)
      .order("created_at", { ascending: false })
    
    if (cursos && cursos.length > 0) {
      const cursosConStats = await Promise.all(cursos.map(async (curso: any) => {
        const { data: opiniones } = await supabase
          .from("opiniones")
          .select("calificacion")
          .eq("curso_id", curso.id)
        
        const { data: inscripciones } = await supabase
          .from("inscripciones")
          .select("estado")
          .eq("curso_id", curso.id)
        
        const calificacionPromedio = opiniones && opiniones.length > 0
          ? opiniones.reduce((sum: number, o: any) => sum + o.calificacion, 0) / opiniones.length
          : 0
        
        const enCurso = inscripciones?.filter((i: any) => i.estado === 'activa').length || 0
        const graduados = inscripciones?.filter((i: any) => i.estado === 'completada').length || 0
        
        return {
          ...curso,
          calificacion_promedio: calificacionPromedio,
          estudiantes_en_curso: enCurso,
          estudiantes_graduados: graduados
        }
      }))
      setFacCursos(cursosConStats)
    } else {
      setFacCursos([])
    }
    setLoadingCursos(false)
  }

  async function fetchOpiniones() {
    setLoadingOpiniones(true)
    const { data: cursos } = await supabase.from("cursos").select("id").eq("facilitador_id", effectiveUser!.id)
    const cursoIds = (cursos || []).map((c: { id: string }) => c.id)
    if (cursoIds.length > 0) {
      const { data: ops } = await supabase.from("opiniones").select("calificacion").in("curso_id", cursoIds)
      setOpiniones(ops || [])
    } else {
      setOpiniones([])
    }
    setLoadingOpiniones(false)
  }

  async function fetchStudentStats() {
    setLoadingStats(true)
    const { data: inscripciones } = await supabase.from("inscripciones").select("id, curso_id, estado, fecha_inscripcion").eq("user_id", effectiveUser!.id)
    const cursoIds = (inscripciones || []).map((i: { curso_id: string }) => i.curso_id)
    const cursosCompletados = (inscripciones || []).filter((i: { estado: string }) => i.estado === "completada").length

    let modulosCompletados = 0
    let quizzesAprobados = 0
    let calificaciones: number[] = []
    if (cursoIds.length > 0) {
      const { data: progreso } = await supabase.from("progreso_modulos").select("completado, quiz_aprobado, puntuacion").eq("user_id", effectiveUser!.id)
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

    const { data: actividad } = await supabase.from("actividad_usuario").select("fecha").eq("user_id", effectiveUser!.id).order("fecha", { ascending: false })
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
  const isFac = effectiveUser?.rol === "facilitador"
  const isStu = effectiveUser?.rol === "estudiante"
  const isDev = user?.rol === "developer"
  const showsFacNivel = isFac || (isDev && !isViewingOther)
  
  // Calcular estadísticas para insignias (reales o simuladas)
  const effectiveFacStats = isDev && godMode 
    ? simulatedFacStats 
    : facStats || { cursosCreados: 0, cursosAprobados: 0, cursosRechazados: 0, cursosPendientes: 0, estudiantesCapacitados: 0, calificacionPromedio: 0 }
  
  const effectiveStuStats = isDev && godMode
    ? { ...simulatedStudentStats, puntosTotales: 0, ultimaActividad: null }
    : stuStats || { cursosInscritos: 0, cursosCompletados: 0, modulosCompletados: 0, quizzesAprobados: 0, calificacionPromedio: 0, puntosTotales: 0, rachaActual: 0, mejorRacha: 0, ultimaActividad: null }
  
  // En Modo Dios, calcular insignias automáticamente según datos simulados
  let facBadges: Badge[]
  let stuBadges: Badge[]
  if (isDev && godMode) {
    facBadges = dbInsignias.length > 0
      ? getDbFacilitadorBadges(dbInsignias, simulatedFacStats, dbCategorias)
      : getBadges(simulatedFacStats)
    stuBadges = dbInsignias.length > 0
      ? getDbEstudianteBadges(dbInsignias, effectiveStuStats, dbCategorias)
      : getStudentBadges(effectiveStuStats)
  } else {
    facBadges = facStats
      ? (dbInsignias.length > 0 ? getDbFacilitadorBadges(dbInsignias, facStats, dbCategorias) : getBadges(facStats))
      : []
    stuBadges = stuStats
      ? (dbInsignias.length > 0 ? getDbEstudianteBadges(dbInsignias, stuStats, dbCategorias) : getStudentBadges(stuStats))
      : []
  }
  
  const baseFacNivel = dbNiveles.length > 0
    ? getDbNivel(facBadges, dbNiveles)
    : getNivel(facBadges)
  const baseStuNivel = dbNiveles.length > 0
    ? getDbStudentNivel(stuBadges, dbNiveles)
    : getStudentNivel(stuBadges)
  const facUnlocked = facBadges.filter((b) => b.ok).length
  const stuUnlocked = stuBadges.filter((b) => b.ok).length

  const effectiveBadges = (isDev && godMode) ? (simulatedRole === "facilitador" ? facBadges : stuBadges) : (showsFacNivel ? facBadges : stuBadges)
  const earnedXp = effectiveBadges.filter(b => b.ok).reduce((sum, b) => sum + b.xp, 0)
  const userRole = (isDev && godMode) ? simulatedRole : (showsFacNivel ? "facilitador" : "estudiante")
  const earnedNiveles = dbNiveles.filter(n =>
    n.activo && (n.rol === userRole || n.rol === "ambos") && earnedXp >= n.xp_minimo
  ).sort((a, b) => b.xp_minimo - a.xp_minimo)

  const selectedDbNivel = selectedNivelId ? dbNiveles.find(n => n.id === selectedNivelId) : null
  const overrideNivel: NivelInfo | null = selectedDbNivel ? {
    ...getNivel(effectiveBadges),
    n: selectedDbNivel.nombre,
    i: selectedDbNivel.icono || "⭐",
    frame_url: selectedDbNivel.imagen_url || null,
    avatar_x: selectedDbNivel.avatar_x ?? 50,
    avatar_y: selectedDbNivel.avatar_y ?? 50,
    avatar_tamano: selectedDbNivel.avatar_tamano ?? 70,
    frame_tamano: selectedDbNivel.frame_tamano ?? 100,
    avatar_delante: selectedDbNivel.avatar_delante ?? true,
  } : null

  const facNivel = overrideNivel || baseFacNivel
  const stuNivel = overrideNivel || baseStuNivel

  async function saveNivelSelection(nivelId: string | null) {
    setSelectedNivelId(nivelId)
    if (user) {
      await supabase.from("profiles").update({ nivel_seleccionado_id: nivelId }).eq("id", user.id)
    }
  }

  if (loadingViewUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* God Mode Floating Button + Panel - Solo para Developer (no al ver otro perfil) */}
      {isDev && !isViewingOther && (
        <>
          <button
            onClick={() => setGodModeCollapsed(!godModeCollapsed)}
            className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
              godModeCollapsed 
                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white opacity-50 hover:opacity-75" 
                : "bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 opacity-100"
            }`}
            title="Modo Dios"
          >
            <span className="text-xl">⚡</span>
          </button>

          {!godModeCollapsed && (
            <div className="fixed bottom-20 right-4 z-50 w-72 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-sm">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Modo Dios</h3>
                    {godMode && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
                        {simulatedRole === "facilitador" ? "Facilitador" : "Estudiante"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGodMode(!godMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${godMode ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${godMode ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => setGodModeCollapsed(true)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                    <span className="text-sm">✕</span>
                  </button>
                </div>
              </div>

              {godMode && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Simular como:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSimulatedRole("facilitador")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${simulatedRole === "facilitador" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Facilitador
                      </button>
                      <button
                        onClick={() => setSimulatedRole("estudiante")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${simulatedRole === "estudiante" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Estudiante
                      </button>
                    </div>
                  </div>

                  {simulatedRole === "estudiante" && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Estadísticas de Estudiante</h4>
                      <div className="grid grid-cols-2 gap-2">
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
                      <div className="grid grid-cols-2 gap-2">
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

                  <p className="text-[10px] text-gray-400">Las insignias se marcan automáticamente según los datos simulados.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Profile Header para Facilitador en Móvil */}
      {(isFac || (isDev && godMode && simulatedRole === "facilitador")) && (
        <div className="lg:hidden w-full max-w-3xl mx-auto p-4">
          <Card>
            <CardContent className="relative">
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {(showsFacNivel && facNivel) || (isDev && godMode && (simulatedRole === "facilitador" ? facNivel : stuNivel)) ? (
                    (() => {
                      const activeNivel = (isDev && godMode) 
                        ? (simulatedRole === "facilitador" ? facNivel : stuNivel)
                        : (showsFacNivel ? facNivel : stuNivel)
                      const frameUrl = activeNivel && "frame_url" in activeNivel ? (activeNivel as NivelInfo).frame_url : null
                      const ax = (activeNivel && "avatar_x" in activeNivel) ? (activeNivel as NivelInfo).avatar_x ?? 50 : 50
                      const ay = (activeNivel && "avatar_y" in activeNivel) ? (activeNivel as NivelInfo).avatar_y ?? 50 : 50
                      const at = (activeNivel && "avatar_tamano" in activeNivel) ? (activeNivel as NivelInfo).avatar_tamano ?? 70 : 70
                      const ft = (activeNivel && "frame_tamano" in activeNivel) ? (activeNivel as NivelInfo).frame_tamano ?? 100 : 100
                      const ad = (activeNivel && "avatar_delante" in activeNivel) ? (activeNivel as NivelInfo).avatar_delante ?? true : true
                      return frameUrl ? (
                        <CompositeAvatar
                          frameUrl={frameUrl}
                          avatarSrc={avatarPreview || effectiveUser?.avatar_url || null}
                          initials={effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}
                          x={ax}
                          y={ay}
                          tamano={at}
                          frameTamano={ft}
                          avatarDelante={ad}
                          onClick={() => !isViewingOther && setShowAvatarDialog(true)}
                        />
                      ) : (
                        <div className={`p-1.5 rounded-full bg-gradient-to-br ${
                          isDev && godMode 
                            ? (simulatedRole === "facilitador" ? facNivel?.frame : stuNivel?.frame)
                            : (showsFacNivel ? facNivel?.frame : stuNivel?.frame)
                        } ${
                          isDev && godMode 
                            ? (simulatedRole === "facilitador" ? facNivel?.glow : stuNivel?.glow)
                            : (showsFacNivel ? facNivel?.glow : stuNivel?.glow)
                        } shadow-lg`}>
                          <div className="w-40 h-40 rounded-full border-4 border-white bg-white overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                                <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                          <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Texto */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">{effectiveUser?.nombre}</h1>
                  <p className="text-sm text-gray-500">{rolL[effectiveUser?.rol || ""]}</p>
                  {effectiveUser?.cargo && <p className="text-sm text-gray-400">{effectiveUser.cargo}</p>}
                  {effectiveUser?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{effectiveUser.bio}</p>}
                </div>
              </div>

              {/* XP Bar */}
              {((showsFacNivel || (isDev && godMode && simulatedRole === "facilitador")) && facNivel) ? (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {(() => {
                    const nivel = isDev && godMode 
                      ? (simulatedRole === "facilitador" ? facNivel : stuNivel)
                      : (showsFacNivel ? facNivel : stuNivel)
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{nivel?.i}</span>
                            <span className="text-xs font-semibold text-gray-700">{nivel?.n}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{nivel?.pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${nivel?.bar}`}
                            style={{ width: `${Math.min(((nivel!.score - nivel!.from) / Math.max(nivel!.to - nivel!.from, 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-gray-400">{nivel?.from}</span>
                          <span className="text-[10px] text-gray-400">{nivel?.to}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : null}

              {/* Insignias */}
              {(isFac || (isDev && godMode)) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Insignias <span className="text-xs font-normal text-gray-500">({isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.filter(b => b.ok).length : stuBadges.filter(b => b.ok).length) : facUnlocked}/{isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.length : stuBadges.length) : facBadges.length})</span>
                  </h3>
                  {(() => {
                    const currentBadges = isDev && godMode ? (simulatedRole === "facilitador" ? facBadges : stuBadges) : facBadges
                    const groups = groupBadgesByCategory(currentBadges)
                    return groups.map((group, gi) => (
                      <div key={gi} className="mb-3 last:mb-0">
                        {group.categoria && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: (group.categoria_color || "#6366f1") + "20", color: group.categoria_color || "#6366f1" }}>{group.categoria_icono} {group.categoria}</span>
                          </div>
                        )}
                        <div className="badge-container flex flex-wrap justify-center gap-2">
                          {group.badges.map((b) => (
                            <div key={b.id} className="relative group">
                              <button
                                onClick={() => setDetailBadge(b)}
                                className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                                  b.ok 
                                    ? `${b.bg} shadow-sm` 
                                    : "bg-gray-100 opacity-40 grayscale"
                                } cursor-pointer`}
                              >
                                {b.imagen_url ? (
                                  <img src={b.imagen_url} alt={b.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  b.icon
                                )}
                              </button>
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
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Layout para Facilitador: 3 columnas con scroll independiente */}
      {(isFac || (isDev && godMode && simulatedRole === "facilitador")) && (
        <div className="hidden lg:flex relative z-[2] w-full h-full flex-col -mb-4 sm:-mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_340px] gap-0 w-full h-full">
            {/* Sidebar izquierdo — Estadísticas (estático) */}
            <div className="flex flex-col gap-3 h-full w-full bg-[#F0F2F5] p-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Estadísticas</h3>
                  <FacEstadisticas isDev={isDev} godMode={godMode} simulatedFacStats={simulatedFacStats} facStats={facStats} opiniones={opiniones} loadingOpiniones={loadingOpiniones} />
                </CardContent>
              </Card>
            </div>

            {/* Centro — Profile Header */}
            <div className="h-full overflow-y-auto bg-[#F0F2F5] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="w-full p-4">
                <Card>
                  <CardContent className="relative">
                    <div className="flex flex-col items-center justify-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {(showsFacNivel && facNivel) || (isDev && godMode && (simulatedRole === "facilitador" ? facNivel : stuNivel)) ? (
                          (() => {
                            const activeNivel = (isDev && godMode) 
                              ? (simulatedRole === "facilitador" ? facNivel : stuNivel)
                              : (showsFacNivel ? facNivel : stuNivel)
                            const frameUrl = activeNivel && "frame_url" in activeNivel ? (activeNivel as NivelInfo).frame_url : null
                            const ax = (activeNivel && "avatar_x" in activeNivel) ? (activeNivel as NivelInfo).avatar_x ?? 50 : 50
                            const ay = (activeNivel && "avatar_y" in activeNivel) ? (activeNivel as NivelInfo).avatar_y ?? 50 : 50
                            const at = (activeNivel && "avatar_tamano" in activeNivel) ? (activeNivel as NivelInfo).avatar_tamano ?? 70 : 70
                            const ft = (activeNivel && "frame_tamano" in activeNivel) ? (activeNivel as NivelInfo).frame_tamano ?? 100 : 100
                            const ad = (activeNivel && "avatar_delante" in activeNivel) ? (activeNivel as NivelInfo).avatar_delante ?? true : true
                            return frameUrl ? (
                              <CompositeAvatar
                                frameUrl={frameUrl}
                                avatarSrc={avatarPreview || effectiveUser?.avatar_url || null}
                                initials={effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}
                                x={ax}
                                y={ay}
                                tamano={at}
                                frameTamano={ft}
                                avatarDelante={ad}
                                onClick={() => !isViewingOther && setShowAvatarDialog(true)}
                              />
                            ) : (
                              <div className={`p-1.5 rounded-full bg-gradient-to-br ${
                                isDev && godMode 
                                  ? (simulatedRole === "facilitador" ? facNivel?.frame : stuNivel?.frame)
                                  : (showsFacNivel ? facNivel?.frame : stuNivel?.frame)
                              } ${
                                isDev && godMode 
                                  ? (simulatedRole === "facilitador" ? facNivel?.glow : stuNivel?.glow)
                                  : (showsFacNivel ? facNivel?.glow : stuNivel?.glow)
                              } shadow-lg`}>
                                <div className="w-40 h-40 rounded-full border-4 border-white bg-white overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                                  {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                                      <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                              </div>
                            )
                          })()
                        ) : (
                          <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                                <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Texto */}
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">{effectiveUser?.nombre}</h1>
                        <p className="text-sm text-gray-500">{rolL[effectiveUser?.rol || ""]}</p>
                        {effectiveUser?.cargo && <p className="text-sm text-gray-400">{effectiveUser.cargo}</p>}
                        {effectiveUser?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{effectiveUser.bio}</p>}
                      </div>
                    </div>

                    {/* XP Bar */}
                    {((showsFacNivel || (isDev && godMode && simulatedRole === "facilitador")) && facNivel) ? (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        {(() => {
                          const nivel = isDev && godMode 
                            ? (simulatedRole === "facilitador" ? facNivel : stuNivel)
                            : (showsFacNivel ? facNivel : stuNivel)
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{nivel?.i}</span>
                                  <span className="text-xs font-semibold text-gray-700">{nivel?.n}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-500">{nivel?.pct.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full bg-gradient-to-r ${nivel?.bar}`}
                                  style={{ width: `${Math.min(((nivel!.score - nivel!.from) / Math.max(nivel!.to - nivel!.from, 1)) * 100, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400">{nivel?.from}</span>
                                <span className="text-[10px] text-gray-400">{nivel?.to}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : null}

                    {/* Insignias */}
                    {(isFac || (isDev && godMode)) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Insignias <span className="text-xs font-normal text-gray-500">({isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.filter(b => b.ok).length : stuBadges.filter(b => b.ok).length) : facUnlocked}/{isDev && godMode ? (simulatedRole === "facilitador" ? facBadges.length : stuBadges.length) : facBadges.length})</span>
                        </h3>
                        {(() => {
                          const currentBadges = isDev && godMode ? (simulatedRole === "facilitador" ? facBadges : stuBadges) : facBadges
                          const groups = groupBadgesByCategory(currentBadges)
                          return groups.map((group, gi) => (
                            <div key={gi} className="mb-3 last:mb-0">
                              {group.categoria && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: (group.categoria_color || "#6366f1") + "20", color: group.categoria_color || "#6366f1" }}>{group.categoria_icono} {group.categoria}</span>
                                </div>
                              )}
                              <div className="badge-container flex flex-wrap justify-center gap-2">
                                {group.badges.map((b) => (
                                  <div key={b.id} className="relative group">
                                    <button
                                      onClick={() => setDetailBadge(b)}
                                      className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                                        b.ok 
                                          ? `${b.bg} shadow-sm` 
                                          : "bg-gray-100 opacity-40 grayscale"
                                      } cursor-pointer`}
                                    >
                                      {b.imagen_url ? (
                                        <img src={b.imagen_url} alt={b.nombre} className="w-full h-full object-cover" />
                                      ) : (
                                        b.icon
                                      )}
                                    </button>
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
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar derecha — Cursos */}
            <div className="hidden lg:block w-[340px] shrink-0 h-full overflow-y-auto bg-[#F0F2F5] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="p-4 space-y-3">
              <div className="px-1 py-2">
                <h3 className="text-sm font-semibold text-gray-800">Mis Cursos</h3>
                <p className="text-xs text-gray-500 mt-1">Cursos creados y su estado ({facCursos.length} cursos)</p>
              </div>
              {loadingCursos ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-luxor-primary animate-spin" /></div>
              ) : facCursos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><BookOpen className="w-7 h-7 text-gray-400" /></div>
                  <p className="text-sm text-gray-500">No tienes cursos aún</p>
                </div>
              ) : (
                facCursos.map((curso) => (
                  <div key={curso.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${curso.estado === "aprobado" ? "bg-green-100 text-green-700" : curso.estado === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {curso.estado}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 truncate mb-2">{curso.titulo}</h4>
                      
                      {/* Estrellas de calificación */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(curso.calificacion_promedio || 0)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          ({(curso.calificacion_promedio || 0).toFixed(1)})
                        </span>
                      </div>
                      
                      {/* Tags de estudiantes */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                          {curso.estudiantes_en_curso || 0} en curso
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700">
                          {curso.estudiantes_graduados || 0} graduados
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700">
                          {curso.estudiantes_count || 0} total
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Mobile: Tabs para Facilitador */}
      {(isFac || (isDev && godMode && simulatedRole === "facilitador")) && (facStats || isDev) && (
        <div className="lg:hidden w-full max-w-3xl mx-auto p-4">
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b border-gray-200">
                <button onClick={() => setFacTab("estadisticas")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${facTab === "estadisticas" ? "text-luxor-primary border-b-2 border-luxor-primary" : "text-gray-500 hover:text-gray-700"}`}>Estadísticas</button>
                <button onClick={() => setFacTab("cursos")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${facTab === "cursos" ? "text-luxor-primary border-b-2 border-luxor-primary" : "text-gray-500 hover:text-gray-700"}`}>Cursos</button>
              </div>
              <div className="p-4">
                {facTab === "estadisticas" && (
                  <FacEstadisticas isDev={isDev} godMode={godMode} simulatedFacStats={simulatedFacStats} facStats={facStats} opiniones={opiniones} loadingOpiniones={loadingOpiniones} />
                )}
                {facTab === "cursos" && (
                  <FacCursos loadingCursos={loadingCursos} facCursos={facCursos} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Header para Estudiante/Decano */}
      {!(isFac || (isDev && godMode && simulatedRole === "facilitador")) && (
        <div className="w-full max-w-3xl mx-auto p-4">
          <Card>
            <CardContent className="relative">
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {(isStu && stuNivel) || (isDev && godMode && (simulatedRole === "estudiante" ? stuNivel : facNivel)) ? (
                    (() => {
                      const activeNivel = (isDev && godMode) 
                        ? (simulatedRole === "estudiante" ? stuNivel : facNivel)
                        : stuNivel
                      const frameUrl = activeNivel && "frame_url" in activeNivel ? (activeNivel as NivelInfo).frame_url : null
                      const ax = (activeNivel && "avatar_x" in activeNivel) ? (activeNivel as NivelInfo).avatar_x ?? 50 : 50
                      const ay = (activeNivel && "avatar_y" in activeNivel) ? (activeNivel as NivelInfo).avatar_y ?? 50 : 50
                      const at = (activeNivel && "avatar_tamano" in activeNivel) ? (activeNivel as NivelInfo).avatar_tamano ?? 70 : 70
                      const ft = (activeNivel && "frame_tamano" in activeNivel) ? (activeNivel as NivelInfo).frame_tamano ?? 100 : 100
                      const ad = (activeNivel && "avatar_delante" in activeNivel) ? (activeNivel as NivelInfo).avatar_delante ?? true : true
                      return frameUrl ? (
                        <CompositeAvatar
                          frameUrl={frameUrl}
                          avatarSrc={avatarPreview || effectiveUser?.avatar_url || null}
                          initials={effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}
                          x={ax}
                          y={ay}
                          tamano={at}
                          frameTamano={ft}
                          avatarDelante={ad}
                          onClick={() => !isViewingOther && setShowAvatarDialog(true)}
                        />
                      ) : (
                        <div className={`p-1.5 rounded-full bg-gradient-to-br ${
                          isDev && godMode 
                            ? (simulatedRole === "estudiante" ? stuNivel?.frame : facNivel?.frame)
                            : stuNivel?.frame
                        } ${
                          isDev && godMode 
                            ? (simulatedRole === "estudiante" ? stuNivel?.glow : facNivel?.glow)
                            : stuNivel?.glow
                        } shadow-lg`}>
                          <div className="w-40 h-40 rounded-full border-4 border-white bg-white overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                                <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group" onClick={() => !isViewingOther && setShowAvatarDialog(true)}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-luxor-primary/10 flex items-center justify-center">
                          <span className="text-luxor-primary font-bold text-5xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Texto */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">{effectiveUser?.nombre}</h1>
                  <p className="text-sm text-gray-500">{rolL[effectiveUser?.rol || ""]}</p>
                  {effectiveUser?.cargo && <p className="text-sm text-gray-400">{effectiveUser.cargo}</p>}
                  {effectiveUser?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{effectiveUser.bio}</p>}
                </div>
              </div>

              {/* XP Bar */}
              {((isStu || (isDev && godMode && simulatedRole === "estudiante")) && stuNivel) ? (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {(() => {
                    const nivel = isDev && godMode 
                      ? (simulatedRole === "estudiante" ? stuNivel : facNivel)
                      : stuNivel
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{nivel?.i}</span>
                            <span className="text-xs font-semibold text-gray-700">{nivel?.n}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{nivel?.pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${nivel?.bar}`}
                            style={{ width: `${Math.min(((nivel!.score - nivel!.from) / Math.max(nivel!.to - nivel!.from, 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-gray-400">{nivel?.from}</span>
                          <span className="text-[10px] text-gray-400">{nivel?.to}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : null}

              {/* Insignias */}
              {(isStu || (isDev && godMode)) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Insignias <span className="text-xs font-normal text-gray-500">({isDev && godMode ? (simulatedRole === "estudiante" ? stuBadges.filter(b => b.ok).length : facBadges.filter(b => b.ok).length) : stuUnlocked}/{isDev && godMode ? (simulatedRole === "estudiante" ? stuBadges.length : facBadges.length) : stuBadges.length})</span>
                  </h3>
                  {(() => {
                    const currentBadges = isDev && godMode ? (simulatedRole === "estudiante" ? stuBadges : facBadges) : stuBadges
                    const groups = groupBadgesByCategory(currentBadges)
                    return groups.map((group, gi) => (
                      <div key={gi} className="mb-3 last:mb-0">
                        {group.categoria && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: (group.categoria_color || "#6366f1") + "20", color: group.categoria_color || "#6366f1" }}>{group.categoria_icono} {group.categoria}</span>
                          </div>
                        )}
                        <div className="badge-container flex flex-wrap justify-center gap-2">
                          {group.badges.map((b) => (
                            <div key={b.id} className="relative group">
                              <button
                                onClick={() => setDetailBadge(b)}
                                className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                                  b.ok 
                                    ? `${b.bg} shadow-sm` 
                                    : "bg-gray-100 opacity-40 grayscale"
                                } cursor-pointer`}
                              >
                                {b.imagen_url ? (
                                  <img src={b.imagen_url} alt={b.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  b.icon
                                )}
                              </button>
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
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto space-y-4 p-4">
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
                    } : effectiveStuStats
                    return [
                      { label: "Puntos", value: stuNivel ? stuNivel.score : 0, icon: <Zap className="w-5 h-5" />, color: "from-amber-400 to-orange-500", textColor: "text-amber-700" },
                      { label: "Racha", value: `${stats.rachaActual}d`, icon: <Flame className="w-5 h-5" />, color: "from-red-400 to-orange-500", textColor: "text-red-700" },
                      { label: "Promedio", value: `${stats.calificacionPromedio}%`, icon: <Target className="w-5 h-5" />, color: "from-blue-400 to-luxor-primary", textColor: "text-blue-700" },
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
                      const stats = isDev && godMode ? simulatedStudentStats : effectiveStuStats
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
                      const stats = isDev && godMode ? simulatedStudentStats : effectiveStuStats
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

          {/* Decano - simple info */}
          {!isFac && !isStu && !(isDev && godMode) && (
            <Accordion title="Mi informacion" defaultOpen={true}>
              <div className="pt-4 flex flex-col items-center py-4 text-center">
                <div className="w-16 h-16 bg-luxor-primary/10 rounded-full flex items-center justify-center mb-3"><span className="text-3xl">👤</span></div>
                <h2 className="text-lg font-semibold text-gray-900">{effectiveUser?.nombre}</h2>
                <p className="text-sm text-gray-500">{rolL[effectiveUser?.rol || ""]}</p>
              </div>
            </Accordion>
          )}
      </div>

      {/* Avatar Tap Dialog */}
      {showAvatarDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAvatarDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-1">
              {avatarPreview || effectiveUser?.avatar_url ? (
                <img src={avatarPreview || effectiveUser?.avatar_url || ""} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-luxor-primary/10 flex items-center justify-center">
                  <span className="text-luxor-primary font-bold text-2xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 text-center">Foto de perfil</h3>
            <div className="space-y-2">
              {(avatarPreview || effectiveUser?.avatar_url) && (
                <button onClick={() => { setShowAvatarDialog(false); setShowPhotoView(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <Eye className="w-4 h-4 text-gray-400" />
                  Ver foto de perfil
                </button>
              )}
              {!isViewingOther && (
                <button onClick={() => { setShowAvatarDialog(false); setShowModal(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <Pencil className="w-4 h-4 text-gray-400" />
                  Editar perfil
                </button>
              )}
            </div>
            <button onClick={() => setShowAvatarDialog(false)} className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Photo View Modal */}
      {showPhotoView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowPhotoView(false)}>
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPhotoView(false)} className="absolute -top-10 right-0 text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            {avatarPreview || effectiveUser?.avatar_url ? (
              <img src={avatarPreview || effectiveUser?.avatar_url || ""} alt="Avatar" className="w-full rounded-2xl object-contain" />
            ) : (
              <div className="w-64 h-64 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-7xl">{effectiveUser?.nombre?.charAt(0).toUpperCase() || "U"}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
              {earnedNiveles.length > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-gray-500">Seleccionar Marco</label>
                    {selectedNivelId && (
                      <button onClick={() => saveNivelSelection(null)} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                        Usar auto
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {earnedNiveles.map((nivel) => (
                      <button
                        key={nivel.id}
                        type="button"
                        onClick={() => saveNivelSelection(nivel.id)}
                        className={`shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${selectedNivelId === nivel.id ? "bg-luxor-primary/10 ring-2 ring-luxor-primary" : "bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200"}`}
                      >
                        {nivel.imagen_url ? (
                          <img src={nivel.imagen_url} alt={nivel.nombre} className="w-14 h-14 rounded-full object-contain" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                            {nivel.icono || "⭐"}
                          </div>
                        )}
                        <span className="text-[10px] font-medium text-gray-700">{nivel.nombre}</span>
                        <span className="text-[9px] text-gray-400">{nivel.xp_minimo} XP</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

      {detailBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailBadge(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative flex flex-col items-center pt-6 pb-4 px-6">
              <button onClick={() => setDetailBadge(null)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-4 ${detailBadge.ok ? "shadow-lg" : "grayscale opacity-50"}`} style={detailBadge.ok ? { backgroundColor: detailBadge.color?.replace("text-[", "").replace("]", "") + "20" } : {}}>
                {detailBadge.imagen_url ? (
                  <img src={detailBadge.imagen_url} alt={detailBadge.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{detailBadge.icon}</span>
                )}
              </div>
              {detailBadge.categoria_nombre && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full mb-2" style={{ backgroundColor: (detailBadge.categoria_color || "#6366f1") + "20", color: detailBadge.categoria_color || "#6366f1" }}>{detailBadge.categoria_icono} {detailBadge.categoria_nombre}</span>
              )}
              <h3 className="text-lg font-bold text-gray-900 text-center">{detailBadge.nombre}</h3>
              <p className="text-sm text-gray-500 text-center mt-1">{detailBadge.desc}</p>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Progreso</span>
                <span className="font-bold" style={{ color: detailBadge.ok ? "#16a34a" : "#6b7280" }}>{detailBadge.ok ? "¡Desbloqueada!" : `${detailBadge.t - detailBadge.p} más para desbloquear`}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${detailBadge.ok ? "bg-green-500" : "bg-gray-400"}`} style={{ width: `${(detailBadge.p / detailBadge.t) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{detailBadge.p}/{detailBadge.t}</span>
                <span className="font-semibold">+{detailBadge.xp} XP</span>
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
