"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  CheckCircle2,
  Star,
  X,
  FileText,
} from "lucide-react"

interface Pregunta {
  id: string
  pregunta: string
  tipo: "multiple" | "libre" | "analisis"
  opciones: Opcion[]
  respuestaCorrecta: number
}

interface Opcion {
  id: string
  texto: string
}

interface MaterialPDF {
  id: string
  nombre: string
  url: string
  modulo_id: string | null
  tipo: string
  storagePath?: string
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

function CursoEditarContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [facilitadores, setFacilitadores] = useState<Facilitador[]>([])
  const [modulos, setModulos] = useState<ModuloForm[]>([])
  const [modulosExpandidos, setModulosExpandidos] = useState<string[]>([])
  const [materialPdf, setMaterialPdf] = useState<MaterialPDF[]>([])
  const [initialMaterialPdf, setInitialMaterialPdf] = useState<MaterialPDF[]>([])

  const [form, setForm] = useState({
    titulo: "",
    niveles: [] as string[],
    tipo: "obligatorio" as "obligatorio" | "electivo",
    facilitador_id: "",
    introduccion: "",
    video_bienvenida: "",
  })

  useEffect(() => {
    async function loadCurso() {
      const { data: curso } = await supabase
        .from("cursos")
        .select("*")
        .eq("id", id)
        .single()

      if (curso) {
        setForm({
          titulo: curso.titulo || "",
          niveles: Array.isArray(curso.nivel) ? curso.nivel : curso.nivel ? [curso.nivel] : [],
          tipo: curso.tipo || "obligatorio",
          facilitador_id: curso.facilitador_id || "",
          introduccion: curso.introduccion || "",
          video_bienvenida: curso.video_bienvenida || "",
        })

        const { data: modulosData } = await supabase
          .from("modulos")
          .select("*")
          .eq("curso_id", id)
          .order("orden")

        if (modulosData) {
          const modulosConPreguntas = await Promise.all(
            modulosData.map(async (mod) => {
              const { data: preguntasData } = await supabase
                .from("preguntas")
                .select("*")
                .eq("modulo_id", mod.id)
                .order("orden")

              return {
                id: mod.id,
                titulo: mod.titulo || "",
                introduccion: mod.introduccion || "",
                videoUrl: mod.video_url || "",
                imagenPortada: mod.imagen_portada || "",
                duracion: mod.duracion?.replace(" min", "") || "",
                preguntas: (preguntasData || []).map((p) => ({
                  id: p.id,
                  pregunta: p.pregunta,
                  tipo: p.tipo || "multiple",
                  opciones: (p.opciones || []).map((o: string, i: number) => ({
                    id: `opt-${i}`,
                    texto: o,
                  })),
                  respuestaCorrecta: p.respuesta_correcta ?? 0,
                })),
              }
            })
          )
          setModulos(modulosConPreguntas as ModuloForm[])
        }

        const { data: materialData } = await supabase
          .from("material_pdf")
          .select("*")
          .eq("curso_id", id)
          .order("orden")

        if (materialData) {
          const materials = materialData.map((m) => ({
            id: m.id,
            nombre: m.nombre,
            url: m.url,
            modulo_id: m.modulo_id || null,
            tipo: m.tipo || "curso",
            storagePath: m.storage_path || undefined,
          }))
          setMaterialPdf(materials)
          setInitialMaterialPdf(materials)
        }
      }
      setLoading(false)
    }
    loadCurso()
  }, [id])

  useEffect(() => {
    async function loadFacilitadores() {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .in("rol", ["facilitador", "decano"])
        .order("nombre")
      if (data) setFacilitadores(data as Facilitador[])
    }
    loadFacilitadores()
  }, [])

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

