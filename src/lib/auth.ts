"use client"

import { createSupabaseClient } from "./supabase"
import type { UserProfile, Rol } from "@/types"

function getClient() {
  return createSupabaseClient()
}

export async function signIn(email: string, password: string) {
  const supabase = getClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(
  email: string,
  password: string,
  nombre: string,
  cedula: string,
  rol: Rol = "estudiante",
  sucursal?: string,
  cargo?: string
) {
  const supabase = getClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, rol, cedula, sucursal, cargo },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })
  if (error) throw error

  if (data.user) {
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        nombre,
        rol,
        cedula,
        sucursal: sucursal || null,
        cargo: cargo || null,
        aprobado: rol === "decano" || rol === "facilitador" || rol === "developer",
      })
    } catch {}
  }
  return data
}

export interface CedulaData {
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
}

export async function lookupCedula(cedula: string, nacionalidad: string = "V"): Promise<{ data: CedulaData | null; error: string | null }> {
  try {
    const url = `/api/cedula?cedula=${cedula}&nacionalidad=${nacionalidad}`
    const response = await fetch(url)
    const raw = await response.text()

    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      return { data: null, error: "La API no devolvió un JSON válido" }
    }

    if (data.error) {
      return { data: null, error: `Error de API: ${JSON.stringify(data.error)}` }
    }

    if (!data.data) {
      return { data: null, error: "No se encontraron datos para esta cédula" }
    }

    const d = data.data
    const result: CedulaData = {
      primerNombre: d.primer_nombre || "",
      segundoNombre: d.segundo_nombre || "",
      primerApellido: d.primer_apellido || "",
      segundoApellido: d.segundo_apellido || "",
    }

    if (!result.primerNombre && !result.primerApellido) {
      return { data: null, error: "Los campos de nombre están vacíos" }
    }

    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: `Error de red: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function resetPassword(email: string) {
  const supabase = getClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/restablecer-contrasena`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const supabase = getClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function signOut() {
  const supabase = getClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    const meta = user.user_metadata as Record<string, string> | undefined
    const rol = (meta?.rol as Rol) || "estudiante"
    const nombre = meta?.nombre || user.email?.split("@")[0] || "Usuario"
    return {
      id: user.id,
      email: user.email || "",
      nombre,
      rol,
      aprobado: rol !== "estudiante",
      created_at: user.created_at,
    }
  }

  return profile
}

export async function getSession() {
  const supabase = getClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
