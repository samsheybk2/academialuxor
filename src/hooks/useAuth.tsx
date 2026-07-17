"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { UserProfile } from "@/types"
import { getCurrentUser, signOut } from "@/lib/auth"
import { createSupabaseClient } from "@/lib/supabase"

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  async function loadUser() {
    try {
      const profile = await getCurrentUser()
      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshUser() {
    const profile = await getCurrentUser()
    setUser(profile)
  }

  async function logout() {
    await signOut()
    setUser(null)
  }

  useEffect(() => {
    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        await loadUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
