"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Clock, Mail, GraduationCap, LogOut } from "lucide-react"

export default function PendienteAprobacionPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.aprobado !== false || user.rol !== "estudiante") {
        router.push("/dashboard/noticias")
      }
    }
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-luxor-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-luxor-primary/5 via-white to-luxor-accent/10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl shadow-lg">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Inscripción en Proceso
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Su inscripción está siendo procesada
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              Un facilitador revisará y aprobará su cuenta pronto. Recibirá acceso completo a la plataforma una vez su inscripción sea aprobada.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{user.nombre}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={async () => {
                await logout()
                router.push("/login")
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Supermercados Luxor © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
