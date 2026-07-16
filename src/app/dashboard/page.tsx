"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Construction } from "lucide-react"

function DashboardContent() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 rounded-2xl bg-luxor-primary/10 flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-luxor-primary" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Estamos trabajando en ello</h1>
      <p className="text-gray-500 text-center max-w-md">
        Estamos mejorando tu experiencia como usuario. Pronto tendremos nuevas funcionalidades para ti.
      </p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "facilitador"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
