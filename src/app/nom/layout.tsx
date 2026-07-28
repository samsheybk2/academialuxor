"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Calculator, Layers, BarChart3, Clock, History, Menu, X, ArrowUpRight, LogOut, ChevronRight } from "lucide-react"

const nomNav = [
  { href: "/nom/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/nom/escalas", label: "Escalas Salariales", icon: Layers },
  { href: "/nom/percentiles", label: "Percentiles Mercado", icon: BarChart3 },
  { href: "/nom/antiguedad", label: "Reglas Antiguedad", icon: Clock },
  { href: "/nom/historial", label: "Historial", icon: History },
]

export default function NomLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="h-dvh bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 flex items-center px-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/nom" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">NOM</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">Nomina</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {nomNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-800"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CYD</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
            <Link href="/dashboard/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.nombre} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.nombre?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Cerrar sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 ml-2"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">NOM</span>
                </div>
                <span className="text-white font-semibold text-sm">Nomina</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {nomNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden mt-14">
        {children}
      </main>
    </div>
  )
}
