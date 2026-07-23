"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Star, MessageSquare, Loader2, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface OpinionesCursoProps {
  cursoId: string
  inscrito: boolean
  cursoCompletado: boolean
}

interface Opinion {
  id: string
  user_id: string
  user_nombre: string
  calificacion: number
  calificacion_duracion: number | null
  calificacion_explicacion: number | null
  calificacion_utilidad: number | null
  comentario: string | null
  observaciones: string | null
  created_at: string
}

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = "w-5 h-5",
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
  size?: string
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ratingLabel(avg: number): string {
  if (avg >= 4.5) return "Excelente"
  if (avg >= 3.5) return "Agradable"
  if (avg >= 2.5) return "Bueno"
  if (avg >= 1.5) return "Debe mejorar"
  return "Deficiente"
}

function ratingLabelColor(avg: number): string {
  if (avg >= 4.5) return "text-emerald-600 bg-emerald-50"
  if (avg >= 3.5) return "text-blue-600 bg-blue-50"
  if (avg >= 2.5) return "text-amber-600 bg-amber-50"
  if (avg >= 1.5) return "text-orange-600 bg-orange-50"
  return "text-red-600 bg-red-50"
}

export function OpinionesCurso({ cursoId, inscrito, cursoCompletado }: OpinionesCursoProps) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()

  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [yaOpino, setYaOpino] = useState(false)

  const [dur, setDur] = useState(0)
  const [exp, setExp] = useState(0)
  const [util, setUtil] = useState(0)
  const [obs, setObs] = useState("")

  useEffect(() => {
    async function fetchOpiniones() {
      setLoading(true)
      const { data } = await supabase
        .from("opiniones")
        .select("*")
        .eq("curso_id", cursoId)
        .order("created_at", { ascending: false })

      if (data) {
        setOpiniones(data as Opinion[])
        if (user) {
          const mia = data.find((o: any) => o.user_id === user.id)
          if (mia) {
            setYaOpino(true)
            setDur(mia.calificacion_duracion || mia.calificacion || 0)
            setExp(mia.calificacion_explicacion || mia.calificacion || 0)
            setUtil(mia.calificacion_utilidad || mia.calificacion || 0)
            setObs(mia.observaciones || mia.comentario || "")
          }
        }
      }
      setLoading(false)
    }
    fetchOpiniones()
  }, [cursoId, user?.id])

  async function handleEnviar() {
    if (!user || dur === 0 || exp === 0 || util === 0) return
    setEnviando(true)

    const avg = (dur + exp + util) / 3
    const nombre = user.nombre || "Anonimo"

    await supabase.from("opiniones").upsert(
      {
        user_id: user.id,
        curso_id: cursoId,
        user_nombre: nombre,
        calificacion: Math.round(avg),
        calificacion_duracion: dur,
        calificacion_explicacion: exp,
        calificacion_utilidad: util,
        comentario: obs.trim() || null,
        observaciones: obs.trim() || null,
      },
      { onConflict: "user_id,curso_id" }
    )
    setYaOpino(true)
    setEnviando(false)

    const { data } = await supabase
      .from("opiniones")
      .select("*")
      .eq("curso_id", cursoId)
      .order("created_at", { ascending: false })
    if (data) setOpiniones(data as Opinion[])
  }

  const promedio =
    opiniones.length > 0
      ? opiniones.reduce((s, o) => s + o.calificacion, 0) / opiniones.length
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {inscrito && !cursoCompletado && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            Completa todos los modulos para dejar tu opinion del curso
          </p>
        </div>
      )}

      {inscrito && cursoCompletado && !yaOpino && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-1">
            Califica este curso
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            Tu opinion ayuda a otros estudiantes a elegir sus cursos
          </p>

          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Duracion del curso</p>
              </div>
              <StarRating rating={dur} interactive onChange={setDur} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Explicacion del contenido</p>
              </div>
              <StarRating rating={exp} interactive onChange={setExp} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Utilidad del contenido</p>
              </div>
              <StarRating rating={util} interactive onChange={setUtil} />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Observaciones (opcional)</p>
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={3}
                placeholder="Comparte tu experiencia con este curso..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
              />
            </div>

            {dur > 0 && exp > 0 && util > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Tu calificacion:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ratingLabelColor((dur + exp + util) / 3)}`}>
                  {ratingLabel((dur + exp + util) / 3)}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round((dur + exp + util) / 3) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleEnviar}
              disabled={dur === 0 || exp === 0 || util === 0 || enviando}
            >
              {enviando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar opinion
            </Button>
          </div>
        </div>
      )}

      {yaOpino && (
        <div className="bg-luxor-primary/5 border border-luxor-primary/10 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-luxor-primary flex-shrink-0" />
          <p className="text-sm text-luxor-primary font-medium">
            Gracias por tu opinion
          </p>
        </div>
      )}

      {opiniones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            Opiniones de otros estudiantes ({opiniones.length})
          </h4>

          {promedio > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${ratingLabelColor(promedio)}`}>
                {ratingLabel(promedio)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(promedio) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{promedio.toFixed(1)} promedio</span>
            </div>
          )}

          {opiniones.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{o.user_nombre}</p>
                <p className="text-xs text-gray-400">
                  {new Date(o.created_at).toLocaleDateString("es-VE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(o.calificacion_duracion || o.calificacion) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="font-medium">Duracion:</span>
                    <StarRating rating={o.calificacion_duracion || o.calificacion} size="w-3.5 h-3.5" />
                  </div>
                )}
                {(o.calificacion_explicacion || o.calificacion) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="font-medium">Explicacion:</span>
                    <StarRating rating={o.calificacion_explicacion || o.calificacion} size="w-3.5 h-3.5" />
                  </div>
                )}
                {(o.calificacion_utilidad || o.calificacion) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="font-medium">Utilidad:</span>
                    <StarRating rating={o.calificacion_utilidad || o.calificacion} size="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {(o.observaciones || o.comentario) && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {o.observaciones || o.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
