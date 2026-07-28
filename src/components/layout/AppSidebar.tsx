"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

const apps = [
  { name: "CYD", desc: "Capacitación y Desarrollo", href: "/dashboard", color: "from-blue-500 to-indigo-600", active: true },
  { name: "CST", desc: "Captación y Selección de Talento", href: "/cst", color: "from-emerald-500 to-teal-600", active: true },
  { name: "RRLL", desc: "Relaciones Laborales", href: "/rrll", color: "from-orange-500 to-amber-600", active: false },
  { name: "SSSL", desc: "Seguridad y Salud en el Trabajo", href: "/sssl", color: "from-red-500 to-rose-600", active: false },
  { name: "BTH", desc: "Bienestar y Talento Humano", href: "/bth", color: "from-purple-500 to-violet-600", active: false },
  { name: "NOM", desc: "Nómina y Organización de Meta", href: "/nom", color: "from-slate-600 to-gray-800", active: true },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[99]"
        onClick={onClose}
      />
      <aside className="fixed left-0 top-0 bottom-0 z-[100] w-20 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-between h-14 px-3 border-b border-gray-200">
          <span className="text-xs font-bold text-gray-700">Apps</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
          {apps.map((app) => {
            const isActive = pathname.startsWith(app.href)
            return (
              <Link
                key={app.name}
                href={app.active ? app.href : "#"}
                prefetch={app.active}
                onClick={(e) => {
                  if (!app.active) {
                    e.preventDefault()
                  } else {
                    onClose()
                  }
                }}
                className={`flex flex-col items-center gap-1 px-2 py-3 mx-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-gray-100"
                    : app.active
                    ? "hover:bg-gray-50"
                    : "opacity-50 cursor-not-allowed"
                }`}
                title={app.active ? app.desc : "Próximamente"}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center ${
                    isActive ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                >
                  <span className="text-white font-bold text-xs">{app.name}</span>
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                  {app.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
