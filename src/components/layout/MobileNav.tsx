"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LayoutDashboard, GraduationCap, BookOpen, Users, Route, Calendar, Newspaper } from "lucide-react"

const navByRole = {
  decano: [
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {nav.map((item) => {
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
      </div>
    </nav>
  )
}
