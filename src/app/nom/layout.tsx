"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { NomSidebar } from "@/components/nom/NomSidebar"
import { NomHeader } from "@/components/nom/NomHeader"
import { NomMobileNav } from "@/components/nom/NomMobileNav"
import { LoadingBar } from "@/components/ui/LoadingBar"

export default function NomLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
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

  if (!user) return null

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <LoadingBar />
      <NomSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
      <NomHeader onMenuClick={() => setSidebarOpen(true)} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-[#F0F2F5] sm:px-6 mt-14 mb-16 lg:mb-0">
        {children}
      </main>
      <NomMobileNav />
    </div>
  )
}
