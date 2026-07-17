"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Certificado } from "@/components/course/Certificado"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

function TallerCertContent({ id }: { id: string }) {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [evalData, setEvalData] = useState<{
    tallerTitulo: string
    aprobado: boolean
    observaciones: string
    created_at: string
  } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) fetchData()
  }, [user?.id, id])

  async function fetchData() {
    if (!user) return
    setLoading(true)

    const { data: taller } = await supabase
      .from("cargo_elementos")
      .select("id, titulo")
      .eq("id", id)
      .single()

    if (!taller) {
      setError("Taller no encontrado")
      setLoading(false)
      return
    }

    const { data: evalTaller } = await supabase
      .from("evaluacion_talleres")
      .select("id, aprobado, observaciones, created_at")
      .eq("taller_id", id)
      .eq("user_id", user.id)
      .single()

    if (!evalTaller) {
      setError("Aún no has sido evaluado en este taller")
      setLoading(false)
      return
    }

    if (!evalTaller.aprobado) {
      setError("Este taller no ha sido aprobado. Solo puedes ver certificados de talleres aprobados.")
      setLoading(false)
      return
    }

    setEvalData({
      tallerTitulo: taller.titulo,
      aprobado: evalTaller.aprobado,
      observaciones: evalTaller.observaciones || "",
      created_at: evalTaller.created_at,
    })
    setLoading(false)
  }

  return (
    <ProtectedRoute allowedRoles={["estudiante", "decano", "facilitador"]}>
      <div className="space-y-4">
        <Link
          href="/dashboard/rutas-aprendizaje"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Ruta
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 font-medium">{error}</p>
          </div>
        ) : evalData ? (
          <Certificado
            nombre={user?.nombre || "Estudiante"}
            curso={evalData.tallerTitulo}
            fecha={new Date(evalData.created_at).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            duracion="N/A"
            tipo="taller"
          />
        ) : null}
      </div>
    </ProtectedRoute>
  )
}

export default function TallerCertPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <TallerCertContent id={id} />
}
