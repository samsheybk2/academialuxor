"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  X,
  ChevronLeft,
  Route,
  Calendar,
  Newspaper,
  Network,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navByRole = {
  decano: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Gestionar Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  developer: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Gestionar Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  facilitador: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Mis Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  estudiante: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/rutas-aprendizaje", label: "Mi Ruta", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
}

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const nav = user ? navByRole[user.rol] : []

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumb = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const item = nav.find((n) => n.href === href)
    return { label: item?.label || seg, href, isLast: i === segments.length - 1 }
  })

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          collapsed ? "w-[68px]" : "w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/dashboard" prefetch={true} className="flex items-center gap-2.5">
              <img
                src="/Academia Luxor.webp"
                alt="Academia Luxor"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                Academia LUXOR
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 flex items-center justify-center mx-auto">
              <img
                src="/Academia Luxor.webp"
                alt="Academia Luxor"
                className="w-8 h-8 object-contain"
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            <nav className="flex items-center gap-1 text-xs font-mono text-gray-400 overflow-x-auto">
              {breadcrumb.map((seg, i) => (
                <span key={seg.href} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  {seg.isLast ? (
                    <span className="text-luxor-primary font-semibold">{seg.label}</span>
                  ) : (
                    <Link href={seg.href} prefetch={true} className="hover:text-luxor-primary transition-colors">
                      {seg.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-luxor-primary/10 text-luxor-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  )
}
