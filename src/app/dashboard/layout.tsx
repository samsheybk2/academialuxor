"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import { LoadingBar } from "@/components/ui/LoadingBar"
import { setSidebarOpenCallback } from "@/lib/chatEvents"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hideMobileNav = pathname === "/dashboard/chat"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && user) {
      if (user.aprobado === false && user.rol === "estudiante") {
        router.push("/pendiente-aprobacion")
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleOpenSidebar = () => setSidebarOpen(true)
    window.addEventListener("open-sidebar", handleOpenSidebar)
    return () => window.removeEventListener("open-sidebar", handleOpenSidebar)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-luxor-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user && user.aprobado === false && user.rol === "estudiante") {
    return null
  }

  if (!user) return null

  return (
    <div className="h-dvh bg-gray-50 flex flex-col">
      <LoadingBar />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
      {!hideMobileNav && <Header onMenuClick={() => setSidebarOpen(true)} />}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${hideMobileNav ? "bg-white" : "bg-[#F0F2F5] px-6"} ${hideMobileNav ? "mt-0" : "mt-14"} ${hideMobileNav ? "mb-0" : "mb-16 lg:mb-0"}`}>{children}</main>
      {!hideMobileNav && <MobileNav />}
    </div>
  )
}
