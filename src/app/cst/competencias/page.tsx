"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import {
  Search, Plus, ChevronDown, ChevronRight, Trash2, Edit3, Check, X,
  Award, HelpCircle, Star, SlidersHorizontal, Loader2, GripVertical
} from "lucide-react"

interface Competencia {
  id: string
  nombre: string
  descripcion: string
  color: string
}

interface Pregunta {
  id: string
  competencia_id: string
  texto: string
  orden: number
  respuestas?: Respuesta[]
}

interface Respuesta {
  id: string
  pregunta_id: string
  texto: string
  puntaje: number
  orden: number
}

export default function CompetenciasPage() {
  const supabase = createSupabaseClient()
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [preguntas, setPreguntas] = useState<Record<string, Pregunta[]>>({})
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set())
  const [preguntaExpandida, setPreguntaExpandida] = useState<Set<string>>(new Set())
  const [editandoPregunta, setEditandoPregunta] = useState<string | null>(null)
  const [editandoRespuesta, setEditandoRespuesta] = useState<string | null>(null)
  const [nuevaPregunta, setNuevaPregunta] = useState<Record<string, string>>({})
  const [nuevaRespuesta, setNuevaRespuesta] = useState<Record<string, { texto: string; puntaje: number }>>({})
  const [textoEditPregunta, setTextoEditPregunta] = useState("")
  const [textoEditRespuesta, setTextoEditRespuesta] = useState("")
  const [puntajeEditRespuesta, setPuntajeEditRespuesta] = useState(0)
  const [guardando, setGuardando] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: compData } = await supabase
      .from("competencias")
      .select("*")
      .order("nombre")

    if (compData) {
      setCompetencias(compData)
      const preguntasMap: Record<string, Pregunta[]> = {}
      for (const comp of compData) {
        const { data: pregData } = await supabase
          .from("cst_competencia_preguntas")
          .select("*")
          .eq("competencia_id", comp.id)
          .order("orden")

        if (pregData) {
          const preguntasConRespuestas: Pregunta[] = []
          for (const preg of pregData) {
            const { data: respData } = await supabase
              .from("cst_competencia_respuestas")
              .select("*")
              .eq("pregunta_id", preg.id)
              .order("orden")

            preguntasConRespuestas.push({
              ...preg,
              respuestas: respData || [],
            })
          }
          preguntasMap[comp.id] = preguntasConRespuestas
        }
      }
      setPreguntas(preguntasMap)
    }
    setLoading(false)
  }

  const toggleCompetencia = (id: string) => {
    setExpandidas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePregunta = (id: string) => {
    setPreguntaExpandida((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const agregarPregunta = async (competenciaId: string) => {
    const texto = nuevaPregunta[competenciaId]?.trim()
    if (!texto) return

    setGuardando(`preg-${competenciaId}`)
    const currentCount = preguntas[competenciaId]?.length || 0
    const { data, error } = await supabase
      .from("cst_competencia_preguntas")
      .insert({ competencia_id: competenciaId, texto, orden: currentCount })
      .select()
      .single()

    if (!error && data) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: [...(prev[competenciaId] || []), { ...data, respuestas: [] }],
      }))
      setNuevaPregunta((prev) => ({ ...prev, [competenciaId]: "" }))
      setPreguntaExpandida((prev) => new Set(prev).add(data.id))
    }
    setGuardando(null)
  }

  const eliminarPregunta = async (preguntaId: string, competenciaId: string) => {
    setGuardando(`del-preg-${preguntaId}`)
    const { error } = await supabase
      .from("cst_competencia_preguntas")
      .delete()
      .eq("id", preguntaId)

    if (!error) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: (prev[competenciaId] || []).filter((p) => p.id !== preguntaId),
      }))
    }
    setGuardando(null)
  }

  const guardarEdicionPregunta = async (preguntaId: string, competenciaId: string) => {
    if (!textoEditPregunta.trim()) return
    setGuardando(`edit-preg-${preguntaId}`)
    const { error } = await supabase
      .from("cst_competencia_preguntas")
      .update({ texto: textoEditPregunta.trim() })
      .eq("id", preguntaId)

    if (!error) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: (prev[competenciaId] || []).map((p) =>
          p.id === preguntaId ? { ...p, texto: textoEditPregunta.trim() } : p
        ),
      }))
      setEditandoPregunta(null)
    }
    setGuardando(null)
  }

  const agregarRespuesta = async (preguntaId: string, competenciaId: string) => {
    const key = preguntaId
    const resp = nuevaRespuesta[key]
    if (!resp?.texto?.trim()) return

    setGuardando(`resp-${preguntaId}`)
    const currentCount = preguntas[competenciaId]?.find((p) => p.id === preguntaId)?.respuestas?.length || 0
    const { data, error } = await supabase
      .from("cst_competencia_respuestas")
      .insert({
        pregunta_id: preguntaId,
        texto: resp.texto.trim(),
        puntaje: resp.puntaje,
        orden: currentCount,
      })
      .select()
      .single()

    if (!error && data) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: (prev[competenciaId] || []).map((p) =>
          p.id === preguntaId
            ? { ...p, respuestas: [...(p.respuestas || []), data] }
            : p
        ),
      }))
      setNuevaRespuesta((prev) => ({ ...prev, [key]: { texto: "", puntaje: 0 } }))
    }
    setGuardando(null)
  }

  const eliminarRespuesta = async (respuestaId: string, preguntaId: string, competenciaId: string) => {
    setGuardando(`del-resp-${respuestaId}`)
    const { error } = await supabase
      .from("cst_competencia_respuestas")
      .delete()
      .eq("id", respuestaId)

    if (!error) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: (prev[competenciaId] || []).map((p) =>
          p.id === preguntaId
            ? { ...p, respuestas: (p.respuestas || []).filter((r) => r.id !== respuestaId) }
            : p
        ),
      }))
    }
    setGuardando(null)
  }

  const guardarEdicionRespuesta = async (respuestaId: string, preguntaId: string, competenciaId: string) => {
    if (!textoEditRespuesta.trim()) return
    setGuardando(`edit-resp-${respuestaId}`)
    const { error } = await supabase
      .from("cst_competencia_respuestas")
      .update({ texto: textoEditRespuesta.trim(), puntaje: puntajeEditRespuesta })
      .eq("id", respuestaId)

    if (!error) {
      setPreguntas((prev) => ({
        ...prev,
        [competenciaId]: (prev[competenciaId] || []).map((p) =>
          p.id === preguntaId
            ? {
                ...p,
                respuestas: (p.respuestas || []).map((r) =>
                  r.id === respuestaId
                    ? { ...r, texto: textoEditRespuesta.trim(), puntaje: puntajeEditRespuesta }
                    : r
                ),
              }
            : p
        ),
      }))
      setEditandoRespuesta(null)
    }
    setGuardando(null)
  }

  const getPuntajeColor = (puntaje: number) => {
    if (puntaje >= 8) return "text-green-700 bg-green-50 border-green-200"
    if (puntaje >= 5) return "text-amber-700 bg-amber-50 border-amber-200"
    if (puntaje >= 3) return "text-orange-700 bg-orange-50 border-orange-200"
    return "text-red-700 bg-red-50 border-red-200"
  }

  const getPuntajeLabel = (puntaje: number) => {
    if (puntaje >= 8) return "Excelente"
    if (puntaje >= 5) return "Bueno"
    if (puntaje >= 3) return "Regular"
    return "Bajo"
  }

  const competenciasFiltradas = competencias.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = {
    total: competencias.length,
    conPreguntas: competencias.filter((c) => (preguntas[c.id]?.length || 0) > 0).length,
    totalPreguntas: Object.values(preguntas).reduce((sum, arr) => sum + arr.length, 0),
    totalRespuestas: Object.values(preguntas).reduce(
      (sum, arr) => sum + arr.reduce((s, p) => s + (p.respuestas?.length || 0), 0),
      0
    ),
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Award className="w-3.5 h-3.5" />
          Competencias: {stats.total}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <HelpCircle className="w-3.5 h-3.5" />
          Con preguntas: {stats.conPreguntas}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          Preguntas: {stats.totalPreguntas}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Respuestas: {stats.totalRespuestas}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar competencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        {competenciasFiltradas.map((comp) => {
          const isExpandida = expandidas.has(comp.id)
          const compPreguntas = preguntas[comp.id] || []
          const totalResp = compPreguntas.reduce((s, p) => s + (p.respuestas?.length || 0), 0)

          return (
            <div key={comp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCompetencia(comp.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {isExpandida ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: comp.color + "20" }}
                >
                  <Award className="w-4 h-4" style={{ color: comp.color }} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{comp.nombre}</h3>
                  {comp.descripcion && (
                    <p className="text-xs text-gray-500 truncate">{comp.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {compPreguntas.length} preg.
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {totalResp} resp.
                  </span>
                </div>
              </button>

              {isExpandida && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  {compPreguntas.map((pregunta, pIdx) => {
                    const isPregExpandida = preguntaExpandida.has(pregunta.id)
                    const respuestas = pregunta.respuestas || []

                    return (
                      <div key={pregunta.id} className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2 px-3 py-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
                            {pIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {editandoPregunta === pregunta.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={textoEditPregunta}
                                  onChange={(e) => setTextoEditPregunta(e.target.value)}
                                  className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => guardarEdicionPregunta(pregunta.id, comp.id)}
                                  disabled={guardando !== null}
                                  className="p-1 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditandoPregunta(null)}
                                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-900">{pregunta.texto}</p>
                            )}

                            <button
                              onClick={() => togglePregunta(pregunta.id)}
                              className="flex items-center gap-1 mt-1 text-xs text-emerald-600 hover:text-emerald-700"
                            >
                              {isPregExpandida ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              {respuestas.length} respuestas
                            </button>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditandoPregunta(pregunta.id)
                                setTextoEditPregunta(pregunta.texto)
                              }}
                              disabled={guardando !== null}
                              className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => eliminarPregunta(pregunta.id, comp.id)}
                              disabled={guardando !== null}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {guardando === `del-preg-${pregunta.id}` ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isPregExpandida && (
                          <div className="px-3 pb-3 space-y-2">
                            {respuestas.map((resp, rIdx) => (
                              <div key={resp.id} className="flex items-start gap-2 ml-8">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-medium shrink-0 mt-0.5">
                                  {String.fromCharCode(65 + rIdx)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  {editandoRespuesta === resp.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={textoEditRespuesta}
                                        onChange={(e) => setTextoEditRespuesta(e.target.value)}
                                        className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        autoFocus
                                      />
                                      <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={puntajeEditRespuesta}
                                        onChange={(e) => setPuntajeEditRespuesta(Number(e.target.value))}
                                        className="w-14 px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                      />
                                      <button
                                        onClick={() => guardarEdicionRespuesta(resp.id, pregunta.id, comp.id)}
                                        disabled={guardando !== null}
                                        className="p-1 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setEditandoRespuesta(null)}
                                        className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-gray-700">{resp.texto}</p>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPuntajeColor(resp.puntaje)}`}>
                                        {resp.puntaje} pts
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditandoRespuesta(resp.id)
                                      setTextoEditRespuesta(resp.texto)
                                      setPuntajeEditRespuesta(resp.puntaje)
                                    }}
                                    disabled={guardando !== null}
                                    className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => eliminarRespuesta(resp.id, pregunta.id, comp.id)}
                                    disabled={guardando !== null}
                                    className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {guardando === `del-resp-${resp.id}` ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center gap-2 ml-8 mt-2">
                              <input
                                type="text"
                                placeholder="Nueva respuesta..."
                                value={nuevaRespuesta[pregunta.id]?.texto || ""}
                                onChange={(e) =>
                                  setNuevaRespuesta((prev) => ({
                                    ...prev,
                                    [pregunta.id]: {
                                      ...prev[pregunta.id],
                                      texto: e.target.value,
                                      puntaje: prev[pregunta.id]?.puntaje ?? 5,
                                    },
                                  }))
                                }
                                className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                              <input
                                type="number"
                                min={0}
                                max={10}
                                placeholder="Pts"
                                value={nuevaRespuesta[pregunta.id]?.puntaje ?? 5}
                                onChange={(e) =>
                                  setNuevaRespuesta((prev) => ({
                                    ...prev,
                                    [pregunta.id]: {
                                      ...prev[pregunta.id],
                                      puntaje: Number(e.target.value),
                                    },
                                  }))
                                }
                                className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                              <button
                                onClick={() => agregarRespuesta(pregunta.id, comp.id)}
                                disabled={guardando !== null}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                              >
                                {guardando === `resp-${pregunta.id}` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nueva pregunta para esta competencia..."
                      value={nuevaPregunta[comp.id] || ""}
                      onChange={(e) =>
                        setNuevaPregunta((prev) => ({ ...prev, [comp.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") agregarPregunta(comp.id)
                      }}
                    />
                    <button
                      onClick={() => agregarPregunta(comp.id)}
                      disabled={guardando !== null}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {guardando === `preg-${comp.id}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {competenciasFiltradas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-sm">No se encontraron competencias</p>
        </div>
      )}
    </div>
  )
}
