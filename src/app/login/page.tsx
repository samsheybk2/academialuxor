"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoginForm } from "@/components/auth/LoginForm"
import { GraduationCap, BookOpen, Award, Users, Shield } from "lucide-react"

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
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-[58%] h-screen sticky top-0 relative overflow-hidden">
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

        {/* Elementos académicos flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] text-white/[0.06] animate-float-slow">
            <BookOpen className="w-24 h-24" />
          </div>
          <div className="absolute top-[60%] left-[5%] text-white/[0.05] animate-float-medium">
            <Award className="w-20 h-20" />
          </div>
          <div className="absolute top-[25%] right-[15%] text-white/[0.05] animate-float-fast">
            <Users className="w-16 h-16" />
          </div>
          <div className="absolute bottom-[20%] right-[8%] text-white/[0.06] animate-float-slow" style={{ animationDelay: "2s" }}>
            <Shield className="w-28 h-28" />
          </div>
          <div className="absolute bottom-[35%] left-[25%] text-white/[0.04] animate-float-medium" style={{ animationDelay: "1s" }}>
            <GraduationCap className="w-32 h-32" />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-3">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <GraduationCap className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">ACADEMIA</h2>
                  <p className="text-[11px] text-white/60 tracking-[0.25em] uppercase">Supermercados Luxor</p>
                </div>
              </div>
            </div>

            {/* Texto principal */}
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Tu plataforma de
                <span className="block text-yellow-400 mt-1">formación profesional</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-md">
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
                  className="flex items-center gap-3 text-white/60"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <item.icon className="w-4 h-4 text-yellow-400/80" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Degradado sutil en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex flex-col">
        {/* Header móvil */}
        <div className="lg:hidden flex items-center justify-center py-8 bg-gradient-to-r from-luxor-primary to-luxor-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ACADEMIA</h2>
              <p className="text-[10px] text-white/60 tracking-wider uppercase">Plataforma de Formación</p>
            </div>
          </div>
        </div>

        {/* Área del formulario */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Título del formulario - solo visible en desktop */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
              <p className="text-gray-500 mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            <LoginForm />

            <p className="text-center text-xs text-gray-400 mt-8">
              Supermercados Luxor © {new Date().getFullYear()} — Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
