"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import {
  Search, Plus, Users, Briefcase, UserMinus, UserPlus, X, Calendar,
  Mail, Phone, MapPin,   ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, MoreHorizontal, SlidersHorizontal, Loader2
} from "lucide-react"

interface Empleado {
  id: string
  nombre: string
  email: string
  cedula: string
  telefono: string
  cargo_id: string
  cargo_nombre: string
  fecha_ingreso: string
  estatus: "activo" | "retirado"
  fecha_retiro?: string
}

interface CargoPlaza {
  id: string
  nombre: string
  unidad_id?: string
  total_plazas?: number
}

interface Unidad {
  id: string
  nombre: string
}

export default function PlantillaPage() {
  const supabase = createSupabaseClient()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargos, setCargos] = useState<CargoPlaza[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAgregar, setShowAgregar] = useState(false)
  const [agregarCargo, setAgregarCargo] = useState("")
  const [retirando, setRetirando] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: "", cedula: "", email: "", telefono: "", fecha_ingreso: "" })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [empleadosRes, cargosRes, unidadesRes] = await Promise.all([
        supabase.from("cst_empleados").select("*").order("nombre"),
        supabase.from("cargos").select("id, nombre, unidad_id").order("nombre"),
        supabase.from("unidades_organizacionales").select("id, nombre").order("nombre"),
      ])
      if (unidadesRes.data) setUnidades(unidadesRes.data as Unidad[])
      if (cargosRes.data) setCargos(cargosRes.data as CargoPlaza[])
      if (empleadosRes.data) {
        const cargoNombreMap = new Map((cargosRes.data || []).map((c: any) => [c.id, c.nombre]))
        const empleadosConNombre = empleadosRes.data.map((e: any) => ({
          ...e,
          cargo_nombre: cargoNombreMap.get(e.cargo_id) || "",
        }))
        setEmpleados(empleadosConNombre as Empleado[])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

    const [gerenciaExpandida, setGerenciaExpandida] = useState<string | null>(null)
  const [cargoExpandido, setCargoExpandido] = useState<string | null>(null)

  const stats = {
    total: empleados.filter((e) => e.estatus === "activo").length,
    plazas: cargos.reduce((s, c) => s + (c.total_plazas || 1), 0),
    vacantes: cargos.reduce((s, c) => s + (c.total_plazas || 1), 0) - empleados.filter((e) => e.estatus === "activo").length,
    retirados: empleados.filter((e) => e.estatus === "retirado").length,
  }

  const getFiltrados = (items: typeof empleados) =>
    items.filter((e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cargo_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cedula.includes(busqueda)
    )

  const retirarEmpleado = async (id: string) => {
    const hoy = new Date().toISOString().split("T")[0]
    const { error } = await supabase
      .from("cst_empleados")
      .update({ estatus: "retirado", fecha_retiro: hoy })
      .eq("id", id)
    if (!error) {
      setEmpleados((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, estatus: "retirado", fecha_retiro: hoy } : e
        )
      )
    }
    setRetirando(null)
  }

  const agregarEmpleado = async () => {
    if (!form.nombre || !form.cedula || !agregarCargo || !form.fecha_ingreso) return
    const cargo = cargos.find((c) => c.id === agregarCargo)
    const nuevo = {
      nombre: form.nombre,
      cedula: form.cedula,
      email: form.email || null,
      telefono: form.telefono || null,
      cargo_id: agregarCargo,
      cargo_nombre: cargo?.nombre || "",
      fecha_ingreso: form.fecha_ingreso,
      estatus: "activo",
    }
    const { data, error } = await supabase.from("cst_empleados").insert(nuevo).select().single()
    if (!error && data) {
      setEmpleados((prev) => [...prev, data as unknown as Empleado])
      setShowAgregar(false)
      setForm({ nombre: "", cedula: "", email: "", telefono: "", fecha_ingreso: "" })
      setAgregarCargo("")
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Users className="w-3.5 h-3.5" />
          Activos: {stats.total}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Briefcase className="w-3.5 h-3.5" />
          Plazas: {stats.plazas}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          stats.vacantes > 0
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-gray-100 text-gray-600 border-gray-200"
        }`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          Vacantes: {stats.vacantes}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Clock className="w-3.5 h-3.5" />
          Retirados: {stats.retirados}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empleado por nombre, cargo o cedula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={() => setShowAgregar(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="space-y-3">
        {unidades.map((unidad) => {
          const cargosGerencia = cargos.filter((c) => c.unidad_id === unidad.id)
          if (cargosGerencia.length === 0) return null
          const gerenciaAbierta = gerenciaExpandida === unidad.id
          
          const totalPlazasGerencia = cargosGerencia.reduce((s, c) => s + (c.total_plazas || 1), 0)
          const activosGerencia = empleados.filter((e) => 
            e.estatus === "activo" && cargosGerencia.some((c) => c.id === e.cargo_id)
          ).length
          const vacantesGerencia = totalPlazasGerencia - activosGerencia

          return (
            <div key={unidad.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setGerenciaExpandida(gerenciaAbierta ? null : unidad.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left bg-gray-50/50"
              >
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${gerenciaAbierta ? "rotate-90" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{unidad.nombre}</p>
                  <p className="text-xs text-gray-500">{cargosGerencia.length} cargo{cargosGerencia.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-blue-600">
                    <Briefcase className="w-3.5 h-3.5" />
                    {totalPlazasGerencia}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Users className="w-3.5 h-3.5" />
                    {activosGerencia}
                  </span>
                  {vacantesGerencia > 0 ? (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      -{vacantesGerencia}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completo
                    </span>
                  )}
                </div>
              </button>

              {gerenciaAbierta && (
                <div className="border-t border-gray-100">
                  {cargosGerencia.map((cargo) => {
                    const totalPlazas = cargo.total_plazas || 1
                    const empleadosCargo = getFiltrados(empleados.filter((e) => e.cargo_id === cargo.id))
                    const activosCargo = empleadosCargo.filter((e) => e.estatus === "activo")
                    const retiradosCargo = empleadosCargo.filter((e) => e.estatus === "retirado")
                    const vacantes = totalPlazas - activosCargo.length
                    const cargoAbierto = cargoExpandido === cargo.id

                    return (
                      <div key={cargo.id} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => setCargoExpandido(cargoAbierto ? null : cargo.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-10 hover:bg-gray-50 transition-colors text-left"
                        >
                          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${cargoAbierto ? "rotate-90" : ""}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{cargo.nombre}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-blue-600">
                              {totalPlazas}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              {activosCargo.length}
                            </span>
                            {vacantes > 0 ? (
                              <span className="flex items-center gap-1 text-red-500">
                                -{vacantes}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                <CheckCircle2 className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </button>

                        {cargoAbierto && (
                          <div className="bg-gray-50/30">
                            {activosCargo.length === 0 && retiradosCargo.length === 0 ? (
                              <div className="text-center py-6 text-gray-400 text-sm">
                                No hay empleados en este cargo
                              </div>
                            ) : (
                              <>
                                {activosCargo.map((emp) => (
                                  <div
                                    key={emp.id}
                                    className="flex items-center gap-4 px-4 py-2.5 pl-16 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                      <span className="text-emerald-700 font-semibold text-xs">
                                        {emp.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{emp.nombre}</p>
                                      <p className="text-xs text-gray-500 truncate">{emp.cedula}</p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {emp.email}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(emp.fecha_ingreso).toLocaleDateString("es-VE")}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => setRetirando(emp.id)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                      title="Retirar empleado"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                {retiradosCargo.map((emp) => (
                                  <div
                                    key={emp.id}
                                    className="flex items-center gap-4 px-4 py-2.5 pl-16 border-b border-gray-50 last:border-0 bg-gray-50/50"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                      <span className="text-gray-500 font-semibold text-xs">
                                        {emp.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-500 truncate">{emp.nombre}</p>
                                      <p className="text-xs text-gray-400 truncate">{emp.cedula}</p>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Retirado: {emp.fecha_retiro ? new Date(emp.fecha_retiro).toLocaleDateString("es-VE") : "-"}
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {unidades.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-sm">No hay gerencias registradas</p>
          </div>
        )}
      </div>

      {showAgregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAgregar(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Agregar Empleado</h2>
              <button onClick={() => setShowAgregar(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nombre y apellido" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cedula</label>
                  <input type="text" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="V-12345678" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="email@luxor.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="+58 412-0000000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cargo</label>
                <select
                  value={agregarCargo}
                  onChange={(e) => setAgregarCargo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Seleccionar cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de ingreso</label>
                <input type="date" value={form.fecha_ingreso} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAgregar(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                onClick={agregarEmpleado}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {retirando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRetirando(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <UserMinus className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Retirar Empleado</h2>
              <p className="text-sm text-gray-500 mb-6">
                {(() => {
                  const emp = empleados.find((e) => e.id === retirando)
                  return emp ? `Esta accion generara una vacante para "${emp.cargo_nombre}". ¿Desea retirar a ${emp.nombre}?` : ""
                })()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRetirando(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => retirarEmpleado(retirando)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Retirar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
