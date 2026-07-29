"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Send, CheckCircle2, Loader2, Award, ChevronRight, ChevronLeft } from "lucide-react"

interface PreguntaTest {
  id: string
  competencia_id: string
  texto: string
  orden: number
  competencia_nombre: string
  competencia_color: string
  respuestas: { id: string; texto: string; puntaje: number; orden: number }[]
}

export default function PostulacionPage() {
  const supabase = createSupabaseClient()
  const [cargos, setCargos] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [paso, setPaso] = useState<1 | 2>(1)
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

  const [preguntasTest, setPreguntasTest] = useState<PreguntaTest[]>([])
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<Record<string, string>>({})
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [cargandoTest, setCargandoTest] = useState(false)
  const [candidatoId, setCandidatoId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCargos = async () => {
      const { data } = await supabase.from("cargos").select("id, nombre").order("nombre")
      if (data) setCargos(data)
    }
    fetchCargos()
  }, [supabase])

  const handleSubmitForm = async () => {
    if (!form.nombre || !form.email || !form.cargo_id) return
    setLoading(true)

    const { data, error } = await supabase.from("cst_candidatos").insert({
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
    }).select().single()

    if (!error && data) {
      setCandidatoId(data.id)
      await cargarTestCompetencias(data.id, form.cargo_id)
    }
    setLoading(false)
  }

  const cargarTestCompetencias = async (candidatoId: string, cargoId: string) => {
    setCargandoTest(true)

    const { data: cargoComps } = await supabase
      .from("cargo_competencias")
      .select("competencia_id, competencias(id, nombre, color)")
      .eq("cargo_id", cargoId)

    if (!cargoComps || cargoComps.length === 0) {
      setEnviado(true)
      setCargandoTest(false)
      return
    }

    const preguntas: PreguntaTest[] = []
    for (const cc of cargoComps) {
      const comp = cc.competencias as any
      const { data: pRegs } = await supabase
        .from("cst_competencia_preguntas")
        .select("id, competencia_id, texto, orden, cst_competencia_respuestas(id, texto, puntaje, orden)")
        .eq("competencia_id", comp.id)
        .order("orden")

      if (pRegs) {
        for (const p of pRegs) {
          const respuestas = (p as any).cst_competencia_respuestas || []
          if (respuestas.length > 0) {
            preguntas.push({
              id: p.id,
              competencia_id: p.competencia_id,
              texto: p.texto,
              orden: p.orden,
              competencia_nombre: comp.nombre,
              competencia_color: comp.color || "#6366f1",
              respuestas: respuestas.map((r: any) => ({
                id: r.id,
                texto: r.texto,
                puntaje: r.puntaje,
                orden: r.orden,
              })).sort((a: any, b: any) => a.orden - b.orden),
            })
          }
        }
      }
    }

    if (preguntas.length === 0) {
      setEnviado(true)
    } else {
      const shuffled = [...preguntas].sort(() => Math.random() - 0.5)
      setPreguntasTest(shuffled)

      const { error: sesionError } = await supabase.from("cst_test_sesiones").insert({
        candidato_id: candidatoId,
        cargo_id: cargoId,
        puntaje_total: 0,
        puntaje_maximo: shuffled.reduce((s, p) => s + Math.max(...p.respuestas.map(r => r.puntaje)), 0),
        estado: "en_progreso",
      })

      if (sesionError) {
        setEnviado(true)
      } else {
        setPaso(2)
      }
    }
    setCargandoTest(false)
  }

  const seleccionarRespuesta = (preguntaId: string, respuestaId: string) => {
    setRespuestasSeleccionadas((prev) => ({ ...prev, [preguntaId]: respuestaId }))
  }

  const enviarTest = async () => {
    if (!candidatoId || !form.cargo_id) return
    setLoading(true)

    const { data: sesion } = await supabase
      .from("cst_test_sesiones")
      .select("id")
      .eq("candidato_id", candidatoId)
      .eq("cargo_id", form.cargo_id)
      .eq("estado", "en_progreso")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sesion) {
      const respuestasParaGuardar = Object.entries(respuestasSeleccionadas).map(([preguntaId, respuestaId]) => {
        const pregunta = preguntasTest.find((p) => p.id === preguntaId)
        const respuesta = pregunta?.respuestas.find((r) => r.id === respuestaId)
        return {
          sesion_id: sesion.id,
          pregunta_id: preguntaId,
          respuesta_id: respuestaId,
          puntaje_obtenido: respuesta?.puntaje || 0,
        }
      })

      if (respuestasParaGuardar.length > 0) {
        await supabase.from("cst_test_respuestas").insert(respuestasParaGuardar)
      }

      const puntajeTotal = respuestasParaGuardar.reduce((s, r) => s + r.puntaje_obtenido, 0)
      const puntajeMaximo = preguntasTest.reduce((s, p) => s + Math.max(...p.respuestas.map(r => r.puntaje)), 0)
      const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0

      await supabase
        .from("cst_test_sesiones")
        .update({
          puntaje_total: puntajeTotal,
          porcentaje,
          estado: "completado",
          fecha_fin: new Date().toISOString(),
        })
        .eq("id", sesion.id)
    }

    setLoading(false)
    setEnviado(true)
  }

  const totalCampos = 9
  const camposLlenos = Object.values(form).filter(v => v && v.trim() !== "").length
  const progreso = Math.round((camposLlenos / totalCampos) * 100)
  const progresoTest = preguntasTest.length > 0
    ? Math.round((Object.keys(respuestasSeleccionadas).length / preguntasTest.length) * 100)
    : 0

  if (enviado) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gracias por tu postulacion</h1>
          <p className="text-sm text-gray-500 mb-6">
            Tu informacion ha sido recibida exitosamente. Pronto recibiras noticias de nuestro equipo de seleccion.
          </p>
          <button
            onClick={() => {
              setEnviado(false)
              setPaso(1)
              setCandidatoId(null)
              setPreguntasTest([])
              setRespuestasSeleccionadas({})
              setPreguntaActual(0)
              setForm({ nombre: "", email: "", telefono: "", cedula: "", ubicacion: "", cargo_id: "", fuente: "LinkedIn", salario_esperado: "", notas: "" })
            }}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Nueva Postulacion
          </button>
        </div>
      </div>
    )
  }

  if (cargandoTest) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Preparando tu evaluacion...</p>
        </div>
      </div>
    )
  }

  if (paso === 2 && preguntasTest.length > 0) {
    const pregunta = preguntasTest[preguntaActual]
    const respondida = Object.keys(respuestasSeleccionadas).length
    const todasRespondidas = respondida === preguntasTest.length

    return (
      <div className="min-h-screen bg-emerald-600 w-full">
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-700 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white">Evaluacion de competencias</span>
              <span className="text-xs font-bold text-white">{preguntaActual + 1} / {preguntasTest.length}</span>
            </div>
            <div className="w-full bg-emerald-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progresoTest}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-24 pb-28 px-4 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: pregunta.competencia_color }}
              >
                <Award className="w-3 h-3" />
                {pregunta.competencia_nombre}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {pregunta.texto}
              </h2>

              <div className="space-y-3">
                {pregunta.respuestas.map((resp, idx) => {
                  const seleccionada = respuestasSeleccionadas[pregunta.id] === resp.id
                  return (
                    <button
                      key={resp.id}
                      onClick={() => seleccionarRespuesta(pregunta.id, resp.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        seleccionada
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          seleccionada ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                        }`}>
                          {seleccionada && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm text-gray-900">{resp.texto}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setPreguntaActual((prev) => Math.max(0, prev - 1))}
                disabled={preguntaActual === 0}
                className="flex items-center gap-2 px-4 py-3 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {preguntaActual < preguntasTest.length - 1 ? (
                <button
                  onClick={() => setPreguntaActual((prev) => prev + 1)}
                  className="flex items-center gap-2 px-4 py-3 bg-white text-emerald-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={enviarTest}
                  disabled={!todasRespondidas || loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Finalizar</>
                  )}
                </button>
              )}
            </div>
          </div>
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

          <div className="space-y-6">
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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
                  className="w-full px-4 py-3 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Experiencia, habilidades..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {progreso === 100 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <button
              onClick={handleSubmitForm}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-emerald-600 text-sm font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
              ) : (
                <>Continuar <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
