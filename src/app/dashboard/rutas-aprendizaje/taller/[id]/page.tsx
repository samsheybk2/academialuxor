"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  Users,
  MessageSquare,
  Lock,
} from "lucide-react"
import Link from "next/link"

interface StudentEval {
  user_id: string
  nombre: string
  email: string
  aprobado: boolean | null
  observaciones: string
  eval_id: string | null
  guardado: boolean
  bloqueado: boolean
  mensajeBloqueo: string
}

function TallerContent({ id }: { id: string }) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [tallerInfo, setTallerInfo] = useState<{ titulo: string; descripcion: string; cargoId: string; cargoNombre: string } | null>(null)
  const [students, setStudents] = useState<StudentEval[]>([])
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (user) fetchData()
  }, [user?.id, id])

  async function fetchData() {
    if (!user) return
    setLoading(true)

    const { data: taller } = await supabase
      .from("cargo_elementos")
      .select("id, titulo, descripcion, cargo_id")
      .eq("id", id)
      .single()

    if (!taller) {
      setLoading(false)
      return
    }

    const { data: cargo } = await supabase
      .from("cargos")
      .select("id, nombre")
      .eq("id", taller.cargo_id)
      .single()

    const cargoNombre = cargo?.nombre || ""

    setTallerInfo({
      titulo: taller.titulo,
      descripcion: taller.descripcion || "",
      cargoId: taller.cargo_id,
      cargoNombre,
    })

    if (cargoNombre) {
      const { data: elementos } = await supabase
        .from("cargo_elementos")
        .select("id, tipo, curso_id, orden")
        .eq("cargo_id", taller.cargo_id)
        .order("orden")

      const elementosAnteriores = (elementos || []).filter((e: any) => e.orden < (elementos?.find((e2: any) => e2.id === id)?.orden || 0))

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .eq("rol", "estudiante")
        .eq("cargo", cargoNombre)
        .order("nombre")

      const { data: evals } = await supabase
        .from("evaluacion_talleres")
        .select("id, user_id, aprobado, observaciones")
        .eq("taller_id", id)

      const evalMap = new Map<string, { eval_id: string; aprobado: boolean; observaciones: string }>()
      if (evals) {
        for (const e of evals) {
          evalMap.set(e.user_id, { eval_id: e.id, aprobado: e.aprobado, observaciones: e.observaciones || "" })
        }
      }

       const userIds = (profiles || []).map((p: any) => p.id)

      const { data: inscripcionesAll } = await supabase
        .from("inscripciones")
        .select("user_id, curso_id, estado")
        .in("user_id", userIds)
        .eq("estado", "completada")

      const { data: evalsAll } = await supabase
        .from("evaluacion_talleres")
        .select("user_id, taller_id, aprobado")
        .in("user_id", userIds)

      const completadosMap = new Map<string, Set<string>>()
      if (inscripcionesAll) {
        for (const ins of inscripcionesAll) {
          if (!completadosMap.has(ins.user_id)) completadosMap.set(ins.user_id, new Set())
          completadosMap.get(ins.user_id)!.add(`curso_${ins.curso_id}`)
        }
      }
      if (evalsAll) {
        for (const ev of evalsAll) {
          if (ev.aprobado) {
            if (!completadosMap.has(ev.user_id)) completadosMap.set(ev.user_id, new Set())
            completadosMap.get(ev.user_id)!.add(`taller_${ev.taller_id}`)
          }
        }
      }

       const studentList: StudentEval[] = (profiles || []).map((p: any) => {
        const existing = evalMap.get(p.id)
        const userCompletados = completadosMap.get(p.id) || new Set()

        let bloqueado = false
        let mensajeBloqueo = ""
        for (const elem of elementosAnteriores) {
          const key = `${elem.tipo}_${elem.curso_id || elem.id}`
          if (!userCompletados.has(key)) {
            bloqueado = true
            mensajeBloqueo = `Actividades previas pendientes`
            break
          }
        }

        return {
          user_id: p.id,
          nombre: p.nombre || "Sin nombre",
          email: p.email || "",
          aprobado: existing?.aprobado ?? null,
          observaciones: existing?.observaciones || "",
          eval_id: existing?.eval_id || null,
          guardado: !!existing,
          bloqueado,
          mensajeBloqueo,
        }
      })

      setStudents(studentList)
      setSavedCount(studentList.filter((s) => s.guardado).length)
    }

    setLoading(false)
  }

  async function handleEvaluar(studentIndex: number, aprobado: boolean) {
    setStudents((prev) =>
      prev.map((s, i) =>
        i === studentIndex ? { ...s, aprobado, guardado: false } : s
      )
    )
  }

  async function handleObservaciones(studentIndex: number, texto: string) {
    setStudents((prev) =>
      prev.map((s, i) =>
        i === studentIndex ? { ...s, observaciones: texto, guardado: false } : s
      )
    )
  }

  async function handleGuardar(studentIndex: number) {
    const student = students[studentIndex]
    if (student.aprobado === null) return

    setSaving(student.user_id)

    const payload = {
      taller_id: id,
      user_id: student.user_id,
      facilitador_id: user!.id,
      aprobado: student.aprobado,
      observaciones: student.observaciones.trim() || null,
    }

    if (student.eval_id) {
      const { error } = await supabase
        .from("evaluacion_talleres")
        .update({ aprobado: student.aprobado, observaciones: payload.observaciones })
        .eq("id", student.eval_id)
      if (!error) {
        setStudents((prev) =>
          prev.map((s, i) =>
            i === studentIndex ? { ...s, guardado: true } : s
          )
        )
        setSavedCount((prev) => Math.max(prev, students.filter((s, i) => i === studentIndex ? true : s.guardado).length))
      }
    } else {
      const { data, error } = await supabase
        .from("evaluacion_talleres")
        .insert(payload)
        .select("id")
        .single()
      if (!error && data) {
        setStudents((prev) =>
          prev.map((s, i) =>
            i === studentIndex ? { ...s, eval_id: data.id, guardado: true } : s
          )
        )
        setSavedCount((prev) => prev + 1)
      }
    }

    setSaving(null)
  }

  async function handleGuardarTodos() {
    setSaving("all")
    for (let i = 0; i < students.length; i++) {
      const s = students[i]
      if (s.aprobado === null || s.guardado || s.bloqueado) continue
      const payload = {
        taller_id: id,
        user_id: s.user_id,
        facilitador_id: user!.id,
        aprobado: s.aprobado,
        observaciones: s.observaciones.trim() || null,
      }
      if (s.eval_id) {
        await supabase
          .from("evaluacion_talleres")
          .update({ aprobado: s.aprobado, observaciones: payload.observaciones })
          .eq("id", s.eval_id)
      } else {
        const { data } = await supabase
          .from("evaluacion_talleres")
          .insert(payload)
          .select("id")
          .single()
        if (data) {
          setStudents((prev) =>
            prev.map((si) =>
              si.user_id === s.user_id ? { ...si, eval_id: data.id } : si
            )
          )
        }
      }
    }
    setStudents((prev) => prev.map((s) => ({ ...s, guardado: true })))
    setSavedCount(students.filter((s) => s.aprobado !== null).length)
    setSaving(null)
  }

  return (
    <ProtectedRoute allowedRoles={["decano", "facilitador"]}>
      <div className="space-y-6">
        <Link
          href="/dashboard/rutas-aprendizaje"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Rutas
        </Link>

        <div className="bg-gradient-to-r from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Wrench className="w-6 h-6 text-violet-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{tallerInfo?.titulo || "Cargando..."}</h1>
              <p className="text-sm text-violet-200">{tallerInfo?.cargoNombre}</p>
            </div>
          </div>
          {tallerInfo?.descripcion && (
            <p className="text-sm text-violet-100 mt-2">{tallerInfo.descripcion}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-violet-200">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {students.length} estudiantes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {savedCount}/{students.length} evaluados
            </span>
            {students.some((s) => s.bloqueado) && (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                {students.filter((s) => s.bloqueado).length} con actividades pendientes
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay estudiantes asignados a este cargo</p>
            <p className="text-sm text-gray-400 mt-1">No se encontraron estudiantes con el cargo &quot;{tallerInfo?.cargoNombre}&quot;</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleGuardarTodos}
                disabled={saving !== null || students.every((s) => s.guardado || s.aprobado === null || s.bloqueado)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving === "all" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar Todos
              </button>
            </div>

            <div className="space-y-3">
              {students.map((student, index) => (
                <div
                  key={student.user_id}
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    student.bloqueado
                      ? "opacity-60 border-gray-200"
                      : student.guardado
                      ? "border-green-200 bg-green-50/30"
                      : student.aprobado !== null
                      ? "border-violet-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
                      {student.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{student.nombre}</p>
                        <span className="text-xs text-gray-400">{student.email}</span>
                        {student.bloqueado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Lock className="w-3 h-3" />
                            {student.mensajeBloqueo}
                          </span>
                        )}
                        {student.guardado && !student.bloqueado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Guardado
                          </span>
                        )}
                      </div>

                      {student.bloqueado ? (
                        <p className="mt-3 text-sm text-gray-400 italic">El estudiante debe completar las actividades anteriores antes de poder ser evaluado.</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs text-gray-500 font-medium">Evaluación:</span>
                            <button
                              onClick={() => handleEvaluar(index, true)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                student.aprobado === true
                                  ? "bg-green-500 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aprobado
                            </button>
                            <button
                              onClick={() => handleEvaluar(index, false)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                student.aprobado === false
                                  ? "bg-red-500 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              No Aprobado
                            </button>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">Observaciones (opcional)</span>
                            </div>
                            <textarea
                              value={student.observaciones}
                              onChange={(e) => handleObservaciones(index, e.target.value)}
                              rows={2}
                              placeholder="Escribe observaciones sobre el desempeño del estudiante..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none"
                            />
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleGuardar(index)}
                              disabled={saving === student.user_id || student.aprobado === null || student.guardado}
                              className="px-4 py-1.5 bg-violet-600 text-white rounded-lg font-medium text-xs hover:bg-violet-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {saving === student.user_id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Guardar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default function TallerEvalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <TallerContent id={id} />
}
