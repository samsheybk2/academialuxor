"use client"

import { use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { PerfilContent } from "@/app/dashboard/perfil/page"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function UsuarioPerfilContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/usuarios"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a usuarios
      </Link>
      <PerfilContent viewUserId={id} />
    </div>
  )
}

export default function UsuarioPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer"]}>
      <UsuarioPerfilContent params={params} />
    </ProtectedRoute>
  )
}
