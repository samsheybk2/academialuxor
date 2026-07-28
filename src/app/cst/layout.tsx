"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { CstSidebar } from "@/components/cst/CstSidebar"
import { CstHeader } from "@/components/cst/CstHeader"
import { CstMobileNav } from "@/components/cst/CstMobileNav"
import { LoadingBar } from "@/components/ui/LoadingBar"

export default function CstLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
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
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <LoadingBar />
      <CstSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <CstHeader onMenuClick={() => setSidebarOpen(true)} />
      <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-[#F0F2F5] sm:px-6 mt-14 mb-16 lg:mb-0 transition-all duration-300 ${
        collapsed ? "lg:ml-[68px]" : "lg:ml-64"
      }`}>
        {children}
      </main>
      <CstMobileNav />
    </div>
  )
}
