"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, ClipboardList, BarChart3, Settings, MoreVertical, X } from "lucide-react"
import { useState } from "react"

const cstNav = [
  { href: "/cst/candidatos", label: "Candidatos", icon: Users },
  { href: "/cst/test-competencias", label: "Tests", icon: ClipboardList },
  { href: "/cst/panel-control", label: "Panel", icon: BarChart3 },
  { href: "/cst/configuracion", label: "Config", icon: Settings },
]

export function CstMobileNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const visibleItems = cstNav.slice(0, 4)

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
        </div>
      </nav>
    </>
  )
}
