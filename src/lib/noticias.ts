import { createSupabaseClient } from "@/lib/supabase"

// Imagen por defecto para noticias de niveles
const NIVEL_IMAGEN_URL = "https://abunpdglbgmoauqwihzk.supabase.co/storage/v1/object/public/configuraciones/nivel-default.png"

export async function crearNoticiaSistema(
  contenido: string,
  autorId: string,
  imagenUrl?: string,
  tipo?: "insignia" | "nivel" | "curso"
) {
  const supabase = createSupabaseClient()

  const { error } = await supabase.from("publicaciones").insert({
    autor_id: autorId,
    contenido,
    imagen_url: imagenUrl || null,
    tipo: tipo || null,
    es_sistema: true,
  })

  if (error) {
    console.error("Error al crear noticia del sistema:", error)
  }

  return { error }
}

export function crearNoticiaNivel(
  contenido: string,
  autorId: string
) {
  return crearNoticiaSistema(contenido, autorId, NIVEL_IMAGEN_URL, "nivel")
}

export function crearNoticiaInsignia(
  contenido: string,
  autorId: string,
  imagenUrl?: string
) {
  return crearNoticiaSistema(contenido, autorId, imagenUrl, "insignia")
}

export function crearNoticiaCurso(
  contenido: string,
  autorId: string
) {
  return crearNoticiaSistema(contenido, autorId, undefined, "curso")
}
