"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Loader2, Plus, Pencil, Trash2, X, Award, Upload } from "lucide-react"

interface Insignia {
  id: string; nombre: string; descripcion: string | null; imagen_url: string | null; rol: string
  min_cursos_creados: number; min_cursos_aprobados: number; min_estudiantes_capacitados: number; min_calificacion_promedio: number
  min_cursos_inscritos: number; min_cursos_completados: number; min_modulos_completados: number; min_quizzes_aprobados: number; min_racha_dias: number
  xp: number; color: string; activa: boolean; created_at: string
}
interface Nivel { id: string; nombre: string; descripcion: string | null; imagen_url: string | null; icono: string; rol: string; xp_minimo: number; color: string; avatar_x: number; avatar_y: number; avatar_tamano: number; frame_tamano: number; avatar_delante: boolean; activo: boolean; created_at: string }
interface Cargo { id: string; nombre: string }

const PARAMS_FAC = [
  { key: "min_cursos_creados", label: "Cursos Creados" },
  { key: "min_cursos_aprobados", label: "Cursos Aprobados" },
  { key: "min_estudiantes_capacitados", label: "Estudiantes Capacitados" },
  { key: "min_calificacion_promedio", label: "Calificación Promedio %" },
]
const PARAMS_EST = [
  { key: "min_cursos_inscritos", label: "Cursos Inscritos" },
  { key: "min_cursos_completados", label: "Cursos Completados" },
  { key: "min_modulos_completados", label: "Módulos Completados" },
  { key: "min_quizzes_aprobados", label: "Quizzes Aprobados" },
  { key: "min_racha_dias", label: "Racha de Días" },
  { key: "min_calificacion_promedio", label: "Calificación Promedio %" },
]
const ROLES = [
  { value: "facilitador", label: "Facilitador" },
  { value: "estudiante", label: "Estudiante" },
  { value: "ambos", label: "Ambos" },
]
function getParamsByRol(rol: string) { if (rol === "facilitador") return PARAMS_FAC; if (rol === "estudiante") return PARAMS_EST; return [...PARAMS_FAC, ...PARAMS_EST] }

const EMPTY_INSIGNIA = { nombre: "", descripcion: "", rol: "facilitador", min_cursos_creados: 0, min_cursos_aprobados: 0, min_estudiantes_capacitados: 0, min_calificacion_promedio: 0, min_cursos_inscritos: 0, min_cursos_completados: 0, min_modulos_completados: 0, min_quizzes_aprobados: 0, min_racha_dias: 0, xp: 10, color: "#6366f1", activa: true }
const EMPTY_NIVEL = { nombre: "", descripcion: "", icono: "⭐", rol: "facilitador", xp_minimo: 0, color: "#6366f1", avatar_x: 50, avatar_y: 50, avatar_tamano: 70, frame_tamano: 100, avatar_delante: true, activo: true }

