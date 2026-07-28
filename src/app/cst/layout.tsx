"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { CstHeader } from "@/components/cst/CstHeader"
import { CstMobileNav } from "@/components/cst/CstMobileNav"
import { LoadingBar } from "@/components/ui/LoadingBar"

export default function CstLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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
      <CstHeader />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-[#F0F2F5] sm:px-6 mt-14 mb-16 lg:mb-0">
        {children}
      </main>
      <CstMobileNav />
    </div>
  )
}
