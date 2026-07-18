"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Mail,
  GraduationCap,
  UserCheck,
  UserX,
  Loader2,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface Usuario {
  id: string
  nombre: string
  email: string
  cedula: string
  rol: "facilitador" | "estudiante" | "decano" | "developer"
  cargo: string
  nivel: string
  activo: boolean
  aprobado: boolean
  fechaCreacion: string
}

function UsuariosContent() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pendingUsers, setPendingUsers] = useState<Usuario[]>([])
  const [cargosList, setCargosList] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterRol, setFilterRol] = useState("todos")
  const [filterMisEstudiantes, setFilterMisEstudiantes] = useState(false)
  const [misEstudiantesIds, setMisEstudiantesIds] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approvingCargo, setApprovingCargo] = useState<Record<string, string>>({})
  const [cargoSearch, setCargoSearch] = useState("")
  const [showCargoDropdown, setShowCargoDropdown] = useState(false)
  const cargoDropdownRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    cedula: "",
    rol: "estudiante" as "facilitador" | "estudiante" | "developer" | "decano",
    cargo: "",
    nivel: "operadores",
  })

  const canApprove = user?.rol === "facilitador"
  const canManage = user?.rol === "decano" || user?.rol === "developer"

  useEffect(() => {
    fetchUsers()
    fetchCargos()
    if (canApprove) fetchMisEstudiantes()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(e.target as Node)) {
        setShowCargoDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function fetchMisEstudiantes() {
    const { data: cursos } = await supabase
      .from("cursos")
      .select("id")
      .eq("facilitador_id", user!.id)

    if (!cursos || cursos.length === 0) return

    const cursoIds = cursos.map((c: any) => c.id)
    const { data: inscripciones } = await supabase
      .from("inscripciones")
      .select("user_id")
      .in("curso_id", cursoIds)

    if (inscripciones) {
      const ids = new Set<string>(inscripciones.map((i: any) => i.user_id))
      setMisEstudiantesIds(ids)
    }
  }

  async function fetchCargos() {
    const { data } = await supabase
      .from("cargos")
      .select("id, nombre")
      .order("created_at", { ascending: true })
    setCargosList(data || [])
  }

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .not("rol", "in", '("decano","developer")')
      .order("created_at", { ascending: false })

    if (data) {
      const all = data.map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        cedula: u.cedula || "",
        rol: u.rol as "facilitador" | "estudiante",
        cargo: u.cargo || "",
        nivel: u.nivel || "",
        activo: true,
        aprobado: u.aprobado ?? true,
        fechaCreacion: u.created_at,
      }))
      setUsuarios(all)
      setPendingUsers(all.filter((u: any) => !u.aprobado))
    }
    setLoading(false)
  }

  async function handleApprove(userId: string) {
    setApprovingId(userId)
    const cargo = approvingCargo[userId] || ""
    await supabase
      .from("profiles")
      .update({ aprobado: true, cargo: cargo || null })
      .eq("id", userId)
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, aprobado: true, cargo } : u))
    )
    setApprovingId(null)
  }

  async function handleReject(userId: string) {
    setApprovingId(userId)
    await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
    setUsuarios((prev) => prev.filter((u) => u.id !== userId))
    setApprovingId(null)
  }

  const filtered = usuarios.filter((u) => {
    if (!canManage && u.rol === "facilitador") return false
    const matchSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.cargo.toLowerCase().includes(search.toLowerCase())
    const matchRol = filterRol === "todos" || u.rol === filterRol
    const matchMisEst = !filterMisEstudiantes || misEstudiantesIds.has(u.id)
    return matchSearch && matchRol && matchMisEst
  }).slice(0, 200)

  const stats = {
    total: usuarios.length,
    facilitadores: usuarios.filter((u) => u.rol === "facilitador").length,
    estudiantes: usuarios.filter((u) => u.rol === "estudiante").length,
    pendientes: pendingUsers.length,
  }

  function openCreate() {
    setEditingUser(null)
    setForm({ nombre: "", email: "", cedula: "", rol: "estudiante", cargo: "", nivel: "operadores" })
    setCargoSearch("")
    setShowModal(true)
  }

  function openEdit(user: Usuario) {
    setEditingUser(user)
    setForm({
      nombre: user.nombre,
      email: user.email,
      cedula: user.cedula || "",
      rol: user.rol,
      cargo: user.cargo,
      nivel: user.nivel || "operadores",
    })
    setCargoSearch("")
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.email) return
    setSaving(true)

    if (editingUser) {
      await supabase
        .from("profiles")
        .update({
          nombre: form.nombre,
          rol: form.rol,
          cedula: form.cedula || null,
          cargo: form.cargo || null,
          nivel: form.nivel,
        })
        .eq("id", editingUser.id)
    } else {
      const { data: authData, error } = await supabase.auth.signUp({
        email: form.email,
        password: "Luxor2026!",
        options: {
          data: {
            nombre: form.nombre,
            rol: form.rol,
          },
        },
      })

      if (authData.user && !error) {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: form.email,
          nombre: form.nombre,
          rol: form.rol,
          cedula: form.cedula || null,
          cargo: form.cargo || null,
          nivel: form.nivel,
          aprobado: true,
        })
      }
    }

    setShowModal(false)
    setSaving(false)
    fetchUsers()
  }

  async function handleDelete(id: string) {
    await supabase.from("profiles").delete().eq("id", id)
    fetchUsers()
  }

  function getCargoLabel(cargoId: string): string {
    const cargo = cargosList.find((c) => c.id === cargoId)
    return cargo?.nombre || cargoId || "-"
  }

  return (
    <div className="space-y-6">
      {canApprove && pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Inscripciones Pendientes</h2>
              <p className="text-sm text-gray-500">{pendingUsers.length} inscripción(es) esperando aprobación</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-lg p-4 border border-amber-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-semibold text-sm">
                      {u.nombre.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{u.nombre}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0 sm:ml-4">
                  <select
                    value={approvingCargo[u.id] || ""}
                    onChange={(e) => setApprovingCargo({ ...approvingCargo, [u.id]: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
                  >
                    <option value="">Sin cargo</option>
                    {cargosList.map((c) => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      disabled={approvingId === u.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {approvingId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      disabled={approvingId === u.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-2.5">
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-xs"
          />
        </div>
        {canApprove && (
          <button
            onClick={() => { setFilterMisEstudiantes(!filterMisEstudiantes); setFilterRol("todos") }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              filterMisEstudiantes
                ? "bg-luxor-primary text-white border-luxor-primary"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Mis estudiantes
            {misEstudiantesIds.size > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${filterMisEstudiantes ? "bg-white/20" : "bg-gray-100"}`}>
                {misEstudiantesIds.size}
              </span>
            )}
          </button>
        )}
        {canManage && (
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterRol}
              onChange={(e) => { setFilterRol(e.target.value); setFilterMisEstudiantes(false) }}
              className="pl-8 pr-7 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-xs appearance-none whitespace-nowrap"
            >
              <option value="todos">Todos los roles</option>
              <option value="facilitador">Facilitadores</option>
              <option value="estudiante">Estudiantes</option>
              <option value="developer">Developer</option>
            </select>
          </div>
        )}
        {canManage && (
          <Button onClick={openCreate} className="whitespace-nowrap text-xs py-2">
            <Plus className="w-3.5 h-3.5" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Usuario</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 hidden sm:table-cell">Estado</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 hidden sm:table-cell">Rol</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 hidden md:table-cell">Cédula</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500 hidden md:table-cell">Cargo</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-luxor-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-luxor-primary font-semibold text-xs">
                            {u.nombre.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate text-xs">{u.nombre}</p>
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          u.aprobado
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {u.aprobado ? "Aprobado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.rol === "facilitador"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{u.cedula || "-"}</span>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {u.cargo ? (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          {getCargoLabel(u.cargo)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {!u.aprobado && canApprove && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={approvingId === u.id}
                            className="p-1 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Aprobar"
                          >
                            {approvingId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8">
            <UserX className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No se encontraron usuarios</p>
          </div>
        )}
      </Card>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Juan Perez"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@luxor.com o correo@gmail.com"
              disabled={!!editingUser}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Cédula</label>
            <input
              type="text"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              placeholder="Ej: 12345678"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value as "facilitador" | "estudiante" | "developer" | "decano" })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
              >
                <option value="facilitador">Facilitador</option>
                <option value="estudiante">Estudiante</option>
                <option value="developer">Developer</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nivel</label>
              <select
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
              >
                <option value="gerentes">Gerentes</option>
                <option value="coordinadores">Coordinadores</option>
                <option value="administrativos">Administrativos</option>
                <option value="operadores">Operadores</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Cargo</label>
            <div className="relative" ref={cargoDropdownRef}>
              <input
                type="text"
                value={form.cargo || cargoSearch}
                onChange={(e) => {
                  setCargoSearch(e.target.value)
                  setForm({ ...form, cargo: "" })
                  setShowCargoDropdown(true)
                }}
                onFocus={() => setShowCargoDropdown(true)}
                placeholder="Buscar cargo..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
              />
              {form.cargo && (
                <button
                  onClick={() => { setForm({ ...form, cargo: "" }); setCargoSearch("") }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {showCargoDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setForm({ ...form, cargo: "" }); setCargoSearch(""); setShowCargoDropdown(false) }}
                    className="w-full text-left px-3.5 py-2 text-sm text-gray-500 hover:bg-gray-50"
                  >
                    Sin cargo
                  </button>
                  {cargosList
                    .filter((c) => c.nombre.toLowerCase().includes((form.cargo || cargoSearch).toLowerCase()))
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setForm({ ...form, cargo: c.nombre }); setCargoSearch(""); setShowCargoDropdown(false) }}
                        className="w-full text-left px-3.5 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        {c.nombre}
                      </button>
                    ))}
                  {cargosList.filter((c) => c.nombre.toLowerCase().includes((form.cargo || cargoSearch).toLowerCase())).length === 0 && (
                    <div className="px-3.5 py-2 text-sm text-gray-400">No se encontraron cargos</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.nombre || !form.email} className="flex-1">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingUser ? (
                "Guardar Cambios"
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function UsuariosPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador"]}>
      <UsuariosContent />
    </ProtectedRoute>
  )
}