  function addPregunta(moduloId: string, tipo: "multiple" | "libre" = "multiple") {
    const newPregunta: Pregunta = {
      id: Date.now().toString(),
      pregunta: "",
      tipo,
      opciones: tipo === "multiple"
        ? [
            { id: "1", texto: "" },
            { id: "2", texto: "" },
            { id: "3", texto: "" },
            { id: "4", texto: "" },
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

  function updatePregunta(moduloId: string, preguntaId: string, field: string, value: string | number) {
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

  function addOpcion(moduloId: string, preguntaId: string) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? {
                      ...p,
                      opciones: [
                        ...p.opciones,
                        { id: Date.now().toString(), texto: "" },
                      ],
                    }
                  : p
              ),
            }
          : m
      )
    )
  }

  function removeOpcion(moduloId: string, preguntaId: string, opcionId: string) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? { ...p, opciones: p.opciones.filter((o) => o.id !== opcionId) }
                  : p
              ),
            }
          : m
      )
    )
  }

  function updateOpcion(moduloId: string, preguntaId: string, opcionId: string, value: string) {
    setModulos(
      modulos.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              preguntas: m.preguntas.map((p) =>
                p.id === preguntaId
                  ? {
                      ...p,
                      opciones: p.opciones.map((o) =>
                        o.id === opcionId ? { ...o, texto: value } : o
                      ),
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
      const { error: cursoError } = await supabase
        .from("cursos")
        .update({
          titulo: form.titulo,
          nivel: form.niveles,
          tipo: form.tipo,
          facilitador_id: form.facilitador_id,
          facilitador_nombre: facilitador?.nombre || "",
          introduccion: form.introduccion,
          video_bienvenida: form.video_bienvenida,
          duracion: `${duracionCalculada} min`,
          modulos_count: modulos.length,
        })
        .eq("id", id)

      if (cursoError) {
        throw new Error(cursoError.message)
      }

      const moduloIdsPorLocalId = new Map<string, string>()

      for (let i = 0; i < modulos.length; i++) {
        const mod = modulos[i]
        const isNewModulo = !mod.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

        let moduloId = mod.id

        if (isNewModulo) {
          let imagenPortadaUrl = ""
          if (mod.imagenFile) {
            const safeName = `${Date.now()}-${mod.imagenFile.name.replace(/\s+/g, "-")}`
            const filePath = `cursos/${id}/modulos/${safeName}`
            const { error: uploadError } = await supabase.storage
              .from("curso-materiales")
              .upload(filePath, mod.imagenFile, { upsert: true, contentType: mod.imagenFile.type })
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("curso-materiales").getPublicUrl(filePath)
              imagenPortadaUrl = urlData.publicUrl
            }
          }

          const { data: newMod, error: modError } = await supabase
            .from("modulos")
            .insert({
              curso_id: id,
              titulo: mod.titulo,
              introduccion: mod.introduccion,
              video_url: mod.videoUrl,
              imagen_portada: imagenPortadaUrl || null,
              duracion: `${mod.duracion} min`,
              orden: i + 1,
            })
            .select()
            .single()

          if (modError || !newMod) {
            console.error("Error inserting module:", modError)
            continue
          }
          moduloId = newMod.id
        } else {
          let imagenPortadaUrl = mod.imagenPortada
          if (mod.imagenFile) {
            const safeName = `${Date.now()}-${mod.imagenFile.name.replace(/\s+/g, "-")}`
            const filePath = `cursos/${id}/modulos/${safeName}`
            const { error: uploadError } = await supabase.storage
              .from("curso-materiales")
              .upload(filePath, mod.imagenFile, { upsert: true, contentType: mod.imagenFile.type })
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("curso-materiales").getPublicUrl(filePath)
              imagenPortadaUrl = urlData.publicUrl
            }
          }

          await supabase
            .from("modulos")
            .update({
              titulo: mod.titulo,
              introduccion: mod.introduccion,
              video_url: mod.videoUrl,
              imagen_portada: imagenPortadaUrl || null,
              duracion: `${mod.duracion} min`,
              orden: i + 1,
            })
            .eq("id", mod.id)

          await supabase.from("preguntas").delete().eq("modulo_id", mod.id)
        }

        moduloIdsPorLocalId.set(mod.id, moduloId)

        for (let j = 0; j < mod.preguntas.length; j++) {
          const preg = mod.preguntas[j]
          await supabase.from("preguntas").insert({
            modulo_id: moduloId,
            pregunta: preg.pregunta,
            opciones: preg.tipo === "multiple" ? preg.opciones.map((o) => o.texto) : [],
            respuesta_correcta: preg.tipo === "multiple" ? preg.respuestaCorrecta : null,
            tipo: preg.tipo || "multiple",
            orden: j + 1,
          })
        }
      }

      const currentMaterialIds = new Set(materialPdf.map((m) => m.id))
      const removedMaterials = initialMaterialPdf.filter((m) => !currentMaterialIds.has(m.id))
      for (const removed of removedMaterials) {
        if (removed.storagePath) {
          await supabase.storage.from("curso-materiales").remove([removed.storagePath])
        }
        await supabase.from("material_pdf").delete().eq("id", removed.id)
      }

      for (const material of materialPdf) {
        const isExisting = initialMaterialPdf.some((m) => m.id === material.id)
        if (isExisting) continue

        const moduloId = material.modulo_id ? moduloIdsPorLocalId.get(material.modulo_id) || null : null

        if (material.file) {
          const safeName = `${Date.now()}-${material.file.name.replace(/\s+/g, "-")}`
          const filePath = `cursos/${id}/${safeName}`
          const { error: uploadError } = await supabase.storage
            .from("curso-materiales")
            .upload(filePath, material.file, { upsert: true, contentType: "application/pdf" })

          if (uploadError) {
            throw new Error(uploadError.message)
          }

          const { data: urlData } = supabase.storage.from("curso-materiales").getPublicUrl(filePath)
          await supabase.from("material_pdf").insert({
            curso_id: id,
            modulo_id: moduloId,
            nombre: material.nombre || material.file.name.replace(/\.pdf$/i, ""),
            url: urlData.publicUrl,
            tipo: material.tipo,
            storage_path: filePath,
            orden: materialPdf.indexOf(material) + 1,
          })
        } else if (material.url) {
          await supabase.from("material_pdf").insert({
            curso_id: id,
            modulo_id: moduloId,
            nombre: material.nombre,
            url: material.url,
            tipo: material.tipo,
            orden: materialPdf.indexOf(material) + 1,
          })
        }
      }

      setSaved(true)
      setTimeout(() => router.push(`/dashboard/cursos/${id}`), 1500)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "No se pudo guardar el curso")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/dashboard/cursos/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al detalle
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
        <p className="text-gray-500 mt-1">
          Modifica la información del curso, módulos y evaluaciones
        </p>
      </div>

      {saved && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <p className="text-blue-700 font-medium">Curso actualizado correctamente</p>
        </div>
      )}

      {/* Información básica */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información Básica</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ej: Atención al Cliente Premium"
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Tipo *</label>
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
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Introducción del Curso</label>
          <textarea
            value={form.introduccion}
            onChange={(e) => setForm({ ...form, introduccion: e.target.value })}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
            placeholder="Describe brevemente el contenido del curso..."
          />
        </div>

        <div className="space-y-1.5">
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
      </div>

      {/* Módulos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Módulos ({modulos.length})</h2>
          <button
            onClick={addModulo}
            className="px-3 py-1.5 bg-luxor-primary text-white rounded-lg text-sm font-medium hover:bg-luxor-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Módulo
          </button>
        </div>

        {modulos.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No hay módulos. Haz clic en &quot;Agregar Módulo&quot; para comenzar.</p>
          </div>
        )}

        <div className="space-y-3">
          {modulos.map((modulo, modIdx) => {
            const expandido = modulosExpandidos.includes(modulo.id)
            return (
              <div key={modulo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <button
                    onClick={() => toggleModulo(modulo.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className="w-8 h-8 bg-luxor-primary/10 rounded-lg flex items-center justify-center text-luxor-primary font-bold text-sm">
                      {modIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {modulo.titulo || `Módulo ${modIdx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {modulo.duracion ? `${modulo.duracion} min` : "Sin duración"} · {modulo.preguntas.length} pregunta{modulo.preguntas.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {expandido ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => removeModulo(modulo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {expandido && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Título del Módulo</label>
                        <input
                          type="text"
                          value={modulo.titulo}
                          onChange={(e) => updateModulo(modulo.id, "titulo", e.target.value)}
                          placeholder="Ej: Introducción al Servicio"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={modulo.duracion}
                            onChange={(e) => updateModulo(modulo.id, "duracion", e.target.value)}
                            placeholder="15"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">min</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Introducción del Módulo</label>
                      <textarea
                        value={modulo.introduccion}
                        onChange={(e) => updateModulo(modulo.id, "introduccion", e.target.value)}
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
                        placeholder="Descripción breve del módulo..."
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
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-sm">
                        <iframe
                          src={modulo.videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Preguntas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          Preguntas ({modulo.preguntas.length})
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addPregunta(modulo.id, "multiple")}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Opción Múltiple
                          </button>
                          <button
                            onClick={() => addPregunta(modulo.id, "libre")}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Respuesta Libre
                          </button>
                        </div>
                      </div>

                      {modulo.preguntas.map((pregunta, pregIdx) => (
                        <div key={pregunta.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-gray-400 mt-2.5">P{pregIdx + 1}</span>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${pregunta.tipo === "libre" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                  {pregunta.tipo === "libre" ? "Respuesta Libre" : "Opción Múltiple"}
                                </span>
                                <button
                                  onClick={() => updatePregunta(modulo.id, pregunta.id, "tipo", pregunta.tipo === "multiple" ? "libre" : "multiple")}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                  Cambiar a {pregunta.tipo === "multiple" ? "respuesta libre" : "opción múltiple"}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={pregunta.pregunta}
                                onChange={(e) => updatePregunta(modulo.id, pregunta.id, "pregunta", e.target.value)}
                                placeholder="Escribe la pregunta..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                              />

                              {pregunta.tipo === "multiple" ? (
                                <div className="space-y-2">
                                  {pregunta.opciones.map((opcion, opIdx) => (
                                    <div key={opcion.id} className="flex items-center gap-2">
                                      <button
                                        onClick={() => updatePregunta(modulo.id, pregunta.id, "respuestaCorrecta", opIdx)}
                                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                                          opIdx === pregunta.respuestaCorrecta
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + opIdx)}
                                      </button>
                                      <input
                                        type="text"
                                        value={opcion.texto}
                                        onChange={(e) => updateOpcion(modulo.id, pregunta.id, opcion.id, e.target.value)}
                                        placeholder={`Opción ${String.fromCharCode(65 + opIdx)}`}
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                                      />
                                      {pregunta.opciones.length > 2 && (
                                        <button
                                          onClick={() => removeOpcion(modulo.id, pregunta.id, opcion.id)}
                                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                          <X className="w-3.5 h-3.5" />
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
                                <div className="px-3 py-2.5 rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 text-sm">
                                  Los estudiantes escribirán su respuesta libre. El facilitador deberá corregirla.
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removePregunta(modulo.id, pregunta.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors mt-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Material PDF */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Material de Apoyo (PDF)</h4>
                        <label className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors flex items-center gap-1 cursor-pointer">
                          <Plus className="w-3 h-3" />
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
                        <p className="text-xs text-gray-400">Sin material de apoyo para este módulo</p>
                      ) : (
                        <div className="space-y-1">
                          {materialPdf.filter((m) => m.modulo_id === modulo.id).map((m) => (
                            <div key={m.id} className="flex items-center justify-between bg-violet-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                <span className="text-sm text-violet-700 truncate">{m.nombre}</span>
                                {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 hover:text-violet-700 underline flex-shrink-0">Ver</a>}
                              </div>
                              <button
                                onClick={() => setMaterialPdf((prev) => prev.filter((x) => x.id !== m.id))}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Material PDF general del curso */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Material de Apoyo General</h2>
          <label className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors flex items-center gap-1 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Subir PDF General
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
                    modulo_id: null,
                    tipo: "curso",
                    file,
                  },
                ])
                e.target.value = ""
              }}
            />
          </label>
        </div>
        {materialPdf.filter((m) => m.modulo_id === null).length === 0 ? (
          <p className="text-sm text-gray-400">Sin material general</p>
        ) : (
          <div className="space-y-2">
            {materialPdf.filter((m) => m.modulo_id === null).map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-violet-50 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-violet-700 truncate">{m.nombre}</span>
                  {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 hover:text-violet-700 underline flex-shrink-0">Ver</a>}
                </div>
                <button
                  onClick={() => setMaterialPdf((prev) => prev.filter((x) => x.id !== m.id))}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 pb-8">
        <Link
          href={`/dashboard/cursos/${id}`}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
        >
          Cancelar
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || saved || !form.titulo || !form.facilitador_id || form.niveles.length === 0}
          className="flex-1 px-4 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Guardado
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </div>
  )
}

export default function CursoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={["decano", "facilitador"]}>
      <CursoEditarContent params={params} />
    </ProtectedRoute>
  )
}
