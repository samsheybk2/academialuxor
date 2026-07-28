"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Layers, Plus, Trash2, Save, X, ChevronDown, ChevronUp, Upload } from "lucide-react"

interface EscalaNivel {
  id?: string
  nivel: number
  nombre: string
  salario_minimo: string
  salario_maximo: string
}

interface Escala {
  id: string
  nombre: string
  tipo: string
  porcentaje_diferencia: number | null
  activa: boolean
  created_at: string
  niveles: EscalaNivel[]
}

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("fijo_porcentaje")
  const [porcentajeDiferencia, setPorcentajeDiferencia] = useState("")
  const [niveles, setNiveles] = useState<EscalaNivel[]>([
    { nivel: 1, nombre: "", salario_minimo: "", salario_maximo: "" },
  ])
  const [saving, setSaving] = useState(false)

  const supabase = createSupabaseClient()

  const fetchEscalas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("nom_escalas")
      .select("*, nom_escalas_niveles(*)")
      .order("created_at", { ascending: false })

    if (data) {
      setEscalas(data.map((e: Record<string, unknown>) => ({
        id: e.id as string,
        nombre: e.nombre as string,
        tipo: e.tipo as string,
        porcentaje_diferencia: e.porcentaje_diferencia as number | null,
        activa: e.activa as boolean,
        created_at: e.created_at as string,
        niveles: ((e.nom_escalas_niveles as Array<Record<string, unknown>>) || [])
          .sort((a, b) => (a.nivel as number) - (b.nivel as number))
          .map((n: Record<string, unknown>) => ({
            id: n.id as string,
            nivel: n.nivel as number,
            nombre: n.nombre as string,
            salario_minimo: String(n.salario_minimo),
            salario_maximo: String(n.salario_maximo),
          })),
      })))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchEscalas()
  }, [fetchEscalas])

  const addNivel = () => {
    setNiveles([...niveles, { nivel: niveles.length + 1, nombre: "", salario_minimo: "", salario_maximo: "" }])
  }

  const removeNivel = (index: number) => {
    if (niveles.length <= 1) return
    setNiveles(niveles.filter((_, i) => i !== index).map((n, i) => ({ ...n, nivel: i + 1 })))
  }

  const updateNivel = (index: number, field: keyof EscalaNivel, value: string) => {
    const updated = [...niveles]
    updated[index] = { ...updated[index], [field]: value }
    setNiveles(updated)
  }

  const generateFromPercentage = () => {
    const base = parseFloat(niveles[0]?.salario_minimo) || 0
    const pct = parseFloat(porcentajeDiferencia) || 0
    if (!base || !pct) return

    const newNiveles: EscalaNivel[] = []
    let current = base
    for (let i = 0; i < Math.max(niveles.length, 5); i++) {
      const next = i === 0 ? current : current * (1 + pct / 100)
      newNiveles.push({
        nivel: i + 1,
        nombre: niveles[i]?.nombre || `Nivel ${i + 1}`,
        salario_minimo: Math.round(next).toString(),
        salario_maximo: Math.round(next * (1 + pct / 100)).toString(),
      })
      current = next * (1 + pct / 100)
    }
    setNiveles(newNiveles)
  }

  const saveEscala = async () => {
    if (!nombre || niveles.length === 0) return
    setSaving(true)

    const { data: escalaData, error } = await supabase
      .from("nom_escalas")
      .insert({
        nombre,
        tipo,
        porcentaje_diferencia: porcentajeDiferencia ? parseFloat(porcentajeDiferencia) : null,
      })
      .select()
      .single()

    if (error || !escalaData) {
      setSaving(false)
      return
    }

    const nivelesInsert = niveles
      .filter(n => n.nombre && n.salario_minimo)
      .map(n => ({
        escala_id: escalaData.id,
        nivel: n.nivel,
        nombre: n.nombre,
        salario_minimo: parseFloat(n.salario_minimo),
        salario_maximo: parseFloat(n.salario_maximo) || parseFloat(n.salario_minimo),
      }))

    if (nivelesInsert.length > 0) {
      await supabase.from("nom_escalas_niveles").insert(nivelesInsert)
    }

    resetForm()
    fetchEscalas()
    setSaving(false)
  }

  const deleteEscala = async (id: string) => {
    if (!confirm("Eliminar esta escala?")) return
    await supabase.from("nom_escalas").delete().eq("id", id)
    fetchEscalas()
  }

  const resetForm = () => {
    setNombre("")
    setTipo("fijo_porcentaje")
    setPorcentajeDiferencia("")
    setNiveles([{ nivel: 1, nombre: "", salario_minimo: "", salario_maximo: "" }])
    setShowForm(false)
  }

  return (
    <div className="min-h-full bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Escalas Salariales</h1>
              <p className="text-sm text-gray-400">Defina las escalas para calcular paquetes</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Escala
          </button>
        </div>

        {/* New Escala Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Crear Escala</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                  placeholder="Ej: Escala Corporativa 2024"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tipo *</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                >
                  <option value="fijo_porcentaje">Porcentaje fijo entre niveles</option>
                  <option value="rango_por_cargo">Rango por cargo</option>
                  <option value="importar">Importar desde archivo</option>
                </select>
              </div>
              {tipo === "fijo_porcentaje" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">% Diferencia entre niveles</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={porcentajeDiferencia}
                      onChange={(e) => setPorcentajeDiferencia(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                      placeholder="15"
                      min="1"
                      max="100"
                    />
                    <button
                      onClick={generateFromPercentage}
                      className="px-3 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 text-sm"
                    >
                      Gen.
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Niveles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-400">Niveles de la escala</label>
                <button onClick={addNivel} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300">
                  <Plus className="w-3.5 h-3.5" /> Agregar nivel
                </button>
              </div>
              <div className="space-y-2">
                {niveles.map((n, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 text-center text-xs text-gray-500 shrink-0">P{n.nivel}</span>
                    <input
                      type="text"
                      value={n.nombre}
                      onChange={(e) => updateNivel(i, "nombre", e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
                      placeholder="Nombre del nivel"
                    />
                    <input
                      type="number"
                      value={n.salario_minimo}
                      onChange={(e) => updateNivel(i, "salario_minimo", e.target.value)}
                      className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
                      placeholder="Min $"
                      min="0"
                    />
                    <input
                      type="number"
                      value={n.salario_maximo}
                      onChange={(e) => updateNivel(i, "salario_maximo", e.target.value)}
                      className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
                      placeholder="Max $"
                      min="0"
                    />
                    <button
                      onClick={() => removeNivel(i)}
                      className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                Cancelar
              </button>
              <button
                onClick={saveEscala}
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
          ) : escalas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay escalas creadas</p>
            </div>
          ) : (
            escalas.map((escala) => (
              <div key={escala.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === escala.id ? null : escala.id)}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-white">{escala.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {escala.niveles.length} niveles &middot; {escala.tipo.replace(/_/g, " ")}
                      {escala.porcentaje_diferencia && ` (${escala.porcentaje_diferencia}%)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteEscala(escala.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === escala.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                {expandedId === escala.id && escala.niveles.length > 0 && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    <table className="w-full mt-3">
                      <thead>
                        <tr className="text-xs text-gray-500">
                          <th className="text-left pb-2 font-medium">Nivel</th>
                          <th className="text-left pb-2 font-medium">Nombre</th>
                          <th className="text-right pb-2 font-medium">Minimo</th>
                          <th className="text-right pb-2 font-medium">Maximo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {escala.niveles.map((n) => (
                          <tr key={n.id || n.nivel} className="border-t border-gray-800/50">
                            <td className="py-2 text-sm text-gray-400">{n.nivel}</td>
                            <td className="py-2 text-sm text-white">{n.nombre}</td>
                            <td className="py-2 text-sm text-gray-300 text-right">${Number(n.salario_minimo).toLocaleString()}</td>
                            <td className="py-2 text-sm text-gray-300 text-right">${Number(n.salario_maximo).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
