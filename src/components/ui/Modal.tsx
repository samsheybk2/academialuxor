"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  show: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  hideHeader?: boolean
  size?: "md" | "lg"
}

export function Modal({ show, onClose, title, children, hideHeader, size = "md" }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [render, setRender] = useState(false)

  useEffect(() => {
    if (show) {
      setRender(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const timer = setTimeout(() => setRender(false), 200)
      return () => clearTimeout(timer)
    }
  }, [show])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (show) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [show, onClose])

  if (!render) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ height: '100dvh' }}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: '100dvh' }}
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-xl shadow-xl w-full ${size === "lg" ? "max-w-lg" : "max-w-md"} h-fit overflow-y-auto transition-all duration-200 mt-6 ${
          visible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        )}
        <div className={`px-6 ${hideHeader ? 'pt-2 pb-0' : 'py-4'}`}>{children}</div>
      </div>
    </div>
  )
}
