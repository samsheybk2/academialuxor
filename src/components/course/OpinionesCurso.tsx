"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Star, MessageSquare, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface OpinionesCursoProps {
  cursoId: string
  inscrito: boolean
}

interface Opinion {
  id: string
  user_id: string
  user_nombre: string
  calificacion: number
  comentario: string | null
  created_at: string
}

function StarRating({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
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
            className={`w-5 h-5 transition-colors ${
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

function DistributionBar({ count, total }: { count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-gray-500">{count}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function OpinionesCurso({ cursoId, inscrito }: OpinionesCursoProps) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()

  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [miCalificacion, setMiCalificacion] = useState(0)
  const [miComentario, setMiComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [yaOpino, setYaOpino] = useState(false)

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
            setMiCalificacion(mia.calificacion)
            setMiComentario(mia.comentario || "")
          }
        }
      }
      setLoading(false)
    }
    fetchOpiniones()
  }, [cursoId, user?.id])

  async function handleEnviar() {
    if (!user || miCalificacion === 0) return
    setEnviando(true)
    await supabase.from("opiniones").upsert(
      {
        user_id: user.id,
        curso_id: cursoId,
        user_nombre: user.nombre || "Anonimo",
        calificacion: miCalificacion,
        comentario: miComentario.trim() || null,
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

  const distribucion = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: opiniones.filter((o) => o.calificacion === star).length,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-gray-900">
            {promedio.toFixed(1)}
          </p>
          <div className="flex justify-center mt-2">
            <StarRating rating={Math.round(promedio)} />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {opiniones.length} opinion{opiniones.length === 1 ? "" : "es"}
          </p>
          <div className="mt-4 space-y-1.5">
            {distribucion.map((d) => (
              <DistributionBar
                key={d.star}
                count={d.count}
                total={opiniones.length}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {opiniones.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Aun no hay opiniones para este curso
              </p>
            </div>
          )}

          {opiniones.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{o.user_nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StarRating rating={o.calificacion} />
              </div>
              {o.comentario && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {o.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {inscrito && user && !yaOpino && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Deja tu opinion
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Calificacion</p>
              <StarRating
                rating={miCalificacion}
                interactive
                onChange={setMiCalificacion}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Comentario (opcional)
              </p>
              <textarea
                value={miComentario}
                onChange={(e) => setMiComentario(e.target.value)}
                rows={3}
                placeholder="Comparte tu experiencia con este curso..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-none"
              />
            </div>
            <Button
              onClick={handleEnviar}
              disabled={miCalificacion === 0 || enviando}
            >
              {enviando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {yaOpino ? "Actualizar opinion" : "Enviar opinion"}
            </Button>
          </div>
        </div>
      )}

      {yaOpino && (
        <div className="bg-luxor-primary/5 border border-luxor-primary/10 rounded-xl p-4 text-center">
          <p className="text-sm text-luxor-primary font-medium">
            Gracias por tu opinion
          </p>
        </div>
      )}
    </div>
  )
}
