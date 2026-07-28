"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Send, CheckCircle2, Loader2 } from "lucide-react"

export default function PostulacionPage() {
  const supabase = createSupabaseClient()
  const [cargos, setCargos] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    cedula: "",
    ubicacion: "",
    cargo_id: "",
    fuente: "LinkedIn",
    salario_esperado: "",
    notas: "",
  })

  useEffect(() => {
    const fetchCargos = async () => {
      const { data } = await supabase.from("cargos").select("id, nombre").order("nombre")
      if (data) setCargos(data)
    }
    fetchCargos()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.cargo_id) return
    setLoading(true)
    const { error } = await supabase.from("cst_candidatos").insert({
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || null,
      cedula: form.cedula || null,
      ubicacion: form.ubicacion || null,
      cargo_id: form.cargo_id,
      fuente: form.fuente,
      salario_esperado: form.salario_esperado || null,
      notas: form.notas || null,
      etapa: "nuevo",
      calificacion: 0,
    })
    setLoading(false)
    if (!error) setEnviado(true)
  }

  const totalCampos = 9
  const camposLlenos = Object.values(form).filter(v => v && v.trim() !== "").length
  const progreso = Math.round((camposLlenos / totalCampos) * 100)

  if (enviado) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Postulacion Enviada</h1>
          <p className="text-sm text-gray-500 mb-6">
            Tu informacion ha sido recibida exitosamente. Nuestro equipo de seleccion la revisara y te contactara pronto.
          </p>
          <button
            onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", cedula: "", ubicacion: "", cargo_id: "", fuente: "LinkedIn", salario_esperado: "", notas: "" }) }}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Nueva Postulacion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-600 w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white">Progreso de llenado</span>
            <span className="text-xs font-bold text-white">{progreso}%</span>
          </div>
          <div className="w-full bg-emerald-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-24 pb-24 px-4 lg:px-8 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Send className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Postulacion</h1>
            <p className="text-sm text-white/80 mt-1">Completa el formulario para aplicar a una vacante</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Nombre completo <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Nombre y apellido"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Email <span className="text-red-300">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="+58 412-0000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Cedula
                </label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="V-12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Ubicacion
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Cargo al que aplica <span className="text-red-300">*</span>
                </label>
                <select
                  required
                  value={form.cargo_id}
                  onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="">Seleccionar cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Como nos conociste?
                </label>
                <select
                  value={form.fuente}
                  onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Computrabajo">Computrabajo</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Referido">Referido</option>
                  <option value="Pagina web">Pagina web</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Salario esperado
                </label>
                <input
                  type="text"
                  value={form.salario_esperado}
                  onChange={(e) => setForm({ ...form, salario_esperado: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="$0,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Notas adicionales
                </label>
                <input
                  type="text"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Experiencia, habilidades..."
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {progreso === 100 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-emerald-600 rounded-none text-sm font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="w-5 h-5" /> Enviar Postulacion</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
