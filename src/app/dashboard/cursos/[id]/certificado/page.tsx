"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Certificado } from "@/components/course/Certificado"

interface Curso {
  id: string
  titulo: string
  duracion: string
}

export default function CertificadoPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [curso, setCurso] = useState<Curso | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    supabase
      .from("cursos")
      .select("id, titulo, duracion")
      .eq("id", id)
      .single()
      .then(({ data }) => setCurso(data))
  }, [id, supabase])

  if (!curso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Certificado
        nombre={user?.nombre || "Nombre del Estudiante"}
        curso={curso.titulo}
        fecha={new Date().toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        duracion={curso.duracion}
        preview
      />
    </div>
  )
}
