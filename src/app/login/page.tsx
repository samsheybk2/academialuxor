"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoginForm } from "@/components/auth/LoginForm"
import { GraduationCap, BookOpen, Award, Users } from "lucide-react"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.aprobado === false && user.rol === "estudiante") {
        router.push("/pendiente-aprobacion")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-luxor-primary via-luxor-secondary to-luxor-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-pulse border border-white/20">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-sm text-white/70 font-medium">Cargando plataforma...</p>
        </div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-[58%] h-screen sticky top-0 relative overflow-hidden flex-shrink-0">
        {/* Slideshow de fondos */}
        <div className="absolute inset-0">
          <img src="/fondo (1).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow1_12s_infinite]" />
          <img src="/fondo (2).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow2_12s_infinite]" />
          <img src="/fondo (3).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow3_12s_infinite]" />
        </div>
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-luxor-primary/60" />
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-20 w-72 h-72 border border-white rounded-full" />
          <div className="absolute top-32 left-32 w-48 h-48 border border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white rounded-full" />
          <div className="absolute bottom-40 right-40 w-64 h-64 border border-white rounded-full" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <div className="max-w-lg">
            {/* Texto principal */}
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Tu plataforma de
                <span className="block text-yellow-400 mt-1">formación profesional</span>
              </h1>
              <p className="text-lg text-white leading-relaxed max-w-md font-medium">
                Desarrolla tus habilidades, obtén certificaciones y crece profesionalmente dentro de Luxor.
              </p>
            </div>

            {/* Características */}
            <div className="mt-12 space-y-4">
              {[
                { icon: BookOpen, text: "Cursos especializados por área" },
                { icon: Award, text: "Certificados avalados por la empresa" },
                { icon: Users, text: "Aprendizaje colaborativo" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <item.icon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Degradado sutil en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header móvil - Fondo blanco con logo */}
        <div className="lg:hidden flex items-center justify-center py-6 bg-white flex-shrink-0 border-b border-gray-200">
          <img
            src="/logo.webp"
            alt="Academia Luxor"
            className="h-20 w-auto"
          />
        </div>

        {/* Área del formulario */}
        <div className="flex-1 overflow-y-auto relative bg-white lg:bg-white">
          {/* Slideshow de fondos - solo móvil */}
          <div className="absolute inset-0 lg:hidden">
            <img src="/fondo (1).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow1_12s_infinite]" />
            <img src="/fondo (2).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow2_12s_infinite]" />
            <img src="/fondo (3).webp" alt="" className="absolute inset-0 w-full h-full object-cover animate-[slideshow3_12s_infinite]" />
          </div>
          {/* Overlay oscuro para legibilidad - solo móvil */}
          <div className="absolute inset-0 bg-luxor-primary/60 lg:hidden" />
          
          <div className="relative z-10 flex items-center justify-center min-h-full px-6 py-12">
            <div className="w-full max-w-lg">
              {/* Logo - solo visible en desktop */}
              <div className="hidden lg:flex lg:justify-center mb-8">
                <img
                  src="/logo.webp"
                  alt="Academia Luxor"
                  className="max-h-32 w-auto object-contain"
                />
              </div>

              <LoginForm />

              <p className="text-center text-xs text-gray-400 lg:text-gray-400 text-white/60 mt-8">
                Supermercados Luxor © {new Date().getFullYear()} — Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
