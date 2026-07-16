"use client"

import { useState } from "react"
import type { Pregunta } from "@/lib/cursos-detalle"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react"

interface QuizProps {
  preguntas: Pregunta[]
  onCompletar: (aprobado: boolean, respuestas: { pregunta_id: string; seleccionada: number | null; libre: string | null }[]) => void
}

export function Quiz({ preguntas, onCompletar }: QuizProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [libre, setLibre] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [respuestas, setRespuestas] = useState<(number | null)[]>([])
  const [respuestasLibres, setRespuestasLibres] = useState<(string | null)[]>([])

  const pregunta = preguntas[current]
  const esTextoLibre = pregunta?.tipo === "libre" || pregunta?.tipo === "analisis"

  let totalCorrectas = 0
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i]
    if (p.tipo !== "libre" && respuestas[i] !== undefined && respuestas[i] === p.respuestaCorrecta) {
      totalCorrectas++
    }
    if (p.tipo === "libre" && respuestasLibres[i] !== undefined) {
      totalCorrectas++ // libre responses are always counted and go to facilitator review
    }
  }

  function handleResponder() {
    if (esTextoLibre) {
      if (!libre.trim()) return
      const newRespuestas = [...respuestas]
      const newRespuestasLibres = [...respuestasLibres]
      newRespuestas[current] = null
      newRespuestasLibres[current] = libre.trim()
      setRespuestas(newRespuestas)
      setRespuestasLibres(newRespuestasLibres)
      setShowResult(true)
    } else {
      if (selected === null) return
      const newRespuestas = [...respuestas]
      newRespuestas[current] = selected
      setRespuestas(newRespuestas)
      setShowResult(true)
    }
  }

  function handleSiguiente() {
    setShowResult(false)
    setSelected(null)
    setLibre("")

    if (current < preguntas.length - 1) {
      setCurrent(current + 1)
    } else {
      const correctas = respuestas.reduce<number>((acc, r, i) => {
        if (r !== null && r === preguntas[i]?.respuestaCorrecta) return acc + 1
        return acc
      }, 0)
      const totalEvaluables = preguntas.filter((p) => p.tipo !== "libre" && p.tipo !== "analisis").length
      const aprobado = totalEvaluables === 0 || correctas >= totalEvaluables * 0.7
      const formatted = preguntas.map((p, i) => ({
        pregunta_id: p.id,
        seleccionada: respuestas[i] !== undefined ? respuestas[i] : null,
        libre: respuestasLibres[i] || null,
      }))
      onCompletar(aprobado, formatted)
    }
  }

  if (finalizado) {
    const correctas = respuestas.reduce<number>((acc, r, i) => {
      if (r !== null && r === preguntas[i]?.respuestaCorrecta) return acc + 1
      return acc
    }, 0)
    const totalEval = preguntas.filter((p) => p.tipo !== "libre" && p.tipo !== "analisis").length
    const aprobado = totalEval === 0 || correctas >= totalEval * 0.7

    return (
      <div className="text-center py-8 space-y-4">
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            aprobado ? "bg-blue-100" : "bg-red-100"
          }`}
        >
          {aprobado ? (
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {aprobado ? "¡Módulo Completado!" : "No alcanzaste el puntaje mínimo"}
        </h3>
        <p className="text-gray-500">
          Respondiste correctamente {correctas} de {totalEval} preguntas de selección
        </p>
        {respuestasLibres.some(r => r !== null) && (
          <p className="text-amber-600 text-sm">
            {respuestasLibres.filter(r => r !== null).length} pregunta(s) de respuesta libre enviada(s). El facilitador las revisará.
          </p>
        )}
        {!aprobado && (
          <p className="text-sm text-red-600">
            Necesitas al menos {Math.ceil(totalEval * 0.7)} respuestas correctas (70%)
          </p>
        )}
        {!aprobado && (
          <Button onClick={() => { setCurrent(0); setSelected(null); setLibre(""); setRespuestas([]); setRespuestasLibres([]); setFinalizado(false); setShowResult(false) }}>
            Intentar de Nuevo
          </Button>
        )}
      </div>
    )
  }

  if (!pregunta) {
    return <p className="text-gray-400 text-center py-8">No hay preguntas</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Pregunta {current + 1} de {preguntas.length}
        </span>
        <div className="flex gap-1.5">
          {preguntas.map((p, i) => {
            const isCorrect = p.tipo !== "libre" && respuestas[i] === p.respuestaCorrecta
            const isAnswered = p.tipo === "libre" ? respuestasLibres[i] !== undefined : respuestas[i] !== undefined
            return (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current
                    ? "bg-luxor-primary"
                    : isAnswered
                      ? isCorrect
                        ? "bg-blue-500"
                        : "bg-amber-400"
                      : "bg-gray-200"
                }`}
              />
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-luxor-primary/10 text-luxor-primary rounded text-xs font-medium">
            {pregunta.tipo === "analisis"
              ? "Análisis abierto"
              : pregunta.tipo === "libre"
                ? "Respuesta libre"
                : "Opción múltiple"}
          </span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {pregunta.pregunta}
        </h4>

        {esTextoLibre ? (
          <textarea
            value={libre}
            onChange={(e) => setLibre(e.target.value)}
            disabled={showResult}
            placeholder={pregunta.tipo === "analisis" ? "Describe tu análisis con detalle..." : "Escribe tu respuesta aquí..."}
            rows={6}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxor-primary/30 focus:border-luxor-primary text-sm resize-y"
          />
        ) : (
          <div className="space-y-2">
            {pregunta.opciones.map((opcion, i) => {
              const isCorrect = i === pregunta.respuestaCorrecta
              const isSelected = selected === i

              let style = "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              if (showResult) {
                if (isCorrect) {
                  style = "border-blue-500 bg-blue-50"
                } else if (isSelected && !isCorrect) {
                  style = "border-red-500 bg-red-50"
                }
              } else if (isSelected) {
                style = "border-luxor-primary bg-luxor-primary/5"
              }

              return (
                <button
                  key={i}
                  onClick={() => !showResult && setSelected(i)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      showResult && isCorrect
                        ? "bg-blue-500 text-white"
                        : showResult && isSelected && !isCorrect
                          ? "bg-red-500 text-white"
                          : isSelected
                            ? "bg-luxor-primary text-white"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-gray-700">{opcion}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!showResult ? (
          <Button onClick={handleResponder} disabled={esTextoLibre ? !libre.trim() : selected === null}>
            Verificar Respuesta
          </Button>
        ) : (
          <Button onClick={handleSiguiente}>
            {current < preguntas.length - 1 ? (
              <>
                Siguiente Pregunta
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              "Finalizar Módulo"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
