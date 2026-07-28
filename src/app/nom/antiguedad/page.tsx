"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Clock, Plus, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react"

interface Tramo {
  desde: number
  hasta: number
  porcentaje: number
}

interface Regla {
  id: string
  nombre: string
  tipo: string
  porcentaje_anual: number | null
  tramos: Tramo[]
  activa: boolean
  created_at: string
}

export default function AntiguedadPage() {
  const [reglas, setReglas] = useState<Regla[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("porcentaje_anual")
  const [porcentajeAnual, setPorcentajeAnual] = useState("")
  const [tramos, setTramos] = useState<Tramo[]>([
    { desde: 0, hasta: 2, porcentaje: 2 },
  ])
  const [saving, setSaving] = useState(false)

  const supabase = createSupabaseClient()

  const fetchReglas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("nom_antiguedad_reglas").select("*").order("created_at", { ascending: false })
    if (data) {
      setReglas(data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        nombre: r.nombre as string,
        tipo: r.tipo as string,
        porcentaje_anual: r.porcentaje_anual as number | null,
        tramos: (r.tramos as Tramo[]) || [],
        activa: r.activa as boolean,
        created_at: r.created_at as string,
      })))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchReglas()
  }, [fetchReglas])

  const addTramo = () => {
    const last = tramos[tramos.length - 1]
    setTramos([...tramos, { desde: last ? last.hasta + 1 : 0, hasta: last ? last.hasta + 3 : 3, porcentaje: last ? last.porcentaje + 1 : 3 }])
  }

  const removeTramo = (index: number) => {
    if (tramos.length <= 1) return
    setTramos(tramos.filter((_, i) => i !== index))
  }

  const updateTramo = (index: number, field: keyof Tramo, value: number) => {
    const updated = [...tramos]
    updated[index] = { ...updated[index], [field]: value }
    setTramos(updated)
  }

  const saveRegla = async () => {
    if (!nombre) return
    setSaving(true)
    await supabase.from("nom_antiguedad_reglas").insert({
      nombre,
      tipo,
      porcentaje_anual: tipo === "porcentaje_anual" ? parseFloat(porcentajeAnual) || null : null,
      tramos: tipo === "tramos" ? tramos : [],
    })
    resetForm()
    fetchReglas()
    setSaving(false)
  }

  const deleteRegla = async (id: string) => {
    if (!confirm("Eliminar esta regla?")) return
    await supabase.from("nom_antiguedad_reglas").delete().eq("id", id)
    fetchReglas()
  }

  const resetForm = () => {
    setNombre("")
    setTipo("porcentaje_anual")
    setPorcentajeAnual("")
    setTramos([{ desde: 0, hasta: 2, porcentaje: 2 }])
    setShowForm(false)
  }

  return (
    <div className="min-h-full bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Reglas de Antiguedad</h1>
              <p className="text-sm text-gray-400">Configure las bonificaciones por antiguedad</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Regla
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Crear Regla</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                  placeholder="Ej: Regla Corporativa"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tipo *</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                >
                  <option value="porcentaje_anual">Porcentaje por anio</option>
                  <option value="tramos">Tramos por rango de anios</option>
                </select>
              </div>
            </div>

            {tipo === "porcentaje_anual" ? (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Porcentaje por anio de antiguedad (%)</label>
                <input
                  type="number"
                  value={porcentajeAnual}
                  onChange={(e) => setPorcentajeAnual(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                  placeholder="Ej: 2.5"
                  min="0"
                  max="50"
                  step="0.5"
                />
                <p className="text-xs text-gray-500 mt-1">Se aplica este % por cada anio trabajado. Tope maximo: 50%.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Tramos</label>
                  <button onClick={addTramo} className="text-xs text-slate-400 hover:text-slate-300">+ Agregar tramo</button>
                </div>
                <div className="space-y-2">
                  {tramos.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6 shrink-0">#{i + 1}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Desde:</span>
                        <input
                          type="number"
                          value={t.desde}
                          onChange={(e) => updateTramo(i, "desde", parseInt(e.target.value) || 0)}
                          className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-slate-500"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Hasta:</span>
                        <input
                          type="number"
                          value={t.hasta}
                          onChange={(e) => updateTramo(i, "hasta", parseInt(e.target.value) || 0)}
                          className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-slate-500"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">%:</span>
                        <input
                          type="number"
                          value={t.porcentaje}
                          onChange={(e) => updateTramo(i, "porcentaje", parseFloat(e.target.value) || 0)}
                          className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-slate-500"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <button
                        onClick={() => removeTramo(i)}
                        className="p-1 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
              <button
                onClick={saveRegla}
                disabled={saving || !nombre}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando...</div>
          ) : reglas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay reglas creadas</p>
            </div>
          ) : (
            reglas.map((regla) => (
              <div key={regla.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === regla.id ? null : regla.id)}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-white">{regla.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {regla.tipo === "porcentaje_anual"
                        ? `${regla.porcentaje_anual}% por anio`
                        : `${regla.tramos.length} tramos`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRegla(regla.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === regla.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                {expandedId === regla.id && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    {regla.tipo === "porcentaje_anual" ? (
                      <div className="mt-3 bg-gray-800/50 rounded-xl p-3">
                        <p className="text-sm text-gray-300">
                          Bonificacion: <span className="text-white font-semibold">{regla.porcentaje_anual}%</span> por cada anio de antiguedad
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Tope maximo: 50% del salario</p>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-1.5">
                        {regla.tramos.map((t, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500">Tramo {i + 1}</span>
                            <span className="text-sm text-gray-300">{t.desde} - {t.hasta} anios</span>
                            <span className="text-sm text-white font-semibold">{t.porcentaje}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
