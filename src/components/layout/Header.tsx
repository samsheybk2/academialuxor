"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import { LogOut, Users, BookOpen, Route, Calendar, Bell, Check, Clock, ArrowLeft, Newspaper, Network, Brain } from "lucide-react"
import Link from "next/link"

const navByRole = {
  decano: [
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Gestionar Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  developer: [
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Gestionar Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/tests", label: "Tests", icon: Brain },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  facilitador: [
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/cursos", label: "Mis Cursos", icon: BookOpen },
    { href: "/dashboard/rutas-aprendizaje", label: "Rutas de Aprendizaje", icon: Route },
    { href: "/dashboard/organigrama", label: "Organigrama", icon: Network },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
  estudiante: [
    { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
    { href: "/dashboard/rutas-aprendizaje", label: "Mi Ruta", icon: Route },
    { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  ],
}

function TooltipIcon({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <Link
      href={href}
      prefetch={true}
      className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
        isActive ? "bg-luxor-primary shadow-md shadow-luxor-primary/25" : "hover:bg-gray-100"
      }`}>
        <Icon
          className={`w-6 h-6 transition-colors ${
            isActive ? "text-white" : "text-gray-500"
          }`}
        />
      </div>
      {isActive && (
        <div className="absolute -bottom-2 w-1.5 h-1.5 bg-luxor-primary rounded-full" />
      )}
      {show && (
        <div className="absolute top-full mt-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
          {label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </Link>
  )
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const nav = user ? navByRole[user.rol] : []
  const bellRef = useRef<HTMLDivElement>(null)
  const [showNotif, setShowNotif] = useState(false)
  const [showBirthdayModal, setShowBirthdayModal] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Array<{
    id: string; titulo: string; mensaje: string; fecha: string; leido: boolean; tipo: string
  }>>([])

  const notifCount = notificaciones.filter((n) => !n.leido).length

  const markAllRead = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })))
  }

  useEffect(() => {
    if (!user) return
    const supabase = (async () => {
      const { createSupabaseClient } = await import("@/lib/supabase")
      return createSupabaseClient()
    })()

    const fetchNotifs = async () => {
      const s = await supabase
      const { data } = await s
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
      setNotificaciones((data || []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        titulo: n.titulo as string,
        mensaje: n.mensaje as string,
        fecha: new Date(n.created_at as string).toLocaleDateString("es-VE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        leido: n.leido as boolean,
        tipo: n.tipo as string,
      })))
    }
    fetchNotifs()
  }, [user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const isBirthday = (() => {
    if (!user?.fecha_nacimiento) return false
    const today = new Date()
    const bd = new Date(user.fecha_nacimiento + "T12:00:00")
    return bd.getUTCMonth() === today.getMonth() && bd.getUTCDate() === today.getDate()
  })()

  return (
    <>
      {isBirthday && (
        <button
          onClick={() => setShowBirthdayModal(true)}
          className="sticky top-0 z-40 w-full bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 text-white text-center py-2 px-4 text-sm font-semibold shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          ¡{user?.nombre}! Supermercados Luxor te desea un Feliz Cumpleaños. Toca aquí!
        </button>
      )}

      {showBirthdayModal && isBirthday && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowBirthdayModal(false)}>
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-pink-400 to-purple-500 opacity-10" />

            <div className="relative flex flex-col items-center p-8 pb-6">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-400 via-pink-400 to-purple-500 rounded-t-3xl overflow-hidden">
                {/* Confetti */}
                <div className="absolute top-2 left-[10%] w-2 h-2 bg-yellow-300 rounded-sm rotate-45 animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="absolute top-3 left-[25%] w-1.5 h-2.5 bg-pink-300 rounded-sm rotate-12 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="absolute top-1 left-[40%] w-2.5 h-1.5 bg-white rounded-sm -rotate-30 animate-bounce" style={{ animationDelay: "0.4s" }} />
                <div className="absolute top-4 left-[55%] w-2 h-2 bg-purple-300 rounded-sm rotate-[60deg] animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="absolute top-2 left-[70%] w-1.5 h-2.5 bg-amber-200 rounded-sm rotate-[-20deg] animate-bounce" style={{ animationDelay: "0.3s" }} />
                <div className="absolute top-3 left-[85%] w-2 h-2 bg-pink-200 rounded-sm rotate-[45deg] animate-bounce" style={{ animationDelay: "0.5s" }} />
                <div className="absolute top-5 left-[15%] w-2 h-1.5 bg-purple-200 rounded-sm rotate-[80deg] animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="absolute top-3 left-[60%] w-1.5 h-1.5 bg-yellow-200 rounded-sm rotate-[30deg] animate-bounce" style={{ animationDelay: "0.35s" }} />
                <div className="absolute top-4 left-[48%] w-2 h-2.5 bg-white/70 rounded-sm rotate-[50deg] animate-bounce" style={{ animationDelay: "0.25s" }} />
                <div className="absolute top-1 left-[78%] w-2.5 h-2 bg-pink-400/60 rounded-sm rotate-[-40deg] animate-bounce" style={{ animationDelay: "0.45s" }} />

                {/* Balloons - centered vertically */}
                <svg className="absolute top-1/2 -translate-y-[55%] left-[5%] w-7 h-10 animate-[float_3s_ease-in-out_infinite]" viewBox="0 0 40 56" fill="none">
                  <ellipse cx="20" cy="20" rx="14" ry="18" fill="#F9A8D4" />
                  <ellipse cx="20" cy="16" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M20 38 L18 52 L22 52 Z" fill="#F9A8D4" />
                  <line x1="20" y1="38" x2="20" y2="55" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-1/2 -translate-y-[55%] left-[18%] w-8 h-11 animate-[float_3.5s_ease-in-out_infinite_0.3s]" viewBox="0 0 44 64" fill="none">
                  <ellipse cx="22" cy="22" rx="15" ry="20" fill="#FCD34D" />
                  <ellipse cx="22" cy="18" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M22 42 L20 58 L24 58 Z" fill="#FCD34D" />
                  <line x1="22" y1="42" x2="22" y2="62" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-1/2 -translate-y-[55%] left-[33%] w-7 h-10 animate-[float_4s_ease-in-out_infinite_0.8s]" viewBox="0 0 40 56" fill="none">
                  <ellipse cx="20" cy="20" rx="14" ry="18" fill="#C4B5FD" />
                  <ellipse cx="20" cy="16" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M20 38 L18 52 L22 52 Z" fill="#C4B5FD" />
                  <line x1="20" y1="38" x2="20" y2="55" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-1/2 -translate-y-[55%] right-[33%] w-8 h-11 animate-[float_3.2s_ease-in-out_infinite_0.5s]" viewBox="0 0 44 64" fill="none">
                  <ellipse cx="22" cy="22" rx="15" ry="20" fill="#6EE7B7" />
                  <ellipse cx="22" cy="18" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M22 42 L20 58 L24 58 Z" fill="#6EE7B7" />
                  <line x1="22" y1="42" x2="22" y2="62" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-1/2 -translate-y-[55%] right-[18%] w-7 h-10 animate-[float_3.8s_ease-in-out_infinite_1.2s]" viewBox="0 0 40 56" fill="none">
                  <ellipse cx="20" cy="20" rx="14" ry="18" fill="#FDA4AF" />
                  <ellipse cx="20" cy="16" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M20 38 L18 52 L22 52 Z" fill="#FDA4AF" />
                  <line x1="20" y1="38" x2="20" y2="55" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-1/2 -translate-y-[55%] right-[5%] w-8 h-11 animate-[float_3.3s_ease-in-out_infinite_0.6s]" viewBox="0 0 44 64" fill="none">
                  <ellipse cx="22" cy="22" rx="15" ry="20" fill="#FDE68A" />
                  <ellipse cx="22" cy="18" rx="5" ry="4" fill="white" opacity="0.3" />
                  <path d="M22 42 L20 58 L24 58 Z" fill="#FDE68A" />
                  <line x1="22" y1="42" x2="22" y2="62" stroke="#D1D5DB" strokeWidth="0.5" />
                </svg>
              </div>

              <div className="relative mt-8 mb-3">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nombre}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-luxor-primary/10 border-4 border-white shadow-xl flex items-center justify-center">
                    <span className="text-luxor-primary font-bold text-4xl">
                      {user?.nombre?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="relative text-xl font-bold text-gray-900 text-center">
                ¡Feliz Cumpleaños!
              </h2>

              <div className="relative mt-3 text-gray-500 text-sm leading-relaxed text-justify w-full max-w-sm space-y-2">
                <p>
                  Estimado(a) <span className="font-semibold text-gray-700">{user?.nombre}</span>,
                </p>
                <p>
                  En tu día queremos desearte todo lo bonito que la vida puede ofrecer. Que este nuevo año venga lleno de salud, amor, paz y grandes oportunidades.
                </p>
                <p>
                  Que cada paso que des esté lleno de sabiduría y alegría, y que nunca te falte la fuerza para seguir adelante.
                </p>
                <p>
                  Que Dios siga derramando bendiciones sobre tu vida, tu familia y todo lo que emprendas.
                </p>
                <p className="text-right italic text-gray-400">
                  Con cariño,<br />
                  <span className="font-semibold text-gray-600">Supermercados Luxor</span>
                </p>
              </div>

              <button
                onClick={() => setShowBirthdayModal(false)}
                className="relative mt-6 px-8 py-2.5 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all text-sm"
              >
                ¡Gracias!
              </button>
            </div>
          </div>
        </div>
      )}

    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center px-4">
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/dashboard" prefetch={true} className="flex items-center gap-2.5">
          <img
            src="/Academia Luxor.webp"
            alt="Academia Luxor"
            className="w-9 h-9 object-contain"
          />
        </Link>
        {pathname.match(/^\/dashboard\/cursos\/[^/]+$/) && (
          <Link
            href="/dashboard/cursos"
            className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors ml-2 pl-2 border-l border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catalogo
          </Link>
        )}
      </div>

      <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {nav.map((item) => (
          <TooltipIcon
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      <div className="flex items-center gap-3 ml-auto shrink-0">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                {notifCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-luxor-primary hover:underline">Marcar como leido</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Sin notificaciones</p>
                  </div>
                ) : (
                  notificaciones.map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.leido ? "bg-luxor-primary/5" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-full ${n.tipo === "curso_aprobado" ? "bg-green-100" : n.tipo === "curso_rechazado" ? "bg-red-100" : n.tipo === "inscripcion" ? "bg-blue-100" : "bg-gray-100"}`}>
                          {n.tipo === "curso_aprobado" ? <Check className="w-3 h-3 text-green-600" /> : <Clock className="w-3 h-3 text-gray-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.titulo}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.mensaje}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.fecha}</p>
                        </div>
                        {!n.leido && <div className="w-2 h-2 bg-luxor-primary rounded-full shrink-0 mt-2" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <Link href="/dashboard/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.nombre} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-luxor-primary/10 rounded-full flex items-center justify-center">
                <span className="text-luxor-primary font-semibold text-sm">
                  {user?.nombre?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
    </>
  )
}
