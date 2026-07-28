"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CstPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/cst/candidatos")
  }, [router])
  return null
}
