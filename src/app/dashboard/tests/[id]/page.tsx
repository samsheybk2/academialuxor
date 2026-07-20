"use client"

import { useState, useEffect, useRef, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { TestPsicologico, PreguntaTest } from "@/types/test-psicologico"
import { ArrowLeft, Brain, Loader2, CheckCircle2, BarChart3, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

function CanvasDibujo({ preguntaId, valor, onChange, campoWartegg }: { 
  preguntaId: string
  valor?: string
  onChange: (preguntaId: string, valor: string) => void
  campoWartegg?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const baseFiguresDrawn = useRef(false)

  function drawWarteggFigure(ctx: CanvasRenderingContext2D, campo: number, width: number, height: number) {
    ctx.strokeStyle = "#999"
    ctx.fillStyle = "#999"
    ctx.lineWidth = 2
    ctx.lineCap = "round"

    const cx = width / 2
    const cy = height / 2

    switch (campo) {
      case 1: // Punto en el centro
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fill()
        break

      case 2: // Línea curva pequeña (coma) arriba izquierda
        ctx.beginPath()
        ctx.moveTo(width * 0.3, height * 0.3)
        ctx.quadraticCurveTo(width * 0.35, height * 0.25, width * 0.38, height * 0.32)
        ctx.stroke()
        break

      case 3: // Tres líneas verticales de diferente altura abajo
        ctx.beginPath()
        ctx.moveTo(width * 0.35, height * 0.75)
        ctx.lineTo(width * 0.35, height * 0.6)
        ctx.moveTo(width * 0.45, height * 0.75)
        ctx.lineTo(width * 0.45, height * 0.5)
        ctx.moveTo(width * 0.55, height * 0.75)
        ctx.lineTo(width * 0.55, height * 0.4)
        ctx.stroke()
        break

      case 4: // Cuadrado pequeño arriba derecha
        ctx.fillRect(width * 0.7, height * 0.25, 12, 12)
        break

      case 5: // Dos líneas diagonales formando ángulo abajo izquierda
        ctx.beginPath()
        ctx.moveTo(width * 0.25, height * 0.7)
        ctx.lineTo(width * 0.35, height * 0.8)
        ctx.moveTo(width * 0.3, height * 0.65)
        ctx.lineTo(width * 0.4, height * 0.75)
        ctx.stroke()
        break

      case 6: // Línea horizontal arriba y vertical abajo derecha
        ctx.beginPath()
        ctx.moveTo(width * 0.3, height * 0.35)
        ctx.lineTo(width * 0.5, height * 0.35)
        ctx.moveTo(width * 0.55, height * 0.45)
        ctx.lineTo(width * 0.55, height * 0.6)
        ctx.stroke()
        break

      case 7: // Puntos formando arco abajo derecha
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 0.3) + (i * Math.PI * 0.05)
          const x = width * 0.65 + Math.cos(angle) * 30
          const y = height * 0.7 - Math.sin(angle) * 30
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 8: // Arco grande abajo
        ctx.beginPath()
        ctx.arc(cx, height * 0.85, width * 0.3, Math.PI, 0)
        ctx.stroke()
        break
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth
    canvas.height = 400
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"

    // Dibujar figura base de Wartegg si aplica
    if (campoWartegg && campoWartegg >= 1 && campoWartegg <= 8 && !baseFiguresDrawn.current) {
      // Dibujar número de campo en la esquina superior izquierda
      ctx.fillStyle = "#666"
      ctx.font = "bold 16px sans-serif"
      ctx.fillText(`Campo ${campoWartegg}`, 10, 25)
      
      drawWarteggFigure(ctx, campoWartegg, canvas.width, canvas.height)
      baseFiguresDrawn.current = true
    }
    
    // Cargar imagen existente si hay
    if (valor) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasContent(true)
      }
      img.src = valor
    }
  }, [valor, campoWartegg])

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasContent(true)
  }

  function stopDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    // Guardar como base64
    const dataUrl = canvas.toDataURL("image/png")
    onChange(preguntaId, dataUrl)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
    // Redibujar figura base de Wartegg si aplica
    if (campoWartegg && campoWartegg >= 1 && campoWartegg <= 8) {
      ctx.fillStyle = "#666"
      ctx.font = "bold 16px sans-serif"
      ctx.fillText(`Campo ${campoWartegg}`, 10, 25)
      drawWarteggFigure(ctx, campoWartegg, canvas.width, canvas.height)
    }
    onChange(preguntaId, "")
  }

  return (
    <div className="ml-9 space-y-3">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          style={{ height: "400px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Borrar dibujo
        </button>
        {hasContent && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Dibujo guardado
          </span>
        )}
      </div>
    </div>
  )
}

function TestContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const router = useRouter()
  
  const [test, setTest] = useState<TestPsicologico | null>(null)
  const [preguntas, setPreguntas] = useState<PreguntaTest[]>([])
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [respuestaId, setRespuestaId] = useState<string | null>(null)
  const [testCompletado, setTestCompletado] = useState(false)

  useEffect(() => {
    fetchTest()
  }, [resolvedParams.id])

  async function fetchTest() {
    setLoading(true)
    
    const { data: testData } = await supabase
      .from("tests_psicologicos")
      .select("*")
      .eq("id", resolvedParams.id)
      .single()
    
    setTest(testData)

    const { data: preguntasData } = await supabase
      .from("preguntas_tests")
      .select("*")
      .eq("test_id", resolvedParams.id)
      .order("orden")
    
    setPreguntas(preguntasData || [])

    if (user) {
      const { data: respuestaExistente } = await supabase
        .from("respuestas_tests")
        .select("*")
        .eq("test_id", resolvedParams.id)
        .eq("user_id", user.id)
        .single()
      
      if (respuestaExistente) {
        setRespuestaId(respuestaExistente.id)
        
        if (respuestaExistente.estado === "completado") {
          setTestCompletado(true)
        }
        
        const { data: detalles } = await supabase
          .from("detalles_respuestas")
          .select("*")
          .eq("respuesta_id", respuestaExistente.id)
        
        if (detalles) {
          const respuestasMap: Record<string, string> = {}
          detalles.forEach((d: any) => {
            respuestasMap[d.pregunta_id] = d.valor || ""
          })
          setRespuestas(respuestasMap)
        }
      }
    }

    setLoading(false)
  }

  async function handleRespuestaChange(preguntaId: string, valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }))
  }

  async function handleGuardar() {
    if (!user || !test) return
    
    setSaving(true)

    try {
      let currentRespuestaId = respuestaId

      if (!currentRespuestaId) {
        const { data: nuevaRespuesta } = await supabase
          .from("respuestas_tests")
          .insert({
            test_id: test.id,
            user_id: user.id,
            estado: "en_progreso"
          })
          .select()
          .single()
        
        currentRespuestaId = nuevaRespuesta.id
        setRespuestaId(currentRespuestaId)
      }

      for (const [preguntaId, valor] of Object.entries(respuestas)) {
        const { data: existente } = await supabase
          .from("detalles_respuestas")
          .select("id")
          .eq("respuesta_id", currentRespuestaId)
          .eq("pregunta_id", preguntaId)
          .single()
        
        if (existente) {
          await supabase
            .from("detalles_respuestas")
            .update({ valor })
            .eq("id", existente.id)
        } else {
          await supabase
            .from("detalles_respuestas")
            .insert({
              respuesta_id: currentRespuestaId,
              pregunta_id: preguntaId,
              valor
            })
        }
      }

      const todasRespondidas = preguntas.every(p => respuestas[p.id]?.trim())
      
      if (todasRespondidas) {
        await supabase
          .from("respuestas_tests")
          .update({
            estado: "completado",
            fecha_completado: new Date().toISOString()
          })
          .eq("id", currentRespuestaId)
        
        router.push(`/dashboard/tests/${resolvedParams.id}/resultados`)
      } else {
        alert("Respuestas guardadas. Completa todas las preguntas para finalizar.")
      }
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar las respuestas")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Test no encontrado</p>
      </div>
    )
  }

  if (testCompletado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tests"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.nombre}</h1>
              <p className="text-sm text-green-600 font-medium">Test completado</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Test Completado!</h2>
          <p className="text-gray-600 mb-6">
            Ya has completado este test. Puedes revisar tus respuestas en cualquier momento.
          </p>
          <Link
            href={`/dashboard/tests/${resolvedParams.id}/resultados`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Ver mis respuestas
          </Link>
        </div>
      </div>
    )
  }

  const esProyectivo = test.tipo === "proyectivo"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/tests"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-luxor-primary/10 rounded-xl flex items-center justify-center">
            {esProyectivo ? <Pencil className="w-5 h-5 text-luxor-primary" /> : <Brain className="w-5 h-5 text-luxor-primary" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{test.nombre}</h1>
            {test.duracion_minutos && (
              <p className="text-sm text-gray-500">Duración estimada: {test.duracion_minutos} minutos</p>
            )}
          </div>
        </div>
      </div>

      {test.instrucciones && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-1">Instrucciones</h3>
          <p className="text-sm text-blue-800">{test.instrucciones}</p>
        </div>
      )}

      <div className="space-y-4">
        {preguntas.map((pregunta, index) => (
          <div key={pregunta.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-luxor-primary/10 text-luxor-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <p className="font-medium text-gray-900">{pregunta.texto}</p>
            </div>

            {pregunta.tipo_respuesta === "dibujo" && (
              <CanvasDibujo
                preguntaId={pregunta.id}
                valor={respuestas[pregunta.id]}
                onChange={handleRespuestaChange}
                campoWartegg={test?.nombre === "Wartegg" ? pregunta.orden : undefined}
              />
            )}

            {pregunta.tipo_respuesta === "opcion_multiple" && pregunta.opciones && (
              <div className="space-y-2 ml-9">
                {pregunta.opciones.map((opcion, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      value={opcion}
                      checked={respuestas[pregunta.id] === opcion}
                      onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                      className="w-4 h-4 text-luxor-primary border-gray-300 focus:ring-luxor-primary"
                    />
                    <span className="text-sm text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
            )}

            {pregunta.tipo_respuesta === "escala" && pregunta.opciones && (
              <div className="space-y-2 ml-9">
                {pregunta.opciones.map((opcion, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      value={opcion}
                      checked={respuestas[pregunta.id] === opcion}
                      onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                      className="w-4 h-4 text-luxor-primary border-gray-300 focus:ring-luxor-primary"
                    />
                    <span className="text-sm text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
            )}

            {pregunta.tipo_respuesta === "texto" && (
              <textarea
                value={respuestas[pregunta.id] || ""}
                onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full ml-9 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm"
                rows={4}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link
          href="/dashboard/tests"
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </Link>
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="px-6 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Guardar respuestas
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={["developer"]}>
      <TestContent params={params} />
    </ProtectedRoute>
  )
}
