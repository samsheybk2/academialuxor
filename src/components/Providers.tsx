"use client"

import dynamic from "next/dynamic"

const AuthProvider = dynamic(
  () => import("@/hooks/useAuth").then((mod) => mod.AuthProvider),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
