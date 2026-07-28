"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Calculator, Layers, BarChart3, Clock, History, X, ChevronLeft } from "lucide-react"

const nomNav = [
  { href: "/nom/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/nom/escalas", label: "Escalas Salariales", icon: Layers },
  { href: "/nom/percentiles", label: "Percentiles Mercado", icon: BarChart3 },
  { href: "/nom/antiguedad", label: "Reglas Antiguedad", icon: Clock },
  { href: "/nom/historial", label: "Historial", icon: History },
]

interface NomSidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function NomSidebar({ open, onClose, collapsed, onToggleCollapse }: NomSidebarProps) {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumb = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const item = nomNav.find((n) => n.href === href)
    return { label: item?.label || seg, href, isLast: i === segments.length - 1 }
  })

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          collapsed ? "w-[68px]" : "w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/nom" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
                <span className="text-white font-bold text-xs">NOM</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">NOM</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
                <span className="text-white font-bold text-xs">NOM</span>
              </div>
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
                    <Link href={seg.href} className="hover:text-luxor-primary transition-colors">
                      {seg.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {nomNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
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
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>
    </>
  )
}
