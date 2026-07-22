"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Upload, Trash2, Image, Settings, Loader2, CheckCircle2 } from "lucide-react"

interface Configuracion {
  id: string
  clave: string
  valor: string
}

export default function ConfiguracionesPage() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()

  const [logoNav, setLogoNav] = useState<string>("")
  const [logoLogin, setLogoLogin] = useState<string>("")
  const [favicon, setFavicon] = useState<string>("")
  const [fondosLogin, setFondosLogin] = useState<string[]>([])

  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from("configuraciones")
        .select("clave, valor")
        .in("clave", ["logo_nav", "logo_login", "favicon", "fondos_login"])

      if (data) {
        const config = data.reduce((acc: Record<string, string>, item: Configuracion) => {
          acc[item.clave] = item.valor
          return acc
        }, {})

        setLogoNav(config.logo_nav || "")
        setLogoLogin(config.logo_login || "")
        setFavicon(config.favicon || "")
        setFondosLogin(config.fondos_login ? JSON.parse(config.fondos_login) : [])
      }
    }
    fetchConfig()
  }, [])

  // Validar si las imágenes existen al cargar
  useEffect(() => {
    if (fondosLogin.length === 0) return

    async function validateFondos() {
      const fondosValidos: string[] = []

      for (const url of fondosLogin) {
        try {
          const response = await fetch(url, { method: "HEAD" })
          if (response.ok) {
            fondosValidos.push(url)
          }
        } catch {
          // Imagen no existe, no la agregamos
        }
      }

      if (fondosValidos.length !== fondosLogin.length) {
        setFondosLogin(fondosValidos)
        await supabase
          .from("configuraciones")
          .upsert({ clave: "fondos_login", valor: JSON.stringify(fondosValidos) })
      }
    }

    validateFondos()
  }, [])

  async function handleUpload(
    clave: string,
    file: File,
    setter: (url: string) => void
  ) {
    if (!file) return
    setUploading(clave)

    try {
      const fileName = `${clave}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("configuraciones")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("configuraciones").getPublicUrl(fileName)

      setter(data.publicUrl)

      await supabase
        .from("configuraciones")
        .upsert({ clave, valor: data.publicUrl })

      showSuccess("Imagen actualizada exitosamente. Los cambios ya están aplicados.")
    } catch (error) {
      console.error(error)
      alert("Error al subir el archivo")
    } finally {
      setUploading(null)
    }
  }

  async function handleFondosUpload(files: FileList | null) {
    if (!files) return
    setUploading("fondos")

    try {
      const nuevasUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Convertir a WebP usando Canvas
        const webpBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")
            if (!ctx) {
              reject(new Error("No se pudo obtener contexto 2D"))
              return
            }
            ctx.drawImage(img, 0, 0)
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Error al convertir a WebP"))
              },
              "image/webp",
              0.85
            )
          }
          img.onerror = () => reject(new Error("Error al cargar la imagen"))
          img.src = URL.createObjectURL(file)
        })

        const fileName = `fondos_login/${Date.now()}_${i}.webp`

        const { error } = await supabase.storage
          .from("configuraciones")
          .upload(fileName, webpBlob, { contentType: "image/webp" })

        if (error) throw error

        const { data } = supabase.storage.from("configuraciones").getPublicUrl(fileName)
        nuevasUrls.push(data.publicUrl)
      }

      const todosFondos = [...fondosLogin, ...nuevasUrls]
      setFondosLogin(todosFondos)

      await supabase
        .from("configuraciones")
        .upsert({ clave: "fondos_login", valor: JSON.stringify(todosFondos) })

      showSuccess(`¡${nuevasUrls.length} imagen(es) subida(s) exitosamente! Los fondos ya están disponibles en el login.`)
    } catch (error) {
      console.error(error)
      alert("Error al subir las imágenes")
    } finally {
      setUploading(null)
    }
  }

  const removeFondo = async (index: number) => {
    const nuevosFondos = fondosLogin.filter((_, i) => i !== index)
    setFondosLogin(nuevosFondos)

    await supabase
      .from("configuraciones")
      .upsert({ clave: "fondos_login", valor: JSON.stringify(nuevosFondos) })

    showSuccess("Imagen eliminada. Los cambios ya están aplicados en el login.")
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Validar si las imágenes existen al cargar
  useEffect(() => {
    async function validateFondos() {
      if (fondosLogin.length === 0) return

      const fondosValidos: string[] = []

      for (const url of fondosLogin) {
        try {
          const response = await fetch(url, { method: "HEAD" })
          if (response.ok) {
            fondosValidos.push(url)
          }
        } catch {
          // Imagen no existe, no la agregamos
        }
      }

      if (fondosValidos.length !== fondosLogin.length) {
        setFondosLogin(fondosValidos)
        await supabase
          .from("configuraciones")
          .upsert({ clave: "fondos_login", valor: JSON.stringify(fondosValidos) })
      }
    }

    validateFondos()
  }, [fondosLogin])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuraciones</h1>
        <p className="text-gray-500 mt-1">
          Personaliza la apariencia de la plataforma
        </p>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-luxor-primary" />
          Branding
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Logo Navegación */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Logo Navegación
            </label>
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {logoNav ? (
                <img src={logoNav} alt="Logo Nav" className="w-full h-full object-contain p-2" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-luxor-primary text-white rounded-lg cursor-pointer hover:bg-luxor-secondary transition-colors text-sm font-medium">
              {uploading === "logo_nav" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Subir Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload("logo_nav", file, setLogoNav)
                }}
              />
            </label>
          </div>

          {/* Logo Login */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Logo Login
            </label>
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {logoLogin ? (
                <img src={logoLogin} alt="Logo Login" className="w-full h-full object-contain p-2" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-luxor-primary text-white rounded-lg cursor-pointer hover:bg-luxor-secondary transition-colors text-sm font-medium">
              {uploading === "logo_login" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Subir Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload("logo_login", file, setLogoLogin)
                }}
              />
            </label>
          </div>

          {/* Favicon */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Favicon
            </label>
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {favicon ? (
                <img src={favicon} alt="Favicon" className="w-full h-full object-contain p-2" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-luxor-primary text-white rounded-lg cursor-pointer hover:bg-luxor-secondary transition-colors text-sm font-medium">
              {uploading === "favicon" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Subir Favicon
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload("favicon", file, setFavicon)
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Fondos Login */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Image className="w-5 h-5 text-luxor-primary" />
          Fondos del Login
        </h2>
        <p className="text-sm text-gray-500">
          Imágenes que aparecen en el slideshow del fondo del login. Se muestran en orden.
        </p>

        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-luxor-primary/50 hover:bg-gray-50 transition-colors">
          {uploading === "fondos" ? (
            <Loader2 className="w-5 h-5 text-luxor-primary animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {uploading === "fondos" ? "Subiendo..." : "Agregar imágenes de fondo"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFondosUpload(e.target.files)}
          />
        </label>

        {fondosLogin.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fondosLogin.map((url, index) => (
              <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={`Fondo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFondo(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
