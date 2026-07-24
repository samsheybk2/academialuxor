"use client"

import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react"
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
  const supabaseRef = useRef(createSupabaseClient())
  const userRef = useRef<UserProfile | null>(null)

  const loadUser = useCallback(async () => {
    try {
      const profile = await getCurrentUser()
      if (JSON.stringify(profile) !== JSON.stringify(userRef.current)) {
        userRef.current = profile
        setUser(profile)
      }
    } catch {
      if (userRef.current !== null) {
        userRef.current = null
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const profile = await getCurrentUser()
    userRef.current = profile
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    userRef.current = null
    setUser(null)
  }, [])

  useEffect(() => {
    loadUser()

    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange(async (event: any) => {
      if (event === "SIGNED_IN") {
        await loadUser()
      } else if (event === "SIGNED_OUT") {
        userRef.current = null
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUser])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
