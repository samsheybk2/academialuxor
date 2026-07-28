"use client"

import { useState, useEffect } from "react"
import {
  Search, Plus, Users, Briefcase, UserMinus, UserPlus, X, Calendar,
  Mail, Phone, MapPin, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, MoreHorizontal, SlidersHorizontal
} from "lucide-react"

interface Empleado {
  id: string
  nombre: string
  email: string
  cedula: string
  telefono: string
  cargoId: string
  cargoNombre: string
  fechaIngreso: string
  estatus: "activo" | "retirado"
  fechaRetiro?: string
}

const cargosEjemplo = [
  { id: "c1", nombre: "Gerente General", totalPlazas: 1 },
  { id: "c2", nombre: "Gerente de Ventas", totalPlazas: 2 },
  { id: "c3", nombre: "Gerente de RRHH", totalPlazas: 1 },
  { id: "c4", nombre: "Analista de RRHH", totalPlazas: 3 },
  { id: "c5", nombre: "Supervisor de Almacen", totalPlazas: 2 },
  { id: "c6", nombre: "Coordinador de Logistica", totalPlazas: 2 },
  { id: "c7", nombre: "Cajero Senior", totalPlazas: 5 },
  { id: "c8", nombre: "Asistente Administrativo", totalPlazas: 4 },
  { id: "c9", nombre: "Gerente de Marketing", totalPlazas: 1 },
  { id: "c10", nombre: "Auditor Interno", totalPlazas: 2 },
  { id: "c11", nombre: "Gerente de TI", totalPlazas: 1 },
  { id: "c12", nombre: "Analista de Sistemas", totalPlazas: 3 },
]

const empleadosMock: Empleado[] = [
  { id: "e1", nombre: "Juan Perez", email: "juan.perez@luxor.com", cedula: "V-12345678", telefono: "+58 412-1000001", cargoId: "c1", cargoNombre: "Gerente General", fechaIngreso: "2019-03-15", estatus: "activo" },
  { id: "e2", nombre: "Maria Lopez", email: "maria.lopez@luxor.com", cedula: "V-23456789", telefono: "+58 414-1000002", cargoId: "c2", cargoNombre: "Gerente de Ventas", fechaIngreso: "2020-06-01", estatus: "activo" },
  { id: "e3", nombre: "Carlos Garcia", email: "carlos.garcia@luxor.com", cedula: "V-34567890", telefono: "+58 416-1000003", cargoId: "c3", cargoNombre: "Gerente de RRHH", fechaIngreso: "2021-01-10", estatus: "activo" },
  { id: "e4", nombre: "Ana Rodriguez", email: "ana.rodriguez@luxor.com", cedula: "V-45678901", telefono: "+58 412-1000004", cargoId: "c4", cargoNombre: "Analista de RRHH", fechaIngreso: "2022-03-20", estatus: "activo" },
  { id: "e5", nombre: "Luis Martinez", email: "luis.martinez@luxor.com", cedula: "V-56789012", telefono: "+58 414-1000005", cargoId: "c4", cargoNombre: "Analista de RRHH", fechaIngreso: "2023-07-05", estatus: "activo" },
  { id: "e6", nombre: "Sofia Hernandez", email: "sofia.hernandez@luxor.com", cedula: "V-67890123", telefono: "+58 416-1000006", cargoId: "c5", cargoNombre: "Supervisor de Almacen", fechaIngreso: "2021-09-12", estatus: "activo" },
  { id: "e7", nombre: "Pedro Sanchez", email: "pedro.sanchez@luxor.com", cedula: "V-78901234", telefono: "+58 412-1000007", cargoId: "c6", cargoNombre: "Coordinador de Logistica", fechaIngreso: "2022-11-25", estatus: "activo" },
  { id: "e8", nombre: "Laura Torres", email: "laura.torres@luxor.com", cedula: "V-89012345", telefono: "+58 414-1000008", cargoId: "c7", cargoNombre: "Cajero Senior", fechaIngreso: "2020-05-18", estatus: "activo" },
  { id: "e9", nombre: "Diego Ramirez", email: "diego.ramirez@luxor.com", cedula: "V-90123456", telefono: "+58 416-1000009", cargoId: "c7", cargoNombre: "Cajero Senior", fechaIngreso: "2021-08-30", estatus: "activo" },
  { id: "e10", nombre: "Isabella Flores", email: "isabella.flores@luxor.com", cedula: "V-01234567", telefono: "+58 412-1000010", cargoId: "c8", cargoNombre: "Asistente Administrativo", fechaIngreso: "2022-02-14", estatus: "activo" },
  { id: "e11", nombre: "Roberto Gomez", email: "roberto.gomez@luxor.com", cedula: "V-11223344", telefono: "+58 414-1000011", cargoId: "c2", cargoNombre: "Gerente de Ventas", fechaIngreso: "2023-04-01", estatus: "activo" },
  { id: "e12", nombre: "Valentina Diaz", email: "valentina.diaz@luxor.com", cedula: "V-22334455", telefono: "+58 416-1000012", cargoId: "c7", cargoNombre: "Cajero Senior", fechaIngreso: "2024-01-15", estatus: "activo" },
]

