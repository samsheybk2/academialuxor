"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { UnidadOrganizacional, TipoUnidad } from "@/types"
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  Building2,
  Building,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Users,
  Network,
  UserCog,
  Download,
} from "lucide-react"
import * as XLSX from "xlsx"

const coloresBase = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#84cc16",
  "#f97316",
]

const tipoIcon: Record<TipoUnidad, React.ElementType> = {
  direccion: Building2,
  gerencia: Building,
  departamento: FolderOpen,
}

const tipoLabel: Record<TipoUnidad, string> = {
  direccion: "Dirección",
  gerencia: "Gerencia",
  departamento: "Departamento",
}

function getRootColor(unidadId: string, unidades: UnidadOrganizacional[]): string {
  let current = unidades.find((u) => u.id === unidadId)
  if (!current) return "#6366f1"
  
  if (current.tipo === "direccion") return current.color || "#6366f1"
  if (current.tipo === "gerencia") {
    const parent = current.parent_id ? unidades.find((u) => u.id === current.parent_id) : null
    return parent?.color || current.color || "#6366f1"
  }
  if (current.tipo === "departamento") {
    const parent = current.parent_id ? unidades.find((u) => u.id === current.parent_id) : null
    if (parent?.tipo === "gerencia") return parent.color || "#6366f1"
    if (parent?.parent_id) {
      const abuelo = unidades.find((u) => u.id === parent.parent_id)
      if (abuelo?.tipo === "gerencia") return abuelo.color || "#6366f1"
    }
    return parent?.color || current.color || "#6366f1"
  }
  
  return current.color || "#6366f1"
}

interface UnidadNodeProps {
  unidad: UnidadOrganizacional
  nivel: number
  unidades: UnidadOrganizacional[]
  cargos: { id: string; nombre: string; unidad_id: string | null; nivel?: string; jefe_id?: string | null }[]
  expandedIds: Set<string>
  editingId: string | null
  editForm: { codigo: string; nombre: string; tipo: TipoUnidad; parent_id: string; color: string; descripcion: string }
  isDecano: boolean
  saving: boolean
  toggleExpand: (id: string) => void
  startEdit: (unidad: UnidadOrganizacional, e: React.MouseEvent) => void
  handleDelete: (id: string, e: React.MouseEvent) => void
  handleParentChange: (parentId: string, isEdit: boolean) => void
  setEditForm: React.Dispatch<React.SetStateAction<{ codigo: string; nombre: string; tipo: TipoUnidad; parent_id: string; color: string; descripcion: string }>>
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>
  handleSaveEdit: () => void
}

