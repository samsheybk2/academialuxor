"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import type { TestPsicologico } from "@/types/test-psicologico"
import { Brain, Clock, FileText, CheckCircle2, Loader2, Pencil } from "lucide-react"
import Link from "next/link"

function TestsContent() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [tests, setTests] = useState<TestPsicologico[]>([])
  const [loading, setLoading] = useState(true)
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTests()
    fetchCompletedTests()
  }, [user?.id])

  async function fetchTests() {
    setLoading(true)
    const { data } = await supabase
      .from("tests_psicologicos")
      .select("*")
      .eq("activo", true)
      .order("nombre")
    
    setTests(data || [])
    setLoading(false)
  }

  async function fetchCompletedTests() {
    if (!user) return
    
    const { data } = await supabase
      .from("respuestas_tests")
      .select("test_id")
      .eq("user_id", user.id)
      .eq("estado", "completado")
    
    if (data) {
      setCompletedTests(new Set(data.map((r: any) => r.test_id)))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-luxor-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tests Psicológicos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Completa los tests asignados para tu evaluación psicológica
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay tests disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Los tests aparecerán aquí cuando estén asignados
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tests.map((test) => {
            const isCompleted = completedTests.has(test.id)
            
            return (
              <Link
                key={test.id}
                href={`/dashboard/tests/${test.id}`}
                className={`group bg-white rounded-xl border p-6 transition-all ${
                  isCompleted
                    ? "border-green-200 bg-green-50/30"
                    : "border-gray-200 hover:border-luxor-primary/40 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-green-100" : test.tipo === "proyectivo" ? "bg-purple-100" : "bg-luxor-primary/10"
                  }`}>
                    {test.tipo === "proyectivo" ? (
                      <Pencil className={`w-6 h-6 ${
                        isCompleted ? "text-green-600" : "text-purple-600"
                      }`} />
                    ) : (
                      <Brain className={`w-6 h-6 ${
                        isCompleted ? "text-green-600" : "text-luxor-primary"
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-luxor-primary transition-colors">
                        {test.nombre}
                      </h3>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    
                    {test.descripcion && (
                      <p className="text-sm text-gray-500 mb-2">{test.descripcion}</p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {test.tipo === 'cuestionario' ? 'Cuestionario' : 'Proyectivo'}
                      </span>
                      {test.duracion_minutos && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.duracion_minutos} min
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-green-600 font-medium">Completado</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TestsPage() {
  return (
    <ProtectedRoute allowedRoles={["developer"]}>
      <TestsContent />
    </ProtectedRoute>
  )
}
