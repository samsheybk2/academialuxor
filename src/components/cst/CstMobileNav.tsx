"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Award, BarChart3, Settings, MoreVertical, X, Network, Briefcase } from "lucide-react"
import { useState } from "react"

const cstNav = [
  { href: "/cst/candidatos", label: "Candidatos", icon: Users },
  { href: "/cst/plantilla", label: "Plantilla", icon: Briefcase },
  { href: "/cst/competencias", label: "Competencias", icon: Award },
  { href: "/cst/panel-control", label: "Panel", icon: BarChart3 },
  { href: "/cst/configuracion", label: "Config", icon: Settings },
  { href: "/cst/organigrama", label: "Organigrama", icon: Network },
]

export function CstMobileNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const visibleItems = cstNav.slice(0, 4)
  const hiddenItems = cstNav.slice(4)

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
                className="flex flex-col items-center gap-1 px-2 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  isActive ? "bg-emerald-600 shadow-md shadow-emerald-600/25" : ""
                }`}>
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-gray-500"}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-emerald-700" : "text-gray-500"
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
              <span className="text-[10px] font-medium text-gray-500">Mas</span>
            </button>
          )}
        </div>
      </nav>

      {showMore && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-20 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden lg:hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Mas opciones</span>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
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
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
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