function UnidadNode({
  unidad,
  nivel,
  unidades,
  cargos,
  expandedIds,
  editingId,
  editForm,
  isDecano,
  saving,
  toggleExpand,
  startEdit,
  handleDelete,
  handleParentChange,
  setEditForm,
  setEditingId,
  handleSaveEdit,
}: UnidadNodeProps) {
  const hijos = unidades.filter((u) => u.parent_id === unidad.id)
  const isExpanded = expandedIds.has(unidad.id)
  const Icon = tipoIcon[unidad.tipo]
  const unidadCargos = cargos.filter((c) => c.unidad_id === unidad.id)
  const cargoCount = unidadCargos.length
  const isEditing = editingId === unidad.id
  const [showCargos, setShowCargos] = useState(false)

  return (
    <div className={`${nivel > 0 ? "ml-4 border-l-2 border-gray-100 pl-3" : ""}`}>
      <div
        className={`group flex items-start gap-2 ${nivel === 0 ? "py-2 px-3" : "py-1.5 px-2"} rounded-lg transition-all ${
          isEditing ? "bg-luxor-primary/5 border border-luxor-primary/20" : "hover:bg-gray-50"
        }`}
      >
        {hijos.length > 0 && (
          <button
            onClick={() => toggleExpand(unidad.id)}
            className="mt-0.5 p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
        )}
        {hijos.length === 0 && <div className="w-4 flex-shrink-0" />}

        <div
          className={`${nivel === 0 ? "w-8 h-8" : "w-7 h-7"} rounded-lg flex items-center justify-center flex-shrink-0 border-2`}
          style={{ backgroundColor: `${unidad.color}15`, borderColor: unidad.color }}
        >
          <Icon className={`${nivel === 0 ? "w-4 h-4" : "w-3.5 h-3.5"}`} style={{ color: unidad.color }} />
        </div>

        {isEditing ? (
          <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="grid sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={editForm.codigo}
                onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                placeholder="Código"
              />
              <input
                type="text"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                autoFocus
              />
              <select
                value={editForm.tipo}
                onChange={(e) => {
                  const newTipo = e.target.value as TipoUnidad
                  setEditForm((prev) => {
                    if (prev.parent_id && (prev.color === "#6366f1" || prev.color === getRootColor(prev.parent_id, unidades))) {
                      const parent = unidades.find((u) => u.id === prev.parent_id)
                      let newColor = prev.color
                      if (newTipo === "departamento" && parent) {
                        if (parent.tipo === "gerencia") newColor = parent.color
                        else if (parent.tipo === "direccion") newColor = parent.color
                        else {
                          const abuelo = parent.parent_id ? unidades.find((u) => u.id === parent.parent_id) : null
                          if (abuelo?.tipo === "gerencia") newColor = abuelo.color
                        }
                      } else if (parent) {
                        newColor = parent.color
                      }
                      return { ...prev, tipo: newTipo, color: newColor }
                    }
                    return { ...prev, tipo: newTipo }
                  })
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
              >
                <option value="direccion">Dirección</option>
                <option value="gerencia">Gerencia</option>
                <option value="departamento">Departamento</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <select
                value={editForm.parent_id}
                onChange={(e) => handleParentChange(e.target.value, true)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
              >
                <option value="">Sin padre (raíz)</option>
                {unidades
                  .filter((u) => {
                    if (u.id === unidad.id) return false
                    if (editForm.tipo === "departamento") return u.tipo === "gerencia" || u.tipo === "direccion"
                    if (editForm.tipo === "gerencia") return u.tipo === "direccion"
                    return false
                  })
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {tipoLabel[u.tipo]}: {u.nombre}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-400">
                {editForm.tipo === "departamento" && "Solo puede ser hijo de una Gerencia o Dirección"}
                {editForm.tipo === "gerencia" && "Solo puede ser hijo de una Dirección"}
                {editForm.tipo === "direccion" && "Las Direcciones no tienen padre"}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: editForm.color }}
                />
                <input
                  type="text"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coloresBase.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, color })}
                  className={`w-6 h-6 rounded-md border-2 transition-all ${
                    editForm.color === color ? "border-gray-900 scale-110" : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              value={editForm.descripcion}
              onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30"
              placeholder="Descripción"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-3 py-1.5 bg-luxor-primary text-white rounded-lg text-xs font-medium hover:bg-luxor-secondary disabled:opacity-50 flex items-center gap-1"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {unidad.codigo && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-gray-200 text-gray-700">
                  {unidad.codigo}
                </span>
              )}
              <h3 className={`${nivel === 0 ? "font-semibold text-gray-900 text-sm" : "font-medium text-gray-900 text-xs"}`}>{unidad.nombre}</h3>
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: unidad.color }}
              >
                {tipoLabel[unidad.tipo]}
              </span>
              {cargoCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" />
                  {cargoCount} cargo{cargoCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unidad.descripcion && nivel === 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unidad.descripcion}</p>
            )}
            {hijos.length > 0 && !isExpanded && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {hijos.length} subunidad{hijos.length > 1 ? "es" : ""}
              </p>
            )}
          </div>
        )}

        {!isEditing && isDecano && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => startEdit(unidad, e)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDelete(unidad.id, e)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {unidadCargos.length > 0 && (
        <div className={`${nivel > 0 ? "ml-4 pl-3" : "ml-12"} mt-1`}>
          <button
            onClick={() => setShowCargos(!showCargos)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showCargos ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Users className="w-3 h-3" />
            {cargoCount} cargo{cargoCount > 1 ? "s" : ""}
          </button>
          {showCargos && (
            <div className="mt-1 space-y-1">
              {unidadCargos.map((cargo) => {
                const jefe = cargo.jefe_id ? unidadCargos.find((c) => c.id === cargo.jefe_id) : null
                return (
                  <div
                    key={cargo.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-luxor-primary" />
                    <span className="text-xs text-gray-700 font-medium flex-1">{cargo.nombre}</span>
                    {cargo.nivel && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-200 text-gray-600 capitalize">
                        {cargo.nivel}
                      </span>
                    )}
                    {jefe && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                        <UserCog className="w-2.5 h-2.5" />
                        Jefe: {jefe.nombre}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {isExpanded && hijos.length > 0 && (
        <div className="mt-0.5">
          {hijos.map((hijo) => (
            <UnidadNode
              key={hijo.id}
              unidad={hijo}
              nivel={nivel + 1}
              unidades={unidades}
              cargos={cargos}
              expandedIds={expandedIds}
              editingId={editingId}
              editForm={editForm}
              isDecano={isDecano}
              saving={saving}
              toggleExpand={toggleExpand}
              startEdit={startEdit}
              handleDelete={handleDelete}
              handleParentChange={handleParentChange}
              setEditForm={setEditForm}
              setEditingId={setEditingId}
              handleSaveEdit={handleSaveEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrganigramaContent() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const isDecano = user?.rol === "decano" || user?.rol === "developer"

  const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([])
  const [cargos, setCargos] = useState<{ id: string; nombre: string; unidad_id: string | null; nivel?: string; jefe_id?: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUnidad, setNewUnidad] = useState({ codigo: "", nombre: "", tipo: "departamento" as TipoUnidad, parent_id: "", color: "#6366f1", descripcion: "" })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ codigo: "", nombre: "", tipo: "departamento" as TipoUnidad, parent_id: "", color: "#6366f1", descripcion: "" })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showCadenaMando, setShowCadenaMando] = useState(false)
  const [miCadena, setMiCadena] = useState<UnidadOrganizacional[]>([])

  function getRootColorLocal(unidadId: string): string {
    return getRootColor(unidadId, unidades)
  }

  function handleParentChange(parentId: string, isEdit: boolean) {
    const getNewColor = (tipo: TipoUnidad) => {
      if (!parentId) return "#6366f1"
      const parent = unidades.find((u) => u.id === parentId)
      if (!parent) return "#6366f1"
      
      if (tipo === "direccion") return parent.color || "#6366f1"
      if (tipo === "gerencia") return parent.color || "#6366f1"
      if (tipo === "departamento") {
        if (parent.tipo === "gerencia") return parent.color || "#6366f1"
        if (parent.tipo === "direccion") return parent.color || "#6366f1"
        const abuelo = parent.parent_id ? unidades.find((u) => u.id === parent.parent_id) : null
        if (abuelo?.tipo === "gerencia") return abuelo.color || "#6366f1"
        return parent.color || "#6366f1"
      }
      return "#6366f1"
    }

    if (isEdit) {
      setEditForm((prev) => {
        const newColor = prev.color === "#6366f1" || prev.color === getRootColorLocal(prev.parent_id || "") ? getNewColor(prev.tipo) : prev.color
        return { ...prev, parent_id: parentId, color: newColor }
      })
    } else {
      setNewUnidad((prev) => {
        const newColor = prev.color === "#6366f1" || prev.color === getRootColorLocal(prev.parent_id || "") ? getNewColor(prev.tipo) : prev.color
        return { ...prev, parent_id: parentId, color: newColor }
      })
    }
  }

  useEffect(() => {
    fetchData()
    if (user?.id) fetchMiCadena()
  }, [user?.id])

  async function fetchData() {
    setLoading(true)
    const [unidadesRes, cargosRes] = await Promise.all([
      supabase.from("unidades_organizacionales").select("*").order("tipo", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("cargos").select("id, nombre, unidad_id, nivel, jefe_id"),
    ])
    setUnidades(unidadesRes.data || [])
    setCargos(cargosRes.data || [])
    setLoading(false)
  }

  async function fetchMiCadena() {
    if (!user) return
    const { data: profile } = await supabase
      .from("profiles")
      .select("cargo")
      .eq("id", user.id)
      .single()

    if (!profile?.cargo) return

    const { data: cargo } = await supabase
      .from("cargos")
      .select("unidad_id")
      .eq("nombre", profile.cargo)
      .single()

    if (!cargo?.unidad_id) return

    const cadena: UnidadOrganizacional[] = []
    let currentId: string | null = cargo.unidad_id

    while (currentId) {
      const { data: unidad } = await supabase
        .from("unidades_organizacionales")
        .select("*")
        .eq("id", currentId)
        .single()

      if (unidad) {
        cadena.unshift(unidad)
        currentId = unidad.parent_id
      } else {
        break
      }
    }

    setMiCadena(cadena)
  }

  async function handleCreate() {
    if (!newUnidad.nombre.trim()) return
    setSaving(true)
    await supabase.from("unidades_organizacionales").insert({
      codigo: newUnidad.codigo.trim() || null,
      nombre: newUnidad.nombre.trim(),
      tipo: newUnidad.tipo,
      parent_id: newUnidad.parent_id || null,
      color: newUnidad.color || "#6366f1",
      descripcion: newUnidad.descripcion.trim() || null,
    })
    setNewUnidad({ codigo: "", nombre: "", tipo: "departamento", parent_id: "", color: "#6366f1", descripcion: "" })
    setShowCreateForm(false)
    setSaving(false)
    fetchData()
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("¿Eliminar esta unidad y todas sus subunidades?")) return
    await supabase.from("unidades_organizacionales").delete().eq("id", id)
    fetchData()
  }

  function startEdit(unidad: UnidadOrganizacional, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(unidad.id)
    setEditForm({
      codigo: unidad.codigo || "",
      nombre: unidad.nombre,
      tipo: unidad.tipo,
      parent_id: unidad.parent_id || "",
      color: unidad.color || "#6366f1",
      descripcion: unidad.descripcion || "",
    })
  }

  async function handleSaveEdit() {
    if (!editingId || !editForm.nombre.trim()) return
    setSaving(true)
    await supabase
      .from("unidades_organizacionales")
      .update({
        codigo: editForm.codigo.trim() || null,
        nombre: editForm.nombre.trim(),
        tipo: editForm.tipo,
        parent_id: editForm.parent_id || null,
        color: editForm.color || "#6366f1",
        descripcion: editForm.descripcion.trim() || null,
      })
      .eq("id", editingId)
    setEditingId(null)
    setSaving(false)
    fetchData()
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandAll() {
    setExpandedIds(new Set(unidades.map((u) => u.id)))
  }

  function collapseAll() {
    setExpandedIds(new Set())
  }

  function descargarExcel() {
    const datos: any[] = []
    
    datos.push(["ORGANIGRAMA - ACADEMIA LUXOR"])
    datos.push(["Generado:", new Date().toLocaleString("es-VE")])
    datos.push([])
    datos.push(["Tipo", "Código", "Nombre", "Unidad Padre", "Color", "Descripción", "Cantidad de Cargos"])
    
    const unidadesOrdenadas = ordenarUnidades(unidades)
    
    for (const unidad of unidadesOrdenadas) {
      const padre = unidad.parent_id ? unidades.find((u) => u.id === unidad.parent_id) : null
      const cantidadCargos = cargos.filter((c) => c.unidad_id === unidad.id).length
      
      datos.push([
        unidad.tipo.toUpperCase(),
        unidad.codigo || "",
        unidad.nombre,
        padre?.nombre || "",
        unidad.color || "#6366f1",
        unidad.descripcion || "",
        cantidadCargos
      ])
    }
    
    datos.push([])
    datos.push(["CARGOS DETALLADOS"])
    datos.push(["Cargo", "Nivel", "Unidad", "Jefe Inmediato"])
    
    for (const unidad of unidadesOrdenadas) {
      const cargosDeUnidad = cargos.filter((c) => c.unidad_id === unidad.id)
      for (const cargo of cargosDeUnidad) {
        const jefe = cargo.jefe_id ? cargos.find((c) => c.id === cargo.jefe_id) : null
        datos.push([
          cargo.nombre,
          cargo.nivel || "operadores",
          unidad.nombre,
          jefe?.nombre || ""
        ])
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Organigrama")
    
    ws["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 35 },
      { wch: 35 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 }
    ]
    
    XLSX.writeFile(wb, `organigrama_luxor_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  function ordenarUnidades(lista: UnidadOrganizacional[]): UnidadOrganizacional[] {
    const direcciones = lista.filter((u) => u.tipo === "direccion").sort((a, b) => a.nombre.localeCompare(b.nombre))
    const resultado: UnidadOrganizacional[] = []

    for (const dir of direcciones) {
      resultado.push(dir)
      const gerencias = lista.filter((u) => u.parent_id === dir.id).sort((a, b) => a.nombre.localeCompare(b.nombre))
      for (const ger of gerencias) {
        resultado.push(ger)
        const deps = lista.filter((u) => u.parent_id === ger.id).sort((a, b) => a.nombre.localeCompare(b.nombre))
        resultado.push(...deps)
      }
    }

    const gerenciasSinPadre = lista.filter((u) => u.tipo === "gerencia" && !u.parent_id).sort((a, b) => a.nombre.localeCompare(b.nombre))
    for (const ger of gerenciasSinPadre) {
      resultado.push(ger)
      const deps = lista.filter((u) => u.parent_id === ger.id).sort((a, b) => a.nombre.localeCompare(b.nombre))
      resultado.push(...deps)
    }

    const depsSinPadre = lista.filter((u) => u.tipo === "departamento" && !u.parent_id).sort((a, b) => a.nombre.localeCompare(b.nombre))
    resultado.push(...depsSinPadre)

    return resultado
  }

  const rootUnidades = unidades.filter((u) => !u.parent_id)

  return (
    <div className="space-y-6">
      {miCadena.length > 0 && (
        <div className="bg-gradient-to-r from-luxor-primary to-luxor-secondary rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              <h3 className="font-semibold">Tu Cadena de Mando</h3>
            </div>
            <button
              onClick={() => setShowCadenaMando(!showCadenaMando)}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {showCadenaMando ? "Ocultar" : "Ver detalle"}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {miCadena.map((u, i) => (
              <div key={u.id} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-4 h-4 text-white/40" />}
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: `${u.color}40`, border: `1px solid ${u.color}80` }}
                >
                  {u.nombre}
                </span>
              </div>
            ))}
          </div>
          {showCadenaMando && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-sm text-white/80">
                Perteneces a: <span className="font-semibold text-white">{miCadena[miCadena.length - 1]?.nombre}</span>
              </p>
              {miCadena.length > 1 && (
                <p className="text-xs text-white/60 mt-1">
                  Reportas a: {miCadena.slice(0, -1).map((u) => u.nombre).join(" → ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-luxor-primary/10 text-luxor-primary text-xs font-semibold">
            <Network className="w-3.5 h-3.5" />
            {unidades.length} unidades
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            {unidades.filter((u) => u.tipo === "direccion").length} direcciones
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold">
            <Building className="w-3.5 h-3.5" />
            {unidades.filter((u) => u.tipo === "gerencia").length} gerencias
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
            <FolderOpen className="w-3.5 h-3.5" />
            {unidades.filter((u) => u.tipo === "departamento").length} departamentos
          </span>
          <div className="flex gap-2 ml-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Expandir todo
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Colapsar todo
            </button>
            <button
              onClick={descargarExcel}
              className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Excel
            </button>
          </div>
        </div>
        {isDecano && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Unidad
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl border border-luxor-primary/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Nueva Unidad Organizacional</h3>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewUnidad({ codigo: "", nombre: "", tipo: "departamento", parent_id: "", color: "#6366f1", descripcion: "" })
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input
                type="text"
                value={newUnidad.codigo}
                onChange={(e) => setNewUnidad({ ...newUnidad, codigo: e.target.value })}
                placeholder="Ej: DIR-FIN"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                type="text"
                value={newUnidad.nombre}
                onChange={(e) => setNewUnidad({ ...newUnidad, nombre: e.target.value })}
                placeholder="Ej: Dirección de Finanzas"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Tipo *</label>
              <select
                value={newUnidad.tipo}
                onChange={(e) => {
                  const newTipo = e.target.value as TipoUnidad
                  setNewUnidad((prev) => {
                    if (prev.parent_id && (prev.color === "#6366f1" || prev.color === getRootColor(prev.parent_id, unidades))) {
                      const parent = unidades.find((u) => u.id === prev.parent_id)
                      let newColor = prev.color
                      if (newTipo === "departamento" && parent) {
                        if (parent.tipo === "gerencia") newColor = parent.color
                        else if (parent.tipo === "direccion") newColor = parent.color
                        else {
                          const abuelo = parent.parent_id ? unidades.find((u) => u.id === parent.parent_id) : null
                          if (abuelo?.tipo === "gerencia") newColor = abuelo.color
                        }
                      } else if (parent) {
                        newColor = parent.color
                      }
                      return { ...prev, tipo: newTipo, color: newColor }
                    }
                    return { ...prev, tipo: newTipo }
                  })
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
              >
                <option value="direccion">Dirección</option>
                <option value="gerencia">Gerencia</option>
                <option value="departamento">Departamento</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Unidad Padre</label>
              <select
                value={newUnidad.parent_id}
                onChange={(e) => handleParentChange(e.target.value, false)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
              >
                <option value="">Ninguna (raíz)</option>
                {unidades
                  .filter((u) => {
                    if (newUnidad.tipo === "departamento") return u.tipo === "gerencia" || u.tipo === "direccion"
                    if (newUnidad.tipo === "gerencia") return u.tipo === "direccion"
                    return false
                  })
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {tipoLabel[u.tipo]}: {u.nombre}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-400">
                {newUnidad.tipo === "departamento" && "Solo puede ser hijo de una Gerencia o Dirección"}
                {newUnidad.tipo === "gerencia" && "Solo puede ser hijo de una Dirección"}
                {newUnidad.tipo === "direccion" && "Las Direcciones no tienen padre"}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Color <span className="text-xs text-gray-400 font-normal">(auto-asignado según padre)</span></label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {coloresBase.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewUnidad({ ...newUnidad, color })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      newUnidad.color === color ? "border-gray-900 scale-110" : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: newUnidad.color }}
                />
                <input
                  type="text"
                  value={newUnidad.color}
                  onChange={(e) => setNewUnidad({ ...newUnidad, color: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
                  placeholder="#6366f1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              value={newUnidad.descripcion}
              onChange={(e) => setNewUnidad({ ...newUnidad, descripcion: e.target.value })}
              placeholder="Descripción de la unidad"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewUnidad({ codigo: "", nombre: "", tipo: "departamento", parent_id: "", color: "#6366f1", descripcion: "" })
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!newUnidad.nombre.trim() || saving}
              className="px-4 py-2 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Crear Unidad
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
          </div>
        ) : unidades.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <Network className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay unidades organizacionales</p>
            <p className="text-sm text-gray-400 mt-1">Crea direcciones, gerencias y departamentos</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootUnidades.map((unidad) => (
              <UnidadNode
                key={unidad.id}
                unidad={unidad}
                nivel={0}
                unidades={unidades}
                cargos={cargos}
                expandedIds={expandedIds}
                editingId={editingId}
                editForm={editForm}
                isDecano={isDecano}
                saving={saving}
                toggleExpand={toggleExpand}
                startEdit={startEdit}
                handleDelete={handleDelete}
                handleParentChange={handleParentChange}
                setEditForm={setEditForm}
                setEditingId={setEditingId}
                handleSaveEdit={handleSaveEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrganigramaPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador", "estudiante"]}>
      <OrganigramaContent />
    </ProtectedRoute>
  )
}