export default function PlantillaPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(empleadosMock)
  const [busqueda, setBusqueda] = useState("")
  const [cargos, setCargos] = useState(cargosEjemplo)
  const [expandedCargo, setExpandedCargo] = useState<string | null>(null)
  const [showAgregar, setShowAgregar] = useState(false)
  const [agregarCargo, setAgregarCargo] = useState("")
  const [retirando, setRetirando] = useState<string | null>(null)

  const stats = {
    total: empleados.filter((e) => e.estatus === "activo").length,
    plazas: cargos.reduce((s, c) => s + c.totalPlazas, 0),
    vacantes: cargos.reduce((s, c) => s + c.totalPlazas, 0) - empleados.filter((e) => e.estatus === "activo").length,
    retirados: empleados.filter((e) => e.estatus === "retirado").length,
  }

  const getFiltrados = (items: typeof empleados) =>
    items.filter((e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cargoNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cedula.includes(busqueda)
    )

  const retirarEmpleado = (id: string) => {
    setEmpleados((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, estatus: "retirado" as const, fechaRetiro: new Date().toISOString().split("T")[0] } : e
      )
    )
    setRetirando(null)
  }

  const activos = getFiltrados(empleados.filter((e) => e.estatus === "activo"))
  const retirados = getFiltrados(empleados.filter((e) => e.estatus === "retirado"))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantilla Activa</h1>
          <p className="text-sm text-gray-500 mt-1">Registro de empleados y control de vacantes</p>
        </div>
      </div>

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

      <div className="flex justify-center mb-6">
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
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Resumen por Cargo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {cargos.map((cargo) => {
            const activosCargo = empleados.filter((e) => e.cargoId === cargo.id && e.estatus === "activo").length
            const vacantes = cargo.totalPlazas - activosCargo
            return (
              <div
                key={cargo.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cargo.nombre}</p>
                  {vacantes > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 shrink-0 ml-2">
                      -{vacantes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {cargo.totalPlazas}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Users className="w-3 h-3" />
                    {activosCargo}
                  </span>
                  {vacantes > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3 h-3" />
                      {vacantes} vacante{vacantes !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cargo.totalPlazas > 0 ? (activosCargo / cargo.totalPlazas) * 100 : 0}%`,
                      backgroundColor: vacantes > 0 ? "#f59e0b" : "#10b981"
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Empleados Activos</h2>
          <button
            onClick={() => setShowAgregar(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Agregar Empleado
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {activos.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 font-semibold text-sm">
                  {emp.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{emp.nombre}</p>
                <p className="text-xs text-gray-500 truncate">{emp.cargoNombre} · {emp.cedula}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {emp.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(emp.fechaIngreso).toLocaleDateString("es-VE")}
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
          {activos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay empleados activos</p>
            </div>
          )}
        </div>

        {retirados.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 mt-6">Empleados Retirados</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {retirados.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 bg-gray-50/50"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-gray-500 font-semibold text-sm">
                      {emp.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-500 truncate">{emp.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{emp.cargoNombre} · {emp.cedula}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Retirado: {emp.fechaRetiro ? new Date(emp.fechaRetiro).toLocaleDateString("es-VE") : "-"}
                  </div>
                </div>
              ))}
            </div>
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
                  <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nombre y apellido" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cedula</label>
                  <input type="text" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="V-12345678" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="email@luxor.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="+58 412-0000000" />
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
                <input type="date" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAgregar(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => setShowAgregar(false)}
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
                  return emp ? `Esta accion generara una vacante para "${emp.cargoNombre}". ¿Desea retirar a ${emp.nombre}?` : ""
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
