"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, Users, ClipboardList, BarChart3, Settings, Network, Briefcase, Menu } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"

const navItems = [
  { href: "/cst/candidatos", label: "Candidatos", icon: Users },
  { href: "/cst/plantilla", label: "Plantilla", icon: Briefcase },
  { href: "/cst/test-competencias", label: "Tests", icon: ClipboardList },
  { href: "/cst/panel-control", label: "Panel", icon: BarChart3 },
  { href: "/cst/configuracion", label: "Config", icon: Settings },
  { href: "/cst/organigrama", label: "Organigrama", icon: Network },
]

function TooltipIcon({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <Link
      href={href}
      prefetch={true}
      className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
        isActive ? "bg-emerald-600 shadow-md shadow-emerald-600/25" : "hover:bg-gray-100"
      }`}>
        <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-white" : "text-gray-500"}`} />
      </div>
      {isActive && (
        <div className="absolute -bottom-2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
      )}
      {show && (
        <div className="absolute top-full mt-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
          {label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </Link>
  )
}

export function CstHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showAppSwitcher, setShowAppSwitcher] = useState(false)

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center px-4">
      <div className="flex items-center gap-2 shrink-0">
        {user?.rol === "developer" && (
          <button onClick={() => setShowAppSwitcher(true)} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {navItems.map((item) => (
          <TooltipIcon
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      <div className="flex items-center gap-3 ml-auto shrink-0">
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <Link href="/dashboard/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.nombre} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm">
                  {user?.nombre?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <AppSidebar isOpen={showAppSwitcher} onClose={() => setShowAppSwitcher(false)} />
    </>
  )
}
