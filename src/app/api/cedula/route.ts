import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const cedula = req.nextUrl.searchParams.get("cedula")
  const nacionalidad = req.nextUrl.searchParams.get("nacionalidad") || "V"

  if (!cedula || cedula.length < 6) {
    return NextResponse.json({ error: "Cédula inválida" }, { status: 400 })
  }

  const url = `https://api.cedula.com.ve/api/v1?app_id=9172&token=5a33185978a57f0053f7b9e4d148570c&nacionalidad=${nacionalidad}&cedula=${cedula}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const raw = await response.text()

    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: "Respuesta no es JSON", raw }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (err) {
    clearTimeout(timeout)
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
