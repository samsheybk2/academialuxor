"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Building2, Building, FolderOpen, Network, Users } from "lucide-react"

type TipoUnidad = "direccion" | "gerencia" | "departamento"

interface UnidadOrganizacional {
  id: string
  codigo?: string
  nombre: string
  tipo: TipoUnidad
  parent_id: string | null
  color: string
  descripcion?: string
}

const tipoIcon: Record<TipoUnidad, React.ElementType> = {
  direccion: Building2,
  gerencia: Building,
  departamento: FolderOpen,
}

const tipoLabel: Record<TipoUnidad, string> = {
  direccion: "Direccion",
  gerencia: "Gerencia",
  departamento: "Departamento",
}

const coloresBase = ["#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#6366f1"]

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

export default function CstOrganigramaPage() {
  const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([])
  const [cargos, setCargos] = useState<{ id: string; nombre: string; unidad_id: string | null }[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { createSupabaseClient } = await import("@/lib/supabase")
      const supabase = createSupabaseClient()
      const [unidadesRes, cargosRes] = await Promise.all([
        supabase.from("unidades_organizacionales").select("*").order("tipo", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("cargos").select("id, nombre, unidad_id"),
      ])
      if (unidadesRes.data) setUnidades(unidadesRes.data)
      if (cargosRes.data) setCargos(cargosRes.data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const roots = unidades.filter((u) => !u.parent_id)
  const getChildren = (parentId: string) => unidades.filter((u) => u.parent_id === parentId)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (roots.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set(roots.map((r) => r.id)))
    }
  }, [roots])

  function renderNode(unidad: UnidadOrganizacional, nivel: number) {
    const children = getChildren(unidad.id)
    const cargosUnidad = cargos.filter((c) => c.unidad_id === unidad.id)
    const hasChildren = children.length > 0 || cargosUnidad.length > 0
    const isExpanded = expandedIds.has(unidad.id)
    const rootColor = getRootColor(unidad.id, unidades)
    const Icon = tipoIcon[unidad.tipo]

    return (
      <div key={unidad.id}>
        <button
          onClick={() => hasChildren && toggleExpand(unidad.id)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 text-left ${
            nivel === 0 ? "font-semibold" : ""
          }`}
          style={{ paddingLeft: `${12 + nivel * 28}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            )
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <Icon className="w-4 h-4 shrink-0" style={{ color: rootColor }} />
          <span className="text-sm text-gray-900 truncate">{unidad.nombre}</span>
          <span className="text-[10px] text-gray-400 ml-auto shrink-0">{tipoLabel[unidad.tipo]}</span>
          {unidad.codigo && (
            <span className="text-[10px] text-gray-400 font-mono">{unidad.codigo}</span>
          )}
        </button>

        {isExpanded && (
          <>
            {cargosUnidad.map((cargo) => (
              <div
                key={cargo.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600"
                style={{ paddingLeft: `${12 + (nivel + 1) * 28}px` }}
              >
                <span className="w-4 shrink-0" />
                <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-sm">{cargo.nombre}</span>
              </div>
            ))}
            {children.map((child) => renderNode(child, nivel + 1))}
          </>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organigrama</h1>
        <p className="text-sm text-gray-500 mt-1">Estructura organizacional de la empresa</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {roots.map((root) => renderNode(root, 0))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <Network className="w-3.5 h-3.5" />
        {unidades.length} unidades · {cargos.length} cargos
      </div>
    </div>
  )
}
