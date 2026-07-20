"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { Publicacion, TipoReaccion, EncuestaOpcion } from "@/types"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import {
  Image as ImageIcon,
  Link2,
  Send,
  Loader2,
  X,
  ExternalLink,
  SmilePlus,
  Bold,
  Italic,
  List,
  ListOrdered,
  BarChart3,
  Plus,
  Trash2,
  Check,
  ThumbsUp,
  Heart,
  Flame,
  Frown,
  Smile,
  CircleHelp,
  Pencil,
  MapPin,
  Tag,
  MoreHorizontal,
} from "lucide-react"
import { CalendarioSidebar } from "@/components/ui/CalendarioSidebar"
import { Modal } from "@/components/ui/Modal"

const REACCIONES_CONFIG: Record<TipoReaccion, { icon: typeof ThumbsUp; color: string; bg: string; hoverBg: string; label: string }> = {
  me_gusta: { icon: ThumbsUp, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", hoverBg: "hover:bg-blue-50", label: "Me gusta" },
  me_encanta: { icon: Heart, color: "text-rose-500", bg: "bg-rose-50 border-rose-200", hoverBg: "hover:bg-rose-50", label: "Me encanta" },
  me_enoja: { icon: Flame, color: "text-orange-500", bg: "bg-orange-50 border-orange-200", hoverBg: "hover:bg-orange-50", label: "Me enoja" },
  me_entristece: { icon: Frown, color: "text-sky-500", bg: "bg-sky-50 border-sky-200", hoverBg: "hover:bg-sky-50", label: "Me entristece" },
  me_divierte: { icon: Smile, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", hoverBg: "hover:bg-amber-50", label: "Me divierte" },
  estoy_confundido: { icon: CircleHelp, color: "text-purple-500", bg: "bg-purple-50 border-purple-200", hoverBg: "hover:bg-purple-50", label: "Estoy confundido" },
}

const REACCION_KEYS = Object.keys(REACCIONES_CONFIG) as TipoReaccion[]

function timeAgo(date: string) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return "ahora"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  return `${weeks}sem`
}

function convertToWebp(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      const maxW = 1200
      const ratio = img.width > maxW ? maxW / img.width : 1
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Error al convertir imagen"))
        },
        "image/webp",
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Error al cargar imagen"))
    }
    img.src = url
  })
}

