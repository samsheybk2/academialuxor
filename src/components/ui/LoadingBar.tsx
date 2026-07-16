"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function LoadingBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
        setPrevPath(pathname)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [pathname, prevPath])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div className="h-full bg-luxor-primary animate-loading-bar" />
    </div>
  )
}
