import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const CLEANUP_SECRET = process.env.CLEANUP_SECRET || "luxor-cleanup-2026"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${CLEANUP_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data: pubs, error: fetchError } = await supabase
      .from("publicaciones")
      .select("id, imagen_url")
      .not("imagen_url", "is", null)
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!pubs || pubs.length === 0) {
      return NextResponse.json({ message: "No hay imágenes antiguas para limpiar", deleted: 0 })
    }

    let deleted = 0
    for (const pub of pubs) {
      const urlParts = pub.imagen_url!.split("/publicaciones/")
      if (urlParts.length < 2) continue
      const storagePath = urlParts[1].split("?")[0]

      await supabase.storage.from("publicaciones").remove([storagePath])
      await supabase.from("publicaciones").update({ imagen_url: null }).eq("id", pub.id)
      deleted++
    }

    return NextResponse.json({ message: `Limpieza completada: ${deleted} imágenes eliminadas`, deleted })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${CLEANUP_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { count } = await supabase
    .from("publicaciones")
    .select("id", { count: "exact", head: true })
    .not("imagen_url", "is", null)
    .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  return NextResponse.json({ pendingCleanup: count || 0 })
}
