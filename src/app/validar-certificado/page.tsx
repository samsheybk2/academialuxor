"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Shield, CheckCircle2, XCircle, Award, Calendar, Clock, User, BookOpen, Loader2 } from "lucide-react"

interface CertificadoData {
  cert_id: string
  user_nombre: string
  curso_nombre: string
  duracion: string
  fecha_emision: string
}

function ValidarCertificadoContent() {
  const searchParams = useSearchParams()
  const certId = searchParams.get("id")
  const supabase = createSupabaseClient()

  const [certificado, setCertificado] = useState<CertificadoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!certId) return

    async function validate() {
      setLoading(true)
      const { data } = await supabase
        .from("certificados")
        .select("cert_id, user_nombre, curso_nombre, duracion, fecha_emision")
        .eq("cert_id", certId)
        .single()

      if (data) {
        setCertificado(data as CertificadoData)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }

    validate()
  }, [certId])

  if (!certId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ID de Certificado Requerido
          </h1>
          <p className="text-gray-500">
            No se proporcionó un ID de certificado válido.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-luxor-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verificando certificado...</p>
        </div>
      </div>
    )
  }

  if (notFound || !certificado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Certificado No Encontrado
          </h1>
          <p className="text-gray-500 mb-4">
            El certificado con ID <span className="font-mono text-gray-700">{certId}</span> no existe en nuestro sistema.
          </p>
          <p className="text-xs text-gray-400">
            Verifica que el ID sea correcto y vuelve a intentar.
          </p>
        </div>
      </div>
    )
  }

  const fecha = new Date(certificado.fecha_emision).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxor-primary/5 via-white to-luxor-accent/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Certificado Valido
          </h1>
          <p className="text-gray-500 mt-2">
            Este certificado ha sido verificado correctamente
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-luxor-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">ID del Certificado</p>
              <p className="font-mono text-sm text-gray-900">{certificado.cert_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-luxor-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Titular</p>
              <p className="font-medium text-gray-900">{certificado.user_nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-luxor-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Curso</p>
              <p className="font-medium text-gray-900">{certificado.curso_nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-luxor-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Fecha de Emisión</p>
              <p className="font-medium text-gray-900">{fecha}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-luxor-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Duración</p>
              <p className="font-medium text-gray-900">{certificado.duracion || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxor-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Estado</p>
              <p className="font-medium text-blue-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Valido y Verificado
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-luxor-primary/5 rounded-xl border border-luxor-primary/10">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-luxor-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-luxor-primary">
                Supermercados Luxor
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Este certificado es emitido por la plataforma de capacitacion
                corporativa Academia LUXOR y garantiza la completacion exitosa del
                programa de formacion.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Formato: LX-XXXXXXXX-XXXX
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ValidarCertificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-luxor-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verificando certificado...</p>
          </div>
        </div>
      }
    >
      <ValidarCertificadoContent />
    </Suspense>
  )
}
