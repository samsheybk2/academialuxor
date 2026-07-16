"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import { FloatingCalendar } from "@/components/ui/FloatingCalendar"
import { LoadingBar } from "@/components/ui/LoadingBar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.aprobado === false && user.rol === "estudiante") {
        router.push("/pendiente-aprobacion")
      }
    }
  }, [user, loading, router])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingBar />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      <MobileNav />
      <FloatingCalendar />
    </div>
  )
}
