"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { BarChart3, Plus, Trash2, Save, X, Upload } from "lucide-react"
import * as XLSX from "xlsx"

interface Percentil {
  id: string
  cargo_nombre: string
  nivel: string | null
  percentil_25: number
  percentil_50: number
  percentil_75: number
  percentil_90: number
  fuente: string | null
  fecha_referencia: string | null
}

export default function PercentilesPage() {
  const [percentiles, setPercentiles] = useState<Percentil[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [cargos, setCargos] = useState<Array<{ id: string; nombre: string; nivel: string }>>([])

  const [cargoNombre, setCargoNombre] = useState("")
  const [nivel, setNivel] = useState("")
  const [p25, setP25] = useState("")
  const [p50, setP50] = useState("")
  const [p75, setP75] = useState("")
  const [p90, setP90] = useState("")
  const [fuente, setFuente] = useState("")
  const [fechaRef, setFechaRef] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from("nom_percentiles_mercado").select("*").order("cargo_nombre"),
      supabase.from("cargos").select("id, nombre, nivel").order("nombre"),
    ])
    if (pRes.data) {
      setPercentiles(pRes.data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        cargo_nombre: p.cargo_nombre as string,
        nivel: p.nivel as string | null,
        percentil_25: Number(p.percentil_25),
        percentil_50: Number(p.percentil_50),
        percentil_75: Number(p.percentil_75),
        percentil_90: Number(p.percentil_90),
        fuente: p.fuente as string | null,
        fecha_referencia: p.fecha_referencia as string | null,
      })))
    }
    if (cRes.data) {
      setCargos(cRes.data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        nombre: c.nombre as string,
        nivel: c.nivel as string,
      })))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const savePercentil = async () => {
    if (!cargoNombre || !p50) return
    setSaving(true)
    await supabase.from("nom_percentiles_mercado").insert({
      cargo_nombre: cargoNombre,
      nivel: nivel || null,
      percentil_25: parseFloat(p25) || 0,
      percentil_50: parseFloat(p50) || 0,
      percentil_75: parseFloat(p75) || 0,
      percentil_90: parseFloat(p90) || 0,
      fuente: fuente || null,
      fecha_referencia: fechaRef || null,
    })
    resetForm()
    fetchData()
    setSaving(false)
  }

  const deletePercentil = async (id: string) => {
    if (!confirm("Eliminar este registro?")) return
    await supabase.from("nom_percentiles_mercado").delete().eq("id", id)
    fetchData()
  }

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      const inserts = rows
        .filter(r => r["Cargo"] || r["cargo_nombre"])
        .map(r => ({
          cargo_nombre: (r["Cargo"] || r["cargo_nombre"] || "") as string,
          nivel: (r["Nivel"] || r["nivel"] || null) as string | null,
          percentil_25: parseFloat(String(r["P25"] || r["percentil_25"] || 0)),
          percentil_50: parseFloat(String(r["P50"] || r["percentil_50"] || 0)),
          percentil_75: parseFloat(String(r["P75"] || r["percentil_75"] || 0)),
          percentil_90: parseFloat(String(r["P90"] || r["percentil_90"] || 0)),
          fuente: (r["Fuente"] || r["fuente"] || null) as string | null,
          fecha_referencia: (r["Fecha"] || r["fecha_referencia"] || null) as string | null,
        }))

      if (inserts.length > 0) {
        await supabase.from("nom_percentiles_mercado").insert(inserts)
        fetchData()
        alert(`${inserts.length} registros importados`)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = ""
  }

  const resetForm = () => {
    setCargoNombre("")
    setNivel("")
    setP25("")
    setP50("")
    setP75("")
    setP90("")
    setFuente("")
    setFechaRef("")
    setShowForm(false)
  }

  const filtered = percentiles.filter(p =>
    p.cargo_nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.fuente || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-full bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Percentiles de Mercado</h1>
              <p className="text-sm text-gray-400">Datos salariales de referencia por cargo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={importFromExcel}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm border border-gray-700"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
          placeholder="Buscar por cargo o fuente..."
        />

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Agregar Percentil</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm text-gray-400 mb-1.5">Cargo *</label>
                <select
                  value={cargoNombre}
                  onChange={(e) => setCargoNombre(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500"
                >
                  <option value="">Seleccionar...</option>
                  {cargos.map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                  <option value="__custom">Otro (especificar)</option>
                </select>
                {cargoNombre === "__custom" && (
                  <input
                    type="text"
                    value=""
                    onChange={(e) => setCargoNombre(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm mt-2 focus:outline-none focus:border-slate-500"
                    placeholder="Nombre del cargo"
                    autoFocus
                  />
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nivel</label>
                <select value={nivel || ""} onChange={(e) => setNivel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500">
                  <option value="">Todos</option>
                  <option value="gerentes">Gerentes</option>
                  <option value="coordinadores">Coordinadores</option>
                  <option value="administrativos">Administrativos</option>
                  <option value="operadores">Operadores</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Fuente</label>
                <input type="text" value={fuente} onChange={(e) => setFuente(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" placeholder="Ej: Survey 2024" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Fecha referencia</label>
                <input type="date" value={fechaRef} onChange={(e) => setFechaRef(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">P25 ($)</label>
                <input type="number" value={p25} onChange={(e) => setP25(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" min="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">P50 ($)</label>
                <input type="number" value={p50} onChange={(e) => setP50(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" min="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">P75 ($)</label>
                <input type="number" value={p75} onChange={(e) => setP75(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" min="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">P90 ($)</label>
                <input type="number" value={p90} onChange={(e) => setP90(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500" min="0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
              <button
                onClick={savePercentil}
                disabled={saving || !cargoNombre || !p50}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{search ? "Sin resultados" : "No hay percentiles registrados"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Cargo</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nivel</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">P25</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">P50</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">P75</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">P90</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fuente</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{p.cargo_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 capitalize">{p.nivel || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">${p.percentil_25.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">${p.percentil_50.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">${p.percentil_75.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">${p.percentil_90.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.fuente || "-"}</td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => deletePercentil(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