function EncuestaCard({
  encuestaId,
  publicacionId,
  userId,
  supabase,
}: {
  encuestaId: string
  publicacionId: string
  userId: string
  supabase: ReturnType<typeof createSupabaseClient>
}) {
  const [encuesta, setEncuesta] = useState<any>(null)
  const [voting, setVoting] = useState(false)

  const fetchEncuesta = useCallback(async () => {
    const { data: enc } = await supabase
      .from("encuestas")
      .select("*")
      .eq("id", encuestaId)
      .single()
    if (!enc) return

    const { data: opciones } = await supabase
      .from("encuesta_opciones")
      .select("*")
      .eq("encuesta_id", encuestaId)
      .order("orden")

    const { data: votos } = await supabase
      .from("encuesta_votos")
      .select("opcion_id, usuario_id")
      .eq("encuesta_id", encuestaId)

    const misVotos = (votos || []).filter((v: { usuario_id: string; opcion_id: string }) => v.usuario_id === userId).map((v: { opcion_id: string }) => v.opcion_id)
    const votosPorOpcion = new Map<string, number>()
    for (const v of votos || []) {
      votosPorOpcion.set(v.opcion_id, (votosPorOpcion.get(v.opcion_id) || 0) + 1)
    }
    const total = votos?.length || 0

    setEncuesta({
      ...enc,
      opciones: (opciones || []).map((o: any) => ({ ...o, votos: votosPorOpcion.get(o.id) || 0 })),
      mis_votos: misVotos,
      total_votos: total,
    })
  }, [encuestaId, supabase, userId])

  useEffect(() => {
    fetchEncuesta()
  }, [fetchEncuesta])

  async function handleVotar(opcionId: string) {
    if (!encuesta || voting) return
    if (encuesta.cerrada) return
    setVoting(true)

    if (encuesta.multiple) {
      const yaVoto = encuesta.mis_votos.includes(opcionId)
      if (yaVoto) {
        await supabase.from("encuesta_votos").delete().eq("encuesta_id", encuestaId).eq("usuario_id", userId).eq("opcion_id", opcionId)
      } else {
        await supabase.from("encuesta_votos").insert({ encuesta_id: encuestaId, opcion_id: opcionId, usuario_id: userId })
      }
    } else {
      await supabase.from("encuesta_votos").delete().eq("encuesta_id", encuestaId).eq("usuario_id", userId)
      await supabase.from("encuesta_votos").insert({ encuesta_id: encuestaId, opcion_id: opcionId, usuario_id: userId })
    }

    await fetchEncuesta()
    setVoting(false)
  }

  if (!encuesta) return <Loader2 className="w-4 h-4 animate-spin text-gray-400 my-2" />

  const total = encuesta.total_votos || 0
  const hasVoted = encuesta.mis_votos.length > 0

  return (
    <div className="mt-3 border border-white/40 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-luxor-primary" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{encuesta.pregunta}</p>
      </div>
      <div className="space-y-2">
        {encuesta.opciones?.map((opt: any) => {
          const pct = total > 0 ? Math.round((opt.votos / total) * 100) : 0
          const isSelected = encuesta.mis_votos.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => handleVotar(opt.id)}
              disabled={voting || encuesta.cerrada}
              className={`w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden border ${
                isSelected
                  ? "border-luxor-primary/30 bg-luxor-primary/5 text-luxor-primary"
                  : "border-white/30 bg-white/50 text-gray-700 hover:border-luxor-primary/20 hover:bg-white/80"
              } ${hasVoted ? "cursor-default" : "cursor-pointer hover:border-luxor-primary/30"}`}
            >
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isSelected ? "bg-luxor-primary/10" : "bg-gray-100"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isSelected && <Check className="w-3.5 h-3.5 text-luxor-primary" />}
                  {opt.texto}
                </span>
                {hasVoted && (
                  <span className="text-xs text-gray-400 font-normal">
                    {opt.votos} · {pct}%
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {hasVoted && (
        <p className="text-xs text-gray-400 mt-2">
          {total} voto{total !== 1 ? "s" : ""} ·{" "}
          {encuesta.multiple ? "Selección múltiple" : "Selección única"}
        </p>
      )}
    </div>
  )
}

function PublicacionContenido({ contenido }: { contenido: string }) {
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = contentRef.current
    if (!element) return
    setShowToggle(element.scrollHeight > element.clientHeight)
  }, [contenido])

  return (
    <div>
      <div
        ref={contentRef}
        className={`text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-gray-800 [&_strong]:font-bold [&_u]:underline ${expanded ? "" : "line-clamp-3 overflow-hidden"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", overflow: "hidden" }}
        dangerouslySetInnerHTML={{ __html: contenido }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-luxor-primary hover:text-luxor-secondary"
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  )
}

export default function NoticiasPage() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const canPost = user?.rol === "decano" || user?.rol === "facilitador" || user?.rol === "developer"

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [enlaceUrl, setEnlaceUrl] = useState("")
  const [enlaceTitulo, setEnlaceTitulo] = useState("")
  const [showEnlace, setShowEnlace] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [showPoll, setShowPoll] = useState(false)
  const [pollPregunta, setPollPregunta] = useState("")
  const [pollOpciones, setPollOpciones] = useState<string[]>(["", ""])
  const [pollMultiple, setPollMultiple] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({ heading: false, link: false }),
      Placeholder.configure({ placeholder: "¿Qué quieres compartir con la comunidad?" }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
  })

  const fetchPublicaciones = useCallback(async () => {
    const { data: pubData } = await supabase
      .from("publicaciones")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (!pubData) {
      setPublicaciones([])
      setLoading(false)
      return
    }

    const autorIds = [...new Set(pubData.map((p: { autor_id: string }) => p.autor_id))]
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre, avatar_url, rol")
      .in("id", autorIds)

    const perfilMap = new Map((perfiles || []).map((p: { id: string }) => [p.id, p]))

    const pubIds = pubData.map((p: { id: string }) => p.id)
    const { data: reacciones } = await supabase
      .from("reacciones")
      .select("publicacion_id, usuario_id, tipo")
      .in("publicacion_id", pubIds)

    const { data: encuestas } = await supabase
      .from("encuestas")
      .select("id, publicacion_id")
      .in("publicacion_id", pubIds)

    const encuestaMap = new Map((encuestas || []).map((e: { publicacion_id: string; id: string }) => [e.publicacion_id, e.id]))

    const myReactions = new Map<string, string>()
    const reactionCounts = new Map<string, Record<string, number>>()

    for (const r of reacciones || []) {
      if (r.usuario_id === user?.id) {
        myReactions.set(r.publicacion_id, r.tipo)
      }
      const counts = reactionCounts.get(r.publicacion_id) || {}
      counts[r.tipo] = (counts[r.tipo] || 0) + 1
      reactionCounts.set(r.publicacion_id, counts)
    }

    const enriched: Publicacion[] = pubData.map((p: { id: string; autor_id: string; [key: string]: any }) => ({
      ...p,
      autor: perfilMap.get(p.autor_id) as any,
      mis_reacciones: myReactions.get(p.id),
      total_reacciones: reactionCounts.get(p.id) || {},
      encuesta_id: encuestaMap.get(p.id),
    }))

    setPublicaciones(enriched)
    setLoading(false)
  }, [supabase, user?.id])

  useEffect(() => {
    fetchPublicaciones()
  }, [fetchPublicaciones])

  function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagenPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removeImagen() {
    setImagenFile(null)
    setImagenPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  function addPollOption() {
    if (pollOpciones.length < 6) setPollOpciones([...pollOpciones, ""])
  }

  function removePollOption(index: number) {
    if (pollOpciones.length > 2) {
      setPollOpciones(pollOpciones.filter((_, i) => i !== index))
    }
  }

  function updatePollOption(index: number, value: string) {
    const updated = [...pollOpciones]
    updated[index] = value
    setPollOpciones(updated)
  }

  async function handlePublicar() {
    const html = editor?.getHTML() || ""
    const textOnly = editor?.getText().trim() || ""
    if (!textOnly || !user?.id) return
    setSubmitting(true)

    let imagenUrl: string | null = null
    if (imagenFile) {
      setUploading(true)
      try {
        const webpBlob = await convertToWebp(imagenFile)
        const path = `noticias/${user.id}/${Date.now()}.webp`
        const { error } = await supabase.storage.from("publicaciones").upload(path, webpBlob, {
          contentType: "image/webp",
        })
        if (!error) {
          const { data } = supabase.storage.from("publicaciones").getPublicUrl(path)
          imagenUrl = data.publicUrl
        }
      } catch {}
      setUploading(false)
    }

    const { data: pub, error: pubError } = await supabase
      .from("publicaciones")
      .insert({
        autor_id: user.id,
        contenido: html,
        imagen_url: imagenUrl,
        enlace_url: enlaceUrl.trim() || null,
        enlace_titulo: enlaceTitulo.trim() || null,
      })
      .select("id")
      .single()

    if (pub && !pubError && showPoll && pollPregunta.trim()) {
      const { data: enc } = await supabase
        .from("encuestas")
        .insert({
          publicacion_id: pub.id,
          pregunta: pollPregunta.trim(),
          multiple: pollMultiple,
        })
        .select("id")
        .single()

      if (enc) {
        const opciones = pollOpciones.filter((o) => o.trim()).map((texto, i) => ({
          encuesta_id: enc.id,
          texto: texto.trim(),
          orden: i,
        }))
        await supabase.from("encuesta_opciones").insert(opciones)
      }
    }

    if (!pubError) {
      editor?.commands.setContent("")
      removeImagen()
      setEnlaceUrl("")
      setEnlaceTitulo("")
      setShowEnlace(false)
      setShowPoll(false)
      setPollPregunta("")
      setPollOpciones(["", ""])
      setPollMultiple(false)
      setShowCreateModal(false)
      fetchPublicaciones()
    }

    setSubmitting(false)
  }

  async function toggleReaccion(pubId: string, tipo: TipoReaccion) {
    if (!user?.id) return
    const pub = publicaciones.find((p) => p.id === pubId)
    if (!pub) return

    const actual = pub.mis_reacciones

    if (actual === tipo) {
      await supabase.from("reacciones").delete().eq("publicacion_id", pubId).eq("usuario_id", user.id)
      setPublicaciones((prev) =>
        prev.map((p) => {
          if (p.id !== pubId) return p
          const newTotal = { ...p.total_reacciones }
          newTotal[tipo] = (newTotal[tipo] || 1) - 1
          if (newTotal[tipo] <= 0) delete newTotal[tipo]
          return { ...p, mis_reacciones: undefined, total_reacciones: newTotal }
        })
      )
    } else {
      if (actual) {
        await supabase.from("reacciones").delete().eq("publicacion_id", pubId).eq("usuario_id", user.id)
      }
      await supabase.from("reacciones").insert({
        publicacion_id: pubId,
        usuario_id: user.id,
        tipo,
      })
      setPublicaciones((prev) =>
        prev.map((p) => {
          if (p.id !== pubId) return p
          const newTotal = { ...p.total_reacciones }
          if (actual) {
            newTotal[actual] = (newTotal[actual] || 1) - 1
            if (newTotal[actual] <= 0) delete newTotal[actual]
          }
          newTotal[tipo] = (newTotal[tipo] || 0) + 1
          return { ...p, mis_reacciones: tipo, total_reacciones: newTotal }
        })
      )
    }
  }

async function handleEliminar(pubId: string) {
    if (!confirm("¿Eliminar esta publicación?")) return
    await supabase.from("publicaciones").delete().eq("id", pubId)
    setPublicaciones((prev) => prev.filter((p) => p.id !== pubId))
  }

  if (loading) {
    return (
      <>
        <div className="relative z-[2] flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-luxor-primary" />
        </div>
      </>
    )
  }

  const banners = [
    { titulo: "Academia LUXOR", sub: "Plataforma de formación profesional", grad: "from-luxor-primary to-luxor-secondary", emoji: "🎓" },
    { titulo: "Cursos Destacados", sub: "Explora nuestro catálogo completo", grad: "from-amber-500 to-orange-600", emoji: "📚" },
    { titulo: "Certifícate", sub: "Obtén tus certificados avalados", grad: "from-emerald-500 to-teal-600", emoji: "🏆" },
    { titulo: "Nuevos Talleres", sub: "Capacitación práctica presencial", grad: "from-violet-500 to-purple-600", emoji: "🛠️" },
    { titulo: "Rutas de Aprendizaje", sub: "Sigue tu camino de formación", grad: "from-rose-500 to-pink-600", emoji: "🗺️" },
  ]

  return (
    <>
       <div className="relative z-[2] w-full h-full flex flex-col -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
       <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,760px)_340px] gap-0 w-full h-full">
         {/* Sidebar izquierdo — Calendario */}
         <div className="hidden lg:block h-full w-full overflow-y-auto custom-scrollbar bg-[#F0F2F5] p-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
           <CalendarioSidebar />
         </div>

         {/* Feed principal — siempre centrado */}
         <div className="h-full overflow-y-auto bg-[#F0F2F5] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
         <div className="w-full space-y-6 sm:max-w-xl sm:mx-auto sm:px-4 sm:py-6">

         {/* Modal Crear Publicación */}
         {canPost && (
           <Modal
             show={showCreateModal}
             onClose={() => setShowCreateModal(false)}
             title=""
           >
          <div className="px-0 py-0">
            {/* Header con usuario */}
            <div className="flex items-center gap-3 px-6 pb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white/60 shadow-md">
                {user?.nombre?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.nombre || "Usuario"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    Público
                  </span>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="px-6 pb-4">
              <div className="border-b border-gray-100 pb-4">
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none min-h-[120px] text-gray-900 text-base [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_li]:text-gray-900 [&_.tiptap_strong]:font-bold [&_.tiptap_u]:underline"
                />
              </div>
            </div>

            {/* Preview imagen */}
            {imagenPreview && (
              <div className="px-6 pb-4">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={imagenPreview} alt="Preview" className="w-full max-h-60 object-cover" />
                  <button
                    onClick={removeImagen}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Enlace */}
            {showEnlace && (
              <div className="px-6 pb-4 space-y-2">
                <input
                  type="url"
                  value={enlaceUrl}
                  onChange={(e) => setEnlaceUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/20"
                />
                <input
                  type="text"
                  value={enlaceTitulo}
                  onChange={(e) => setEnlaceTitulo(e.target.value)}
                  placeholder="Título del enlace (opcional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/20"
                />
              </div>
            )}

            {/* Encuesta */}
            {showPoll && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-luxor-primary" />
                      <span className="text-sm font-medium text-gray-700">Encuesta</span>
                    </div>
                    <button onClick={() => setShowPoll(false)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pollPregunta}
                    onChange={(e) => setPollPregunta(e.target.value)}
                    placeholder="¿Qué pregunta quieres hacer?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/20"
                  />
                  {pollOpciones.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4 text-center">{i + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updatePollOption(i, e.target.value)}
                        placeholder={`Opción ${i + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/20"
                      />
                      {pollOpciones.length > 2 && (
                        <button onClick={() => removePollOption(i)} className="text-gray-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOpciones.length < 6 && (
                    <button
                      onClick={addPollOption}
                      className="flex items-center gap-1 text-xs text-luxor-primary hover:text-luxor-secondary font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar opción
                    </button>
                  )}
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pollMultiple}
                      onChange={(e) => setPollMultiple(e.target.checked)}
                      className="rounded border-gray-300 text-luxor-primary focus:ring-luxor-primary"
                    />
                    Permitir selección múltiple
                  </label>
                </div>
              </div>
            )}

            {/* Toolbar inferior */}
            <div className="px-6 pb-4">
              <div className="border border-gray-200 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Agregar a tu publicación</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Agregar imagen"
                  >
                    <ImageIcon className="w-6 h-6 text-green-500" />
                  </button>
                  <button
                    onClick={() => setShowEnlace(!showEnlace)}
                    className={`p-2 rounded-lg transition-colors ${showEnlace ? "bg-blue-50" : "hover:bg-gray-100"}`}
                    title="Agregar enlace"
                  >
                    <Link2 className="w-6 h-6 text-blue-500" />
                  </button>
                  <button
                    onClick={() => setShowPoll(!showPoll)}
                    className={`p-2 rounded-lg transition-colors ${showPoll ? "bg-purple-50" : "hover:bg-gray-100"}`}
                    title="Agregar encuesta"
                  >
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Etiquetar personas">
                    <Tag className="w-6 h-6 text-blue-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Ubicación">
                    <MapPin className="w-6 h-6 text-red-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Más opciones">
                    <MoreHorizontal className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Botón Publicar */}
            <div className="px-6 pb-6">
              <button
                onClick={handlePublicar}
                disabled={submitting || uploading || !(editor?.getText().trim())}
                className="w-full py-2.5 bg-luxor-primary text-white text-sm font-semibold rounded-lg hover:bg-luxor-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar
              </button>
            </div>
          </div>
        </Modal>
        )}

        <div className="mt-8 bg-white/80 backdrop-blur-xl sm:rounded-2xl shadow-xl shadow-black/5 border border-white/50 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white/60 shadow-md">
              {user?.nombre?.charAt(0) || "?"}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 text-left px-4 py-2.5 bg-gray-100 rounded-full text-gray-500 text-sm hover:bg-gray-200 transition-colors"
            >
              ¿Qué quieres compartir con la comunidad?
            </button>
          </div>
        </div>

        {publicaciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SmilePlus className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Aún no hay publicaciones</p>
            <p className="text-gray-300 text-xs mt-1">Sé el primero en compartir algo</p>
          </div>
        ) : (
          publicaciones.map((pub) => (
            <div key={pub.id} className="bg-white/70 backdrop-blur-xl sm:rounded-2xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/8">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white/60 shadow-md">
                    {pub.autor?.avatar_url ? (
                      <img src={pub.autor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      pub.autor?.nombre?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{pub.autor?.nombre || "Usuario"}</p>
                    <p className="text-xs text-gray-400">
                      <span className={`font-medium ${
                        pub.autor?.rol === "decano" || pub.autor?.rol === "developer" ? "text-amber-600" : pub.autor?.rol === "facilitador" ? "text-luxor-primary" : "text-gray-500"
                      }`}>
                        {pub.autor?.rol === "decano" || pub.autor?.rol === "developer" ? "Admin" : pub.autor?.rol === "facilitador" ? "Facilitador" : "Estudiante"}
                      </span>
                      <span className="mx-1.5 text-gray-300">·</span>
                      {timeAgo(pub.created_at)}
                    </p>
                  </div>
                  {(user?.id === pub.autor_id || user?.rol === "decano" || user?.rol === "developer") && (
                    <button onClick={() => handleEliminar(pub.id)} className="text-gray-300 hover:text-red-500 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                      Eliminar
                    </button>
                  )}
                </div>

                <PublicacionContenido contenido={pub.contenido} />

                {pub.imagen_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/40 shadow-md">
                    <img src={pub.imagen_url} alt="" className="w-full max-h-80 object-cover" />
                  </div>
                )}

                {(pub as any).encuesta_id && (
                  <EncuestaCard
                    encuestaId={(pub as any).encuesta_id}
                    publicacionId={pub.id}
                    userId={user?.id || ""}
                    supabase={supabase}
                  />
                )}

                {pub.enlace_url && (
                  <a
                    href={pub.enlace_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 bg-luxor-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-4 h-4 text-luxor-primary" />
                    </div>
                    <span className="text-sm text-luxor-primary font-medium truncate">{pub.enlace_titulo || pub.enlace_url}</span>
                  </a>
                )}
              </div>

              <div className="px-5 pb-3 pt-2 flex items-center gap-2 flex-wrap border-t border-white/30 mt-2">
                {REACCION_KEYS.map((tipo) => {
                  const config = REACCIONES_CONFIG[tipo]
                  const Icon = config.icon
                  const count = pub.total_reacciones?.[tipo] || 0
                  const isActive = pub.mis_reacciones === tipo
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleReaccion(pub.id, tipo)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isActive
                          ? `${config.bg} ${config.color} shadow-md scale-110`
                          : `border-white/30 bg-white/30 ${config.color} opacity-50 hover:opacity-100 hover:bg-white/60 hover:shadow-sm`
                      }`}
                      title={config.label}
                    >
                      <Icon className={`w-5 h-5`} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 2.5 : 2} />
                      {count > 0 && <span>{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
        </div>
        </div>

        {/* Sidebar derecha — cursos de formación selectiva */}
        <div className="hidden lg:block w-[340px] shrink-0 h-full overflow-y-auto custom-scrollbar bg-[#F0F2F5] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 space-y-3">
            <div className="px-1 py-2">
              <h3 className="text-sm font-semibold text-gray-800">Cursos de formación selectiva</h3>
              <p className="text-xs text-gray-500 mt-1">Explora capacitaciones recomendadas para tu crecimiento.</p>
            </div>

            {[
              {
                titulo: "Liderazgo y gestión de equipos",
                categoria: "Desarrollo humano",
                duracion: "6 semanas",
              },
              {
                titulo: "Atención al cliente premium",
                categoria: "Servicio",
                duracion: "4 semanas",
              },
              {
                titulo: "Prevención de pérdidas",
                categoria: "Operaciones",
                duracion: "3 semanas",
              },
              {
                titulo: "Normativas y cumplimiento",
                categoria: "Gestión",
                duracion: "5 semanas",
              },
            ].map((curso, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-luxor-primary">
                    {curso.categoria}
                  </span>
                  <span className="text-[10px] text-gray-400">{curso.duracion}</span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-gray-800">{curso.titulo}</h4>
                <button className="mt-3 w-full rounded-lg bg-luxor-primary/10 px-3 py-2 text-xs font-medium text-luxor-primary hover:bg-luxor-primary/20 transition-colors">
                  Ver curso
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
