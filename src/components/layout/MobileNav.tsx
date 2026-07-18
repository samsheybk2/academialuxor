"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LayoutDashboard, GraduationCap, BookOpen, Users, Route, Calendar, Newspaper, MoreVertical, X } from "lucide-react"

const navByRole = {
  decano: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas", icon: Route },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  developer: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas", icon: Route },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  facilitador: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas", icon: Route },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  estudiante: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/rutas-aprendizaje", label: "Mi Ruta", icon: Route },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
}

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const nav = user ? navByRole[user.rol] : []
  const [showMore, setShowMore] = useState(false)

  const visibleItems = nav.slice(0, 4)
  const hiddenItems = nav.slice(4)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className="flex flex-col items-center gap-1 px-2 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  isActive ? "bg-luxor-primary shadow-md shadow-luxor-primary/25" : ""
                }`}>
                  <item.icon className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-luxor-primary" : "text-gray-500"
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          {hiddenItems.length > 0 && (
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center gap-1 px-2 py-1"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-[10px] font-medium text-gray-500">Más</span>
            </button>
          )}
        </div>
      </nav>

      {showMore && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-20 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden lg:hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Más opciones</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="py-2">
              {hiddenItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-luxor-primary/10 text-luxor-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-luxor-primary" : "text-gray-500"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