// ── Frame Editor ───────────────────────────────────────────
function FrameEditor({ imagenUrl, avatarX, avatarY, avatarTamano, frameTamano, onChange }: {
  imagenUrl: string | null; avatarX: number; avatarY: number; avatarTamano: number; frameTamano: number
  onChange: (x: number, y: number, t: number, ft: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [canvasSize, setCanvasSize] = useState(280)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const img = imgRef.current
    canvas.width = canvasSize; canvas.height = canvasSize
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    if (img && img.complete && img.naturalWidth > 0) {
      const baseScale = Math.min(canvasSize / img.naturalWidth, canvasSize / img.naturalHeight)
      const scale = baseScale * (frameTamano / 100)
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale
      ctx.drawImage(img, (canvasSize - w) / 2, (canvasSize - h) / 2, w, h)
    } else {
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(0, 0, canvasSize, canvasSize)
      ctx.fillStyle = "#9ca3af"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Sube una imagen de marco", canvasSize / 2, canvasSize / 2)
    }

    const cx = (avatarX / 100) * canvasSize
    const cy = (avatarY / 100) * canvasSize
    const r = (avatarTamano / 100) * canvasSize / 2

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.fillStyle = "rgba(99, 102, 241, 0.08)"
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, Math.PI * 2)
    ctx.fillStyle = "#6366f1"
    ctx.fill()
    ctx.restore()
  }, [avatarX, avatarY, avatarTamano, frameTamano, canvasSize])

  useEffect(() => {
    if (!imagenUrl) { imgRef.current = null; draw(); return }
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => { imgRef.current = img; draw() }
    img.src = imagenUrl
  }, [imagenUrl, draw])

  useEffect(() => { draw() }, [draw])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    return {
      x: Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))),
    }
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault(); setDragging(true)
    const pos = getPos(e); onChange(pos.x, pos.y, avatarTamano, frameTamano)
  }
  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragging) return
    const pos = getPos(e); onChange(pos.x, pos.y, avatarTamano, frameTamano)
  }
  function handleEnd() { setDragging(false) }

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.min(entry.contentRect.width, 280)
        setCanvasSize(w)
      }
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Posición del avatar en el marco</label>
      <div ref={containerRef} className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-xl border border-gray-200 cursor-crosshair touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <p className="text-[10px] text-gray-400 text-center">Arrastra el punto para posicionar el avatar</p>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">X %</label>
          <input type="number" min="0" max="100" value={avatarX} onChange={e => onChange(parseInt(e.target.value) || 0, avatarY, avatarTamano, frameTamano)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Y %</label>
          <input type="number" min="0" max="100" value={avatarY} onChange={e => onChange(avatarX, parseInt(e.target.value) || 0, avatarTamano, frameTamano)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Avatar %</label>
          <input type="number" min="10" max="100" value={avatarTamano} onChange={e => onChange(avatarX, avatarY, parseInt(e.target.value) || 10, frameTamano)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Marco %</label>
          <input type="number" min="10" max="200" value={frameTamano} onChange={e => onChange(avatarX, avatarY, avatarTamano, parseInt(e.target.value) || 10)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────
export default function ExperienciaPage() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [tab, setTab] = useState<"insignias" | "niveles">("insignias")

  const [insignias, setInsignias] = useState<Insignia[]>([])
  const [niveles, setNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)
  const [cargos, setCargos] = useState<Cargo[]>([])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formI, setFormI] = useState(EMPTY_INSIGNIA)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [selectedCargos, setSelectedCargos] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [formN, setFormN] = useState(EMPTY_NIVEL)

  useEffect(() => { if (user?.rol === "developer") { fetchAll(); fetchCargos() } }, [user])

  async function fetchAll() {
    setLoading(true)
    const [i, n] = await Promise.all([
      supabase.from("insignias").select("*").order("created_at", { ascending: false }),
      supabase.from("niveles").select("*").order("xp_minimo"),
    ])
    setInsignias(i.data || [])
    setNiveles((n.data || []) as Nivel[])
    setLoading(false)
  }
  async function fetchCargos() { const { data } = await supabase.from("cargos").select("id, nombre").order("nombre"); setCargos(data || []) }
  async function fetchCargosInsignia(id: string): Promise<string[]> { const { data } = await supabase.from("insignia_cargos").select("cargo_id").eq("insignia_id", id); return (data || []).map((r: any) => r.cargo_id) }

  function openCreate() {
    setEditingId(null); setError(""); setImagenFile(null); setImagenPreview(null); setSelectedCargos([])
    if (tab === "insignias") setFormI(EMPTY_INSIGNIA)
    else setFormN(EMPTY_NIVEL)
    setShowModal(true)
  }

  async function openEdit(item: any) {
    setEditingId(item.id); setError(""); setImagenFile(null); setSelectedCargos([]); setImagenPreview(item.imagen_url || null)
    if (tab === "insignias") {
      setFormI({ nombre: item.nombre, descripcion: item.descripcion || "", rol: item.rol, min_cursos_creados: item.min_cursos_creados, min_cursos_aprobados: item.min_cursos_aprobados, min_estudiantes_capacitados: item.min_estudiantes_capacitados, min_calificacion_promedio: item.min_calificacion_promedio, min_cursos_inscritos: item.min_cursos_inscritos, min_cursos_completados: item.min_cursos_completados, min_modulos_completados: item.min_modulos_completados, min_quizzes_aprobados: item.min_quizzes_aprobados, min_racha_dias: item.min_racha_dias, xp: item.xp, color: item.color, activa: item.activa })
      setSelectedCargos(await fetchCargosInsignia(item.id))
    } else {
      setFormN({ nombre: item.nombre, descripcion: item.descripcion || "", icono: item.icono || "⭐", rol: item.rol, xp_minimo: item.xp_minimo, color: item.color, avatar_x: item.avatar_x ?? 50, avatar_y: item.avatar_y ?? 50, avatar_tamano: item.avatar_tamano ?? 70, frame_tamano: item.frame_tamano ?? 100, avatar_delante: item.avatar_delante ?? true, activo: item.activo })
    }
    setShowModal(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith("image/")) { setError("Solo imágenes"); return }
    if (file.size > 4 * 1024 * 1024) { setError("Max 4MB"); return }
    setImagenFile(file)
    const reader = new FileReader(); reader.onload = (ev) => setImagenPreview(ev.target?.result as string); reader.readAsDataURL(file)
  }

  function toggleCargo(id: string) { setSelectedCargos(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]) }

  async function uploadImage(): Promise<string | null> {
    if (!imagenFile) return imagenPreview
    const ext = imagenFile.name.split(".").pop() || "webp"
    const path = `insignias/${tab}/${Date.now()}.${ext}`
    const { error: e } = await supabase.storage.from("configuraciones").upload(path, imagenFile, { contentType: imagenFile.type })
    if (e) throw new Error("Error imagen: " + e.message)
    const { data } = supabase.storage.from("configuraciones").getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    setSaving(true); setError("")
    try {
      if (tab === "insignias") {
        if (!formI.nombre.trim()) { setError("Nombre obligatorio"); setSaving(false); return }
        const url = await uploadImage()
        const data: any = { ...formI, imagen_url: url, nombre: formI.nombre.trim(), descripcion: formI.descripcion.trim() || null }
        let id = editingId
        if (editingId) { const { error: e } = await supabase.from("insignias").update(data).eq("id", editingId); if (e) throw e }
        else { const { data: ins, error: e } = await supabase.from("insignias").insert(data).select("id").single(); if (e) throw e; id = ins.id }
        if (id) { await supabase.from("insignia_cargos").delete().eq("insignia_id", id); if (selectedCargos.length > 0) await supabase.from("insignia_cargos").insert(selectedCargos.map(c => ({ insignia_id: id!, cargo_id: c }))) }
      } else {
        if (!formN.nombre.trim()) { setError("Nombre obligatorio"); setSaving(false); return }
        const url = await uploadImage()
        const data = { ...formN, imagen_url: url, nombre: formN.nombre.trim(), descripcion: formN.descripcion.trim() || null }
        if (editingId) { const { error: e } = await supabase.from("niveles").update(data).eq("id", editingId); if (e) throw e }
        else { const { error: e } = await supabase.from("niveles").insert(data); if (e) throw e }
      }
      setShowModal(false); fetchAll()
    } catch (err: any) { setError(err.message || "Error") }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteId) return; setSaving(true)
    const table = tab === "insignias" ? "insignias" : "niveles"
    const { error: e } = await supabase.from(table).delete().eq("id", deleteId)
    if (e) setError(e.message); setDeleteId(null); setSaving(false); fetchAll()
  }

  if (user?.rol !== "developer") return <div className="flex items-center justify-center py-20"><p className="text-gray-500">Solo el developer puede gestionar experiencia.</p></div>

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Experiencia</h1><p className="text-sm text-gray-500">Insignias y niveles de experiencia</p></div>
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setTab("insignias")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === "insignias" ? "text-luxor-primary border-b-2 border-luxor-primary" : "text-gray-500 hover:text-gray-700"}`}>Insignias</button>
        <button onClick={() => setTab("niveles")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === "niveles" ? "text-luxor-primary border-b-2 border-luxor-primary" : "text-gray-500 hover:text-gray-700"}`}>Niveles</button>
      </div>

      {loading ? (
        <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-luxor-primary animate-spin" /></CardContent></Card>
      ) : (
        <>
          {/* ─── INSIGNIAS ─── */}
          {tab === "insignias" && (
            <div className="space-y-3">
              <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Nueva</Button></div>
              {insignias.length === 0 ? (
                <Card><CardContent className="text-center py-12"><Award className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay insignias</p></CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insignias.map(ins => (
                    <Card key={ins.id}><CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: ins.color + "20" }}>
                          {ins.imagen_url ? <img src={ins.imagen_url} alt={ins.nombre} className="w-full h-full object-cover" /> : <Award className="w-8 h-8" style={{ color: ins.color }} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{ins.nombre}</h3>
                            {!ins.activa && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Inactiva</span>}
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${ins.rol === "facilitador" ? "bg-blue-100 text-blue-700" : ins.rol === "estudiante" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{ROLES.find(r => r.value === ins.rol)?.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500"><span className="font-semibold" style={{ color: ins.color }}>{ins.xp} XP</span></div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="outline" onClick={() => openEdit(ins)}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setDeleteId(ins.id) }} className="text-red-600 hover:bg-red-50 hover:border-red-200"><Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar</Button>
                      </div>
                    </CardContent></Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── NIVELES ─── */}
          {tab === "niveles" && (
            <div className="space-y-3">
              <div className="flex justify-end"><Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Nuevo</Button></div>
              {niveles.length === 0 ? (
                <Card><CardContent className="text-center py-12"><Award className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay niveles</p></CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {niveles.map(n => (
                    <Card key={n.id}><CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-4 border-dashed" style={{ borderColor: n.color, backgroundColor: n.color + "10" }}>
                          {n.imagen_url ? <img src={n.imagen_url} alt={n.nombre} className="w-full h-full object-cover rounded-full" /> : <span className="text-2xl">{n.icono}</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{n.nombre}</h3>
                            {!n.activo && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Inactivo</span>}
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${n.rol === "facilitador" ? "bg-blue-100 text-blue-700" : n.rol === "estudiante" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{ROLES.find(r => r.value === n.rol)?.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span style={{ color: n.color }}>{n.icono} XP mínimo: {n.xp_minimo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="outline" onClick={() => openEdit(n)}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setDeleteId(n.id) }} className="text-red-600 hover:bg-red-50 hover:border-red-200"><Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar</Button>
                      </div>
                    </CardContent></Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── MODAL CREAR/EDITAR ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Editar" : "Nuevo"} {tab === "insignias" ? "Insignia" : "Nivel"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

              {/* ── Imagen ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen (WebP)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-2 border-dashed border-gray-300" style={{ backgroundColor: (tab === "insignias" ? formI.color : formN.color) + "15" }}>
                    {imagenPreview ? <img src={imagenPreview} alt="Preview" className="w-full h-full rounded-full object-cover" /> : <Upload className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div><input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" /><Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>Seleccionar imagen</Button><p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP — Max 4MB</p></div>
                </div>
              </div>

              {/* ── Frame Editor (solo niveles con imagen) ── */}
              {tab === "niveles" && (
                <FrameEditor
                  imagenUrl={imagenPreview}
                  avatarX={formN.avatar_x}
                  avatarY={formN.avatar_y}
                  avatarTamano={formN.avatar_tamano}
                  frameTamano={formN.frame_tamano}
                  onChange={(x, y, t, ft) => setFormN({ ...formN, avatar_x: x, avatar_y: y, avatar_tamano: t, frame_tamano: ft })}
                />
              )}

              {/* ── Nombre ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input type="text" value={tab === "insignias" ? formI.nombre : formN.nombre} onChange={e => { if (tab === "insignias") setFormI({ ...formI, nombre: e.target.value }); else setFormN({ ...formN, nombre: e.target.value }) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
              </div>

              {/* ── Descripción ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea value={tab === "insignias" ? formI.descripcion : formN.descripcion} onChange={e => { if (tab === "insignias") setFormI({ ...formI, descripcion: e.target.value }); else setFormN({ ...formN, descripcion: e.target.value }) }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
              </div>

              {/* ── Icono (solo niveles) ── */}
              {tab === "niveles" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Icono (emoji)</label>
                  <input type="text" value={formN.icono} onChange={e => setFormN({ ...formN, icono: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" placeholder="⭐" />
                </div>
              )}

              {/* ── Rol ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirigido a *</label>
                <div className="flex gap-2">
                  {ROLES.map(r => {
                    const currentRol = tab === "insignias" ? formI.rol : formN.rol
                    return <button key={r.value} type="button" onClick={() => { if (tab === "insignias") setFormI({ ...formI, rol: r.value }); else setFormN({ ...formN, rol: r.value }) }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${currentRol === r.value ? "bg-luxor-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{r.label}</button>
                  })}
                </div>
              </div>

              {/* ── Parámetros (solo insignias) ── */}
              {tab === "insignias" && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Parámetros (0 = no aplica)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {getParamsByRol(formI.rol).map(p => (
                      <div key={p.key}><label className="block text-[11px] text-gray-500 mb-0.5">{p.label}</label><input type="number" min="0" value={(formI as any)[p.key]} onChange={e => setFormI({ ...formI, [p.key]: parseInt(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" /></div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">La insignia se otorga cuando se cumplen todos los parámetros con valor mayor a 0</p>
                </div>
              )}

              {/* ── XP mínimo (solo niveles) ── */}
              {tab === "niveles" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">XP Mínimo *</label>
                  <input type="number" min="0" value={formN.xp_minimo} onChange={e => setFormN({ ...formN, xp_minimo: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                </div>
              )}

              {/* ── XP / Color ── */}
              <div className="grid grid-cols-2 gap-4">
                {tab === "insignias" && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">XP *</label><input type="number" min="1" value={formI.xp} onChange={e => setFormI({ ...formI, xp: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" /></div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={tab === "insignias" ? formI.color : formN.color} onChange={e => { if (tab === "insignias") setFormI({ ...formI, color: e.target.value }); else setFormN({ ...formN, color: e.target.value }) }} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                    <input type="text" value={tab === "insignias" ? formI.color : formN.color} onChange={e => { if (tab === "insignias") setFormI({ ...formI, color: e.target.value }); else setFormN({ ...formN, color: e.target.value }) }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm" />
                  </div>
                </div>
              </div>

              {/* ── Cargos (solo insignias) ── */}
              {tab === "insignias" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargos <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <p className="text-[10px] text-gray-400 mb-2">Sin selección = aplica para todos</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">{cargos.map(c => <button key={c.id} type="button" onClick={() => toggleCargo(c.id)} className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${selectedCargos.includes(c.id) ? "bg-luxor-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{c.nombre}</button>)}</div>
                </div>
              )}

              {/* ── Activo ── */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Activo</label>
                <button type="button" onClick={() => { if (tab === "insignias") setFormI({ ...formI, activa: !formI.activa }); else setFormN({ ...formN, activo: !formN.activo }) }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(tab === "insignias" ? formI.activa : formN.activo) ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(tab === "insignias" ? formI.activa : formN.activo) ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {tab === "niveles" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Avatar delante del marco</label>
                  <button type="button" onClick={() => setFormN({ ...formN, avatar_delante: !formN.avatar_delante })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formN.avatar_delante ? "bg-luxor-primary" : "bg-gray-300"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formN.avatar_delante ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? "Guardar" : "Crear"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ELIMINAR ─── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar</h3>
            <p className="text-sm text-gray-500 mb-4">¿Seguro? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button onClick={handleDelete} disabled={saving} className="bg-red-600 hover:bg-red-700">{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
