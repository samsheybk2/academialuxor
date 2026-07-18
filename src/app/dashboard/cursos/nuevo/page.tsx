"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Video,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Opcion {
  texto: string
}

interface Pregunta {
  id: string
  pregunta: string
  tipo: "multiple" | "libre" | "analisis"
  opciones: Opcion[]
  respuestaCorrecta: number
}

interface MaterialPDF {
  id: string
  nombre: string
  url: string
  modulo_id: string | null
  tipo: string
  file?: File
}

interface ModuloForm {
  id: string
  titulo: string
  introduccion: string
  videoUrl: string
  imagenPortada: string
  duracion: string
  preguntas: Pregunta[]
  imagenFile?: File
}

interface Facilitador {
  id: string
  nombre: string
  email: string
}

function NuevoCursoContent() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [facilitadores, setFacilitadores] = useState<Facilitador[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [modulosExpandidos, setModulosExpandidos] = useState<string[]>([])
  const [materialPdf, setMaterialPdf] = useState<MaterialPDF[]>([])

  const [form, setForm] = useState({
    titulo: "",
    niveles: [] as string[],
    tipo: "obligatorio" as "obligatorio" | "electivo",
    facilitador_id: "",
    introduccion: "",
    video_bienvenida: "",
  })

  const [modulos, setModulos] = useState<ModuloForm[]>([])

  useEffect(() => {
    async function fetchFacilitadores() {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .in("rol", ["facilitador", "decano", "developer"])
      if (data) setFacilitadores(data)
    }
    fetchFacilitadores()
  }, [])

  useEffect(() => {
    if (user && !form.facilitador_id) {
      setForm((prev) => ({ ...prev, facilitador_id: user.id }))
    }
  }, [user])

  function toggleNivel(nivel: string) {
    setForm((prev) => ({
      ...prev,
      niveles: prev.niveles.includes(nivel)
        ? prev.niveles.filter((n) => n !== nivel)
        : [...prev.niveles, nivel],
    }))
  }

  function getYouTubeEmbedUrl(url: string): string {
    if (!url) return ""
    if (url.includes("/embed/")) return url
    const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    return url
  }

  function addModulo() {
    const newModulo: ModuloForm = {
      id: Date.now().toString(),
      titulo: "",
      introduccion: "",
      videoUrl: "",
      imagenPortada: "",
      duracion: "",
      preguntas: [],
    }
    setModulos([...modulos, newModulo])
    setModulosExpandidos([...modulosExpandidos, newModulo.id])
  }

  function removeModulo(id: string) {
    setModulos(modulos.filter((m) => m.id !== id))
    setModulosExpandidos(modulosExpandidos.filter((eid) => eid !== id))
  }

  function updateModulo(id: string, field: string, value: string) {
    setModulos(
      modulos.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  function toggleModulo(id: string) {
    setModulosExpandidos((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    )
  }

  function addPregunta(moduloId: string, tipo: "multiple" | "libre" | "analisis" = "multiple") {
    const newPregunta: Pregunta = {
      id: Date.now().toString(),
      pregunta: "",
      tipo,
      opciones: tipo === "multiple"
        ? [
            { texto: "" },
            { texto: "" },
            { texto: "" },
            { texto: "" },
          ]
        : [],
      respuestaCorrecta: 0,
    }
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? { ...m, preguntas: [...m.preguntas, newPregunta] }
          : m
      )
    )
  }

  function removePregunta(moduloId: string, preguntaId: string) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? { ...m, preguntas: m.preguntas.filter((p) => p.id !== preguntaId) }
          : m
      )
    )
  }

  function updatePregunta(
    moduloId: string,
    preguntaId: string,
    field: string,
    value: string | number
  ) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId ? { ...p, [field]: value } : p
              ),
            }
          : m
      )
    )
  }

  function updateOpcion(
    moduloId: string,
    preguntaId: string,
    index: number,
    value: string
  ) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? {
                      ...p,
                      opciones: p.opciones.map((o, i) =>
                        i === index ? { texto: value } : o
                      ),
                    }
                  : p
              ),
            }
          : m
      )
    )
  }

  function addOpcion(moduloId: string, preguntaId: string) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? { ...p, opciones: [...p.opciones, { texto: "" }] }
                  : p
              ),
            }
          : m
      )
    )
  }

  function removeOpcion(moduloId: string, preguntaId: string, index: number) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? {
                      ...p,
                      opciones: p.opciones.filter((_, i) => i !== index),
                      respuestaCorrecta:
                        p.respuestaCorrecta >= p.opciones.length - 1
                          ? Math.max(0, p.opciones.length - 2)
                          : p.respuestaCorrecta,
                    }
                  : p
              ),
            }
          : m
      )
    )
  }

  async function handleSave() {
    if (!form.titulo || !form.facilitador_id || form.niveles.length === 0) return

    setSaving(true)

    const facilitador = facilitadores.find((f) => f.id === form.facilitador_id)

    const totalMinutos = modulos.reduce((sum, m) => {
      const min = parseInt(m.duracion) || 0
      return sum + min
    }, 0)
    const duracionCalculada = Math.round(totalMinutos * 1.3)

    try {
      const { data: curso, error: cursoError } = await supabase
        .from("cursos")
        .insert({
          titulo: form.titulo,
          nivel: form.niveles,
          tipo: form.tipo,
          facilitador_id: form.facilitador_id,
          facilitador_nombre: facilitador?.nombre || "",
          introduccion: form.introduccion,
          video_bienvenida: form.video_bienvenida,
          duracion: `${duracionCalculada} min`,
          estado: "borrador",
          activo: false,
          modulos_count: modulos.length,
        })
        .select()
        .single()

      if (cursoError || !curso) {
        throw new Error(cursoError?.message || "No se pudo crear el curso")
      }

      const moduloIdsPorLocalId = new Map<string, string>()

      for (let i = 0; i < modulos.length; i++) {
        const mod = modulos[i]

        let imagenPortadaUrl = ""
        if (mod.imagenFile) {
          const safeName = `${Date.now()}-${mod.imagenFile.name.replace(/\s+/g, "-")}`
          const filePath = `cursos/${curso.id}/modulos/${safeName}`
          const { error: uploadError } = await supabase.storage
            .from("curso-materiales")
            .upload(filePath, mod.imagenFile, { upsert: true, contentType: mod.imagenFile.type })
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("curso-materiales").getPublicUrl(filePath)
            imagenPortadaUrl = urlData.publicUrl
          }
        }

        const { data: modulo, error: modError } = await supabase
          .from("modulos")
          .insert({
            curso_id: curso.id,
            titulo: mod.titulo,
            introduccion: mod.introduccion,
            video_url: mod.videoUrl,
            imagen_portada: imagenPortadaUrl || null,
            duracion: mod.duracion,
            orden: i + 1,
          })
          .select()
          .single()

        if (modError || !modulo) continue

        moduloIdsPorLocalId.set(mod.id, modulo.id)

        for (let j = 0; j < mod.preguntas.length; j++) {
          const preg = mod.preguntas[j]
          await supabase.from("preguntas").insert({
            modulo_id: modulo.id,
            pregunta: preg.pregunta,
            opciones: preg.tipo === "multiple" ? preg.opciones.map((o) => o.texto) : [],
            respuesta_correcta: preg.tipo === "multiple" ? preg.respuestaCorrecta : null,
            tipo: preg.tipo || "multiple",
            orden: j + 1,
          })
        }
      }

      for (let index = 0; index < materialPdf.length; index++) {
        const material = materialPdf[index]
        const moduloId = material.modulo_id ? moduloIdsPorLocalId.get(material.modulo_id) || null : null

        if (material.file) {
          const safeName = `${Date.now()}-${material.file.name.replace(/\s+/g, "-")}`
          const filePath = `cursos/${curso.id}/${safeName}`
          const { error: uploadError } = await supabase.storage
            .from("curso-materiales")
            .upload(filePath, material.file, { upsert: true, contentType: "application/pdf" })

          if (uploadError) {
            throw new Error(uploadError.message)
          }

          const { data: urlData } = supabase.storage.from("curso-materiales").getPublicUrl(filePath)
          await supabase.from("material_pdf").insert({
            curso_id: curso.id,
            modulo_id: moduloId,
            nombre: material.nombre || material.file.name.replace(/\.pdf$/i, ""),
            url: urlData.publicUrl,
            tipo: material.tipo,
            orden: index + 1,
          })
        }
      }

      setSaved(true)
      setTimeout(() => router.push("/dashboard/cursos"), 1500)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "No se pudo guardar el curso")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/cursos"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h1>
        <p className="text-gray-500 mt-1">
          Completa la información del curso y agrega módulos con evaluaciones
        </p>
      </div>

      {saved && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 font-medium">Curso creado exitosamente</p>
        </div>
      )}

      {/* Información del curso */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Información del Curso</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Servicio al Cliente Premium"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Niveles * <span className="text-gray-400 font-normal">(selecciona uno o más)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "gerentes", label: "Gerentes", color: "bg-blue-100 text-blue-700 border-blue-300" },
                { value: "coordinadores", label: "Coordinadores", color: "bg-blue-100 text-blue-700 border-blue-300" },
                { value: "administrativos", label: "Administrativos", color: "bg-violet-100 text-violet-700 border-violet-300" },
                { value: "operadores", label: "Operadores", color: "bg-amber-100 text-amber-700 border-amber-300" },
              ].map((nivel) => {
                const selected = form.niveles.includes(nivel.value)
                return (
                  <button
                    key={nivel.value}
                    type="button"
                    onClick={() => toggleNivel(nivel.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      selected
                        ? `${nivel.color} border-current`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {selected && "✓ "}{nivel.label}
                  </button>
                )
              })}
            </div>
            {form.niveles.length === 0 && (
              <p className="text-xs text-red-500">Selecciona al menos un nivel</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as "obligatorio" | "electivo" })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            >
              <option value="obligatorio">Obligatorio</option>
              <option value="electivo">Electivo</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Facilitador *</label>
            <select
              value={form.facilitador_id}
              onChange={(e) => setForm({ ...form, facilitador_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            >
              <option value="">Seleccionar facilitador</option>
              {facilitadores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Duración del Curso</label>
            <div className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm">
              {(() => {
                const total = modulos.reduce((sum, m) => sum + (parseInt(m.duracion) || 0), 0)
                const calculada = Math.round(total * 1.3)
                if (total === 0) return <span className="text-gray-400">Se calculará al agregar duración a los módulos</span>
                return (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-luxor-primary">{calculada} min</span>
                    <span className="text-gray-400 text-xs">({total} min módulos + 30%)</span>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Introducción del Curso</label>
            <textarea
              value={form.introduccion}
              onChange={(e) => setForm({ ...form, introduccion: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
              placeholder="Describe brevemente el contenido del curso..."
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Video de Bienvenida (YouTube)</label>
            <input
              type="text"
              value={form.video_bienvenida}
              onChange={(e) => setForm({ ...form, video_bienvenida: getYouTubeEmbedUrl(e.target.value) })}
              placeholder="Pega cualquier URL de YouTube"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
            />
            {form.video_bienvenida && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-md">
                <iframe
                  src={form.video_bienvenida}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Módulos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Módulos</h2>
          <button
            onClick={addModulo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-luxor-primary text-white rounded-lg text-sm font-medium hover:bg-luxor-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Módulo
          </button>
        </div>

        {modulos.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            No hay módulos. Haz clic en &quot;Agregar Módulo&quot; para comenzar.
          </p>
        )}

        <div className="space-y-3">
          {modulos.map((modulo, index) => (
            <div
              key={modulo.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={() => toggleModulo(modulo.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <span className="w-7 h-7 bg-luxor-primary/10 text-luxor-primary rounded-lg flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {modulo.titulo || `Módulo ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {modulo.duracion ? `${modulo.duracion} min` : "Sin duración"} ·{" "}
                      {modulo.preguntas.length} pregunta{modulo.preguntas.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {modulosExpandidos.includes(modulo.id) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                  )}
                </button>
                <button
                  onClick={() => removeModulo(modulo.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {modulosExpandidos.includes(modulo.id) && (
                <div className="p-4 space-y-4 border-t border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Título del Módulo
                      </label>
                      <input
                        type="text"
                        value={modulo.titulo}
                        onChange={(e) => updateModulo(modulo.id, "titulo", e.target.value)}
                        placeholder={`Módulo ${index + 1}`}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                      <input
                        type="number"
                        min="1"
                        value={modulo.duracion}
                        onChange={(e) => updateModulo(modulo.id, "duracion", e.target.value)}
                        placeholder="15"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Introducción del Módulo
                    </label>
                    <textarea
                      value={modulo.introduccion}
                      onChange={(e) => updateModulo(modulo.id, "introduccion", e.target.value)}
                      rows={2}
                      placeholder="Breve descripción del módulo..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
                    />
                  </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Video (YouTube)</label>
                      <input
                        type="text"
                        value={modulo.videoUrl}
                        onChange={(e) => updateModulo(modulo.id, "videoUrl", getYouTubeEmbedUrl(e.target.value))}
                        placeholder="Pega cualquier URL de YouTube"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Imagen de Portada del Módulo</label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-luxor-primary/50 hover:bg-gray-50 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const previewUrl = URL.createObjectURL(file)
                              setModulos(modulos.map((m) =>
                                m.id === modulo.id ? { ...m, imagenPortada: previewUrl, imagenFile: file } : m
                              ))
                              e.target.value = ""
                            }}
                          />
                          {modulo.imagenPortada ? (
                            <img src={modulo.imagenPortada} alt="Portada" className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-500">Subir imagen</span>
                            </>
                          )}
                        </label>
                        {modulo.imagenPortada && (
                          <button
                            type="button"
                            onClick={() => setModulos(modulos.map((m) =>
                              m.id === modulo.id ? { ...m, imagenPortada: "", imagenFile: undefined } : m
                            ))}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {modulo.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden aspect-video max-w-sm">
                        <iframe
                          src={modulo.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`Video módulo ${index + 1}`}
                        />
                      </div>
                    )}

                  {/* Preguntas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        Preguntas ({modulo.preguntas.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => addPregunta(modulo.id, "multiple")}
                          className="text-sm text-luxor-primary hover:text-luxor-secondary flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Opción múltiple
                        </button>
                        <button
                          onClick={() => addPregunta(modulo.id, "libre")}
                          className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Respuesta libre
                        </button>
                        <button
                          onClick={() => addPregunta(modulo.id, "analisis")}
                          className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Análisis
                        </button>
                      </div>
                    </div>

                    {modulo.preguntas.map((pregunta, pi) => (
                      <div
                        key={pregunta.id}
                        className="bg-gray-50 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0 mt-1">
                            {pi + 1}
                          </span>
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${pregunta.tipo === "analisis" ? "bg-violet-100 text-violet-700" : pregunta.tipo === "libre" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                {pregunta.tipo === "analisis" ? "Análisis" : pregunta.tipo === "libre" ? "Respuesta libre" : "Opción múltiple"}
                              </span>
                              <button
                                onClick={() =>
                                  updatePregunta(
                                    modulo.id,
                                    pregunta.id,
                                    "tipo",
                                    pregunta.tipo === "multiple" ? "libre" : pregunta.tipo === "libre" ? "analisis" : "multiple"
                                  )
                                }
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                              >
                                Cambiar tipo
                              </button>
                            </div>
                            <input
                              type="text"
                              value={pregunta.pregunta}
                              onChange={(e) =>
                                updatePregunta(modulo.id, pregunta.id, "pregunta", e.target.value)
                              }
                              placeholder="Escribe la pregunta..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                            />

                            {pregunta.tipo === "multiple" ? (
                              <div className="space-y-2">
                                {pregunta.opciones.map((opcion, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        updatePregunta(
                                          modulo.id,
                                          pregunta.id,
                                          "respuestaCorrecta",
                                          oi
                                        )
                                      }
                                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                        pregunta.respuestaCorrecta === oi
                                          ? "border-blue-500 bg-blue-500"
                                          : "border-gray-300 hover:border-gray-400"
                                      }`}
                                    >
                                      {pregunta.respuestaCorrecta === oi && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={opcion.texto}
                                      onChange={(e) =>
                                        updateOpcion(
                                          modulo.id,
                                          pregunta.id,
                                          oi,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Opción ${oi + 1}`}
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                                    />
                                    {pregunta.opciones.length > 2 && (
                                      <button
                                        onClick={() =>
                                          removeOpcion(modulo.id, pregunta.id, oi)
                                        }
                                        className="p-1 text-gray-400 hover:text-red-500"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOpcion(modulo.id, pregunta.id)}
                                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Agregar opción
                                </button>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
                                {pregunta.tipo === "analisis"
                                  ? "Se espera una respuesta abierta de varias líneas para análisis."
                                  : "Se espera una respuesta libre escrita por el estudiante."}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removePregunta(modulo.id, pregunta.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Material PDF */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          Material de apoyo (PDF)
                        </h4>
                        <label className="text-sm text-luxor-primary hover:text-luxor-secondary cursor-pointer flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          Subir PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setMaterialPdf((prev) => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  nombre: file.name.replace(/\.pdf$/i, ""),
                                  url: "",
                                  modulo_id: modulo.id,
                                  tipo: "modulo",
                                  file,
                                },
                              ])
                              e.target.value = ""
                            }}
                          />
                        </label>
                      </div>
                      {materialPdf.filter((m) => m.modulo_id === modulo.id).length === 0 ? (
                        <p className="text-sm text-gray-400">Sin material de apoyo para este módulo</p>
                      ) : (
                        <div className="space-y-2">
                          {materialPdf.filter((m) => m.modulo_id === modulo.id).map((m) => (
                            <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-violet-50 px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                <span className="text-sm text-violet-700 truncate">{m.nombre}</span>
                              </div>
                              <button
                                onClick={() => setMaterialPdf((prev) => prev.filter((item) => item.id !== m.id))}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pb-8">
        <Link href="/dashboard/cursos" className="flex-1">
          <Button variant="secondary" className="w-full">
            Cancelar
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={saving || saved || !form.titulo || !form.facilitador_id || form.niveles.length === 0}
          className="flex-1"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Guardando..." : saved ? "Guardado" : "Crear Curso"}
        </Button>
      </div>
    </div>
  )
}

export default function NuevoCursoPage() {
  return (
    <ProtectedRoute allowedRoles={["facilitador", "decano", "developer"]}>
      <NuevoCursoContent />
    </ProtectedRoute>
  )
}
