"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, ChevronLeft, Users, ClipboardList, BarChart3, Settings } from "lucide-react"

const cstNav = [
  { href: "/cst/candidatos", label: "Candidatos", icon: Users },
  { href: "/cst/test-competencias", label: "Test Competencias", icon: ClipboardList },
  { href: "/cst/panel-control", label: "Panel de Control", icon: BarChart3 },
  { href: "/cst/configuracion", label: "Configuracion", icon: Settings },
]

interface CstSidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function CstSidebar({ open, onClose, collapsed, onToggleCollapse }: CstSidebarProps) {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumb = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const item = cstNav.find((n) => n.href === href)
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
        } ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/cst" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">CST</span>
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">CST</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">CST</span>
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
                    <span className="text-emerald-600 font-semibold">{seg.label}</span>
                  ) : (
                    <Link href={seg.href} className="hover:text-emerald-600 transition-colors">
                      {seg.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {cstNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
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
