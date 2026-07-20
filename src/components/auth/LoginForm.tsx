"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, lookupCedula } from "@/lib/auth"
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  CheckCircle2,
  IdCard,
  MapPin,
} from "lucide-react"

const SUCURSALES = [
  "Oficina Central - C.C. Celtic Center, Maracay",
  "IPSFA Maracay",
  "Santa Rita",
  "La Mora",
  "Las Acacias",
  "Circulo Militar",
  "Villas de Aragua",
  "El Bosque",
  "Naguanagua",
  "San Diego",
  "Tucacas",
  "Barquisimeto",
  "San Juan de Los Morros",
  "La Victoria",
  "Guacara",
  "El Castaño",
]

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombres, setNombres] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [cedula, setCedula] = useState("")
  const [sucursal, setSucursal] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [nameAutoFilled, setNameAutoFilled] = useState(false)
  const [cedulaError, setCedulaError] = useState("")

  function resetSignup() {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setNombres("")
    setApellidos("")
    setCedula("")
    setSucursal("")
    setError("")
    setNameAutoFilled(false)
  }

  async function handleCedulaLookup(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 8)
    setCedula(cleaned)
    setNameAutoFilled(false)
    setCedulaError("")

    if (cleaned.length === 8) {
      setLookingUp(true)
      const result = await lookupCedula(cleaned)
      if (result.data) {
        const nombresStr = [result.data.primerNombre, result.data.segundoNombre].filter(Boolean).join(" ")
        const apellidosStr = [result.data.primerApellido, result.data.segundoApellido].filter(Boolean).join(" ")
        setNombres(nombresStr)
        setApellidos(apellidosStr)
        setNameAutoFilled(true)
        setCedulaError("")
      } else if (result.error) {
        setCedulaError(result.error)
        setNombres("")
        setNameAutoFilled(false)
      }
      setLookingUp(false)
    } else {
      setNombres("")
      setNameAutoFilled(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    setError("")
    try {
      await signIn(email, password)
      router.push("/dashboard/noticias")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!cedula || cedula.length !== 8) {
      setError("Ingrese una cédula válida de 8 dígitos")
      setLoading(false)
      return
    }

    if (!nombres.trim()) {
      setError("El nombre es requerido")
      setLoading(false)
      return
    }

    if (!apellidos.trim()) {
      setError("Los apellidos son requeridos")
      setLoading(false)
      return
    }

    if (!sucursal) {
      setError("Seleccione una sucursal")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`

    try {
      await signUp(
        email,
        password,
        nombreCompleto,
        cedula,
        "estudiante",
        sucursal
      )
      setEmailSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Correo Enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de confirmación a{" "}
              <span className="font-semibold text-gray-900">{email}</span>.
              Por favor revisa tu bandeja de entrada y haz clic en el enlace
              para activar tu cuenta.
            </p>
            <button
              onClick={() => {
                setEmailSent(false)
                setMode("login")
                resetSignup()
              }}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => {
              setMode("login")
              setError("")
              resetSignup()
            }}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              mode === "login"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setMode("signup")
              setError("")
            }}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              mode === "signup"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/recuperar-contrasena")}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cédula
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => handleCedulaLookup(e.target.value)}
                  placeholder="Ej: 12345678"
                  maxLength={8}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                />
                {lookingUp && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                )}
                {!lookingUp && nameAutoFilled && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {cedulaError && (
                <p className="text-xs text-red-600 mt-1">{cedulaError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Nombres"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400 ${
                      nameAutoFilled
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300"
                    }`}
                  />
                  {nameAutoFilled && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-green-600 font-medium">
                      Auto
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 bg-white"
                >
                  <option value="">Seleccionar sucursal</option>
                  {SUCURSALES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                Acepto los{" "}
                <span className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                  términos y condiciones
                </span>{" "}
                de la Academia LUXOR
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
