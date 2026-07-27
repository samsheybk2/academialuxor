"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import {
  Search,
  Send,
  Check,
  CheckCheck,
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Video,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Chat {
  id: string
  usuario1_id: string
  usuario2_id: string
  ultimo_mensaje: string | null
  ultimo_mensaje_at: string | null
  created_at: string
  otro_usuario: {
    id: string
    nombre: string
    avatar_url: string | null
    rol: string
  }
  no_leidos: number
}

interface Mensaje {
  id: string
  chat_id: string
  emisor_id: string
  contenido: string
  leido: boolean
  created_at: string
}

interface Usuario {
  id: string
  nombre: string
  avatar_url: string | null
  rol: string
  email: string
}

function ChatContent() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [chats, setChats] = useState<Chat[]>([])
  const [chatActivo, setChatActivo] = useState<Chat | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [mostrarBusqueda, setShowBusqueda] = useState(false)
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([])
  const [busquedaUsuario, setBusquedaUsuario] = useState("")

  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes, scrollToBottom])

  useEffect(() => {
    if (chatActivo) {
      inputRef.current?.focus()
    }
  }, [chatActivo])

  const fetchChats = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: chatsData } = await supabase
      .from("chats")
      .select("*")
      .or(`usuario1_id.eq.${user.id},usuario2_id.eq.${user.id}`)
      .order("ultimo_mensaje_at", { ascending: false, nullsFirst: false })

    if (chatsData) {
      const chatsEnriquecidos: Chat[] = await Promise.all(
        chatsData.map(async (chat: any) => {
          const otroId = chat.usuario1_id === user.id ? chat.usuario2_id : chat.usuario1_id
          const { data: otroUsuario } = await supabase
            .from("profiles")
            .select("id, nombre, avatar_url, rol")
            .eq("id", otroId)
            .single()

          const { data: noLeidos } = await supabase
            .from("mensajes")
            .select("id", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .eq("leido", false)
            .neq("emisor_id", user.id)

          return {
            ...chat,
            otro_usuario: otroUsuario || { id: otroId, nombre: "Usuario", avatar_url: null, rol: "estudiante" },
            no_leidos: noLeidos || 0,
          }
        })
      )
      setChats(chatsEnriquecidos)
    }
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const fetchMensajes = useCallback(async (chatId: string) => {
    setLoadingMensajes(true)
    const { data } = await supabase
      .from("mensajes")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (data) {
      setMensajes(data)
      // Marcar como leídos
      const noLeidos = data.filter((m: any) => !m.leido && m.emisor_id !== user?.id)
      if (noLeidos.length > 0) {
        await supabase
          .from("mensajes")
          .update({ leido: true })
          .in("id", noLeidos.map((m: any) => m.id))
        fetchChats()
      }
    }
    setLoadingMensajes(false)
  }, [user, supabase, fetchChats])

  useEffect(() => {
    if (chatActivo) {
      fetchMensajes(chatActivo.id)
    }
  }, [chatActivo, fetchMensajes])

  const fetchUsuarios = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from("profiles")
      .select("id, nombre, avatar_url, rol, email")
      .neq("id", user.id)
      .order("nombre")
    setUsuariosDisponibles(data || [])
  }, [user, supabase])

  useEffect(() => {
    if (mostrarBusqueda) {
      fetchUsuarios()
    }
  }, [mostrarBusqueda, fetchUsuarios])

  async function iniciarChat(otroUsuario: Usuario) {
    if (!user) return

    // Verificar si ya existe un chat
    const { data: chatExistente } = await supabase
      .from("chats")
      .select("*")
      .or(`and(usuario1_id.eq.${user.id},usuario2_id.eq.${otroUsuario.id}),and(usuario1_id.eq.${otroUsuario.id},usuario2_id.eq.${user.id})`)
      .single()

    if (chatExistente) {
      const chat: Chat = {
        ...chatExistente,
        otro_usuario: otroUsuario,
        no_leidos: 0,
      }
      setChatActivo(chat)
      setShowBusqueda(false)
      setBusquedaUsuario("")
      return
    }

    // Crear nuevo chat
    const { data: nuevoChat } = await supabase
      .from("chats")
      .insert({
        usuario1_id: user.id,
        usuario2_id: otroUsuario.id,
      })
      .select("*")
      .single()

    if (nuevoChat) {
      const chat: Chat = {
        ...nuevoChat,
        otro_usuario: otroUsuario,
        no_leidos: 0,
      }
      setChatActivo(chat)
      setShowBusqueda(false)
      setBusquedaUsuario("")
      fetchChats()
    }
  }

  async function enviarMensaje() {
    if (!nuevoMensaje.trim() || !chatActivo || !user) return

    setEnviando(true)
    const contenido = nuevoMensaje.trim()
    setNuevoMensaje("")

    const { data: mensaje } = await supabase
      .from("mensajes")
      .insert({
        chat_id: chatActivo.id,
        emisor_id: user.id,
        contenido,
      })
      .select("*")
      .single()

    if (mensaje) {
      setMensajes((prev) => [...prev, mensaje])
      await supabase
        .from("chats")
        .update({
          ultimo_mensaje: contenido,
          ultimo_mensaje_at: new Date().toISOString(),
        })
        .eq("id", chatActivo.id)
      fetchChats()
    }
    setEnviando(false)
  }

  function formatHora(fecha: string) {
    return new Date(fecha).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatFecha(fecha: string) {
    const hoy = new Date()
    const fechaMsg = new Date(fecha)
    const diffDias = Math.floor((hoy.getTime() - fechaMsg.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDias === 0) return formatHora(fecha)
    if (diffDias === 1) return "Ayer"
    if (diffDias < 7) return fechaMsg.toLocaleDateString("es-VE", { weekday: "short" })
    return fechaMsg.toLocaleDateString("es-VE", { day: "numeric", month: "short" })
  }

  const usuariosFiltrados = usuariosDisponibles.filter((u) =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())
  )

  const chatsFiltrados = chats.filter((c) =>
    c.otro_usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="h-dvh flex bg-white overflow-hidden">
      {/* Sidebar - Lista de chats */}
      <div className={`${chatActivo ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-gray-200 bg-gray-50`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Menú"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-900">Chats</h2>
            </div>
            <button
              onClick={() => setShowBusqueda(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Nuevo chat"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar chat..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
            />
          </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
            </div>
          ) : chatsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay chats aún</p>
              <p className="text-xs mt-1">Inicia una conversación</p>
            </div>
          ) : (
            chatsFiltrados.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setChatActivo(chat)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                  chatActivo?.id === chat.id ? "bg-luxor-primary/5 border-l-4 border-l-luxor-primary" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {chat.otro_usuario.avatar_url ? (
                      <img src={chat.otro_usuario.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      chat.otro_usuario.nombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  {chat.no_leidos > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-luxor-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {chat.no_leidos}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm text-gray-900 truncate">{chat.otro_usuario.nombre}</p>
                    {chat.ultimo_mensaje_at && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatFecha(chat.ultimo_mensaje_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.ultimo_mensaje || "Sin mensajes"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área de mensajes */}
      {chatActivo ? (
        <div className="flex-1 flex flex-col min-w-0 h-dvh">
          {/* Header del chat */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white shrink-0">
            <button
              onClick={() => setChatActivo(null)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Menú"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
              {chatActivo.otro_usuario.avatar_url ? (
                <img src={chatActivo.otro_usuario.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                chatActivo.otro_usuario.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{chatActivo.otro_usuario.nombre}</h3>
              <p className="text-xs text-gray-500 capitalize">{chatActivo.otro_usuario.rol}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingMensajes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-luxor-primary animate-spin" />
              </div>
            ) : mensajes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Inicia la conversación</p>
                <p className="text-xs mt-1">Envía el primer mensaje</p>
              </div>
            ) : (
              mensajes.map((msg) => {
                const esPropio = msg.emisor_id === user?.id
                return (
                  <div key={msg.id} className={`flex ${esPropio ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${esPropio ? "order-2" : ""}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          esPropio
                            ? "bg-luxor-primary text-white rounded-br-md"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.contenido}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${esPropio ? "justify-end" : ""}`}>
                        <span className="text-xs text-gray-400">{formatHora(msg.created_at)}</span>
                        {esPropio && (
                          msg.leido ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-gray-400" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    enviarMensaje()
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
              />
              <button
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim() || enviando}
                className="p-2.5 rounded-full bg-luxor-primary text-white hover:bg-luxor-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Selecciona un chat</p>
            <p className="text-sm mt-1">O inicia una nueva conversación</p>
          </div>
        </div>
      )}

      {/* Modal de búsqueda de usuarios */}
      {mostrarBusqueda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBusqueda(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nuevo Chat</h3>
              <button onClick={() => setShowBusqueda(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No se encontraron usuarios</p>
                </div>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => iniciarChat(usuario)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxor-primary to-luxor-secondary flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {usuario.avatar_url ? (
                        <img src={usuario.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        usuario.nombre.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-900 truncate">{usuario.nombre}</p>
                      <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute allowedRoles={["decano", "developer", "facilitador", "estudiante"]}>
      <ChatContent />
    </ProtectedRoute>
  )
}
