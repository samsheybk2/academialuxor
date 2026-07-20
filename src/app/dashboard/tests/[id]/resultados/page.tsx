"use client"

import { useState, useEffect, use } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { TestPsicologico, PreguntaTest } from "@/types/test-psicologico"
import { ArrowLeft, Brain, Loader2, CheckCircle2, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"

function ResultadosContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  
  const [test, setTest] = useState<TestPsicologico | null>(null)
  const [preguntas, setPreguntas] = useState<PreguntaTest[]>([])
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResultados()
  }, [resolvedParams.id])

  async function fetchResultados() {
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
        .eq("estado", "completado")
        .single()
      
      if (respuestaExistente) {
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

  const totalPreguntas = preguntas.length
  const preguntasRespondidas = preguntas.filter(p => respuestas[p.id]).length
  const porcentajeCompletado = Math.round((preguntasRespondidas / totalPreguntas) * 100)

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
            <h1 className="text-xl font-bold text-gray-900">Resultados - {test.nombre}</h1>
            <p className="text-sm text-gray-500">Test completado exitosamente</p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-luxor-primary" />
            <span className="text-xs font-medium text-gray-500 uppercase">Progreso</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{porcentajeCompletado}%</p>
          <p className="text-xs text-gray-500 mt-1">{preguntasRespondidas} de {totalPreguntas} preguntas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Estado</span>
          </div>
          <p className="text-2xl font-bold text-green-600">Completado</p>
          <p className="text-xs text-gray-500 mt-1">Todas las respuestas guardadas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500 uppercase">Tipo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{test.tipo}</p>
          <p className="text-xs text-gray-500 mt-1">{test.duracion_minutos} min estimados</p>
        </div>
      </div>

      {/* Respuestas detalladas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tus respuestas</h2>
        
        <div className="space-y-4">
          {preguntas.map((pregunta, index) => {
            const respuesta = respuestas[pregunta.id] || "Sin respuesta"
            const opciones = pregunta.opciones || []
            const indiceRespuesta = opciones.indexOf(respuesta)
            
            return (
              <div key={pregunta.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-luxor-primary/10 text-luxor-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="font-medium text-gray-900 text-sm">{pregunta.texto}</p>
                </div>
                
                <div className="ml-9">
                  {pregunta.tipo_respuesta === "dibujo" && respuesta && respuesta.startsWith("data:") ? (
              <div className="ml-9">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white inline-block">
                  <img 
                    src={respuesta} 
                    alt="Dibujo del test" 
                    className="max-w-full"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              </div>
            ) : pregunta.tipo_respuesta === "escala" && opciones.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-luxor-primary">{respuesta}</span>
                      </div>
                      {/* Barra visual de escala */}
                      <div className="flex gap-1 mt-2">
                        {opciones.map((op, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-2 rounded-full transition-all ${
                              i === indiceRespuesta
                                ? "bg-luxor-primary"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>{opciones[0]}</span>
                        <span>{opciones[opciones.length - 1]}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{respuesta}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Nota importante</h3>
        <p className="text-sm text-blue-800">
          Los resultados de este test serán revisados por un profesional de psicología. 
          Recibirás una interpretación detallada una vez que el especialista complete el análisis.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link
          href="/dashboard/tests"
          className="px-6 py-2.5 bg-luxor-primary text-white rounded-lg font-medium hover:bg-luxor-secondary transition-colors"
        >
          Volver a Tests
        </Link>
      </div>
    </div>
  )
}

export default function ResultadosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute allowedRoles={["developer"]}>
      <ResultadosContent params={params} />
    </ProtectedRoute>
  )
}
