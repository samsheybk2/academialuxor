"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { History, Trash2, ChevronDown, ChevronUp, FileText, Table } from "lucide-react"
import * as XLSX from "xlsx"

interface CalculoGuardado {
  id: string
  empleado_nombre: string
  empleado_cedula: string | null
  empleado_cargo: string
  empleado_nivel: string | null
  empleado_salario_actual: number
  empleado_antiguedad_anos: number
  resultado: {
    salario_base: number
    bonificacion_antiguedad: number
    porcentaje_antiguedad: number
    total_paquete: number
    comparacion_mercado: {
      posicion: string
      percentil_25: number
      percentil_50: number
      percentil_75: number
      percentil_90: number
    }
    recomendaciones: string[]
  }
  created_at: string
}

export default function HistorialPage() {
  const [calculos, setCalculos] = useState<CalculoGuardado[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const supabase = createSupabaseClient()

  const fetchCalculos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("nom_calculos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (data) {
      setCalculos(data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        empleado_nombre: c.empleado_nombre as string,
        empleado_cedula: c.empleado_cedula as string | null,
        empleado_cargo: c.empleado_cargo as string,
        empleado_nivel: c.empleado_nivel as string | null,
        empleado_salario_actual: Number(c.empleado_salario_actual),
        empleado_antiguedad_anos: c.empleado_antiguedad_anos as number,
        resultado: c.resultado as CalculoGuardado["resultado"],
        created_at: c.created_at as string,
      })))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCalculos()
  }, [fetchCalculos])

  const deleteCalculo = async (id: string) => {
    if (!confirm("Eliminar este calculo?")) return
    await supabase.from("nom_calculos").delete().eq("id", id)
    fetchCalculos()
  }

  const exportarPDF = async (calc: CalculoGuardado) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("NOM - Calculo Salarial", 20, 20)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date(calc.created_at).toLocaleDateString("es-VE")}`, 20, 28)

    doc.setFontSize(14)
    doc.text("Datos del Empleado", 20, 42)
    doc.setFontSize(10)
    doc.text(`Nombre: ${calc.empleado_nombre}`, 25, 50)
    doc.text(`Cedula: ${calc.empleado_cedula || "N/A"}`, 25, 56)
    doc.text(`Cargo: ${calc.empleado_cargo}`, 25, 62)
    doc.text(`Salario Actual: $${calc.empleado_salario_actual.toLocaleString()}`, 25, 68)
    doc.text(`Antiguedad: ${calc.empleado_antiguedad_anos} anios`, 25, 74)

    doc.setFontSize(14)
    doc.text("Desglose", 20, 90)
    doc.setFontSize(10)
    doc.text(`Salario Base: $${calc.resultado.salario_base.toLocaleString()}`, 25, 98)
    doc.text(`Antiguedad (${calc.resultado.porcentaje_antiguedad}%): $${calc.resultado.bonificacion_antiguedad.toLocaleString()}`, 25, 104)
    doc.setFontSize(12)
    doc.text(`TOTAL: $${calc.resultado.total_paquete.toLocaleString()}`, 25, 114)

    doc.setFontSize(14)
    doc.text("Comparacion con Mercado", 20, 130)
    doc.setFontSize(10)
    doc.text(`Posicion: ${calc.resultado.comparacion_mercado.posicion}`, 25, 138)

    doc.setFontSize(14)
    doc.text("Recomendaciones", 20, 155)
    doc.setFontSize(10)
    calc.resultado.recomendaciones.forEach((rec, i) => {
      const lines = doc.splitTextToSize(`• ${rec}`, 160)
      doc.text(lines, 25, 163 + i * 10)
    })

    doc.save(`NOM_${calc.empleado_nombre.replace(/\s+/g, "_")}_${new Date(calc.created_at).toISOString().slice(0, 10)}.pdf`)
  }

  const exportarExcel = (calc: CalculoGuardado) => {
    const data = [
      ["NOM - Calculo Salarial"],
      [""],
      ["DATOS DEL EMPLEADO"],
      ["Nombre", calc.empleado_nombre],
      ["Cedula", calc.empleado_cedula || "N/A"],
      ["Cargo", calc.empleado_cargo],
      ["Salario Actual", calc.empleado_salario_actual],
      ["Antiguedad", calc.empleado_antiguedad_anos],
      [""],
      ["DESGLOSE"],
      ["Salario Base", calc.resultado.salario_base],
      ["Antiguedad (%)", calc.resultado.porcentaje_antiguedad],
      ["Antiguedad ($)", calc.resultado.bonificacion_antiguedad],
      ["TOTAL", calc.resultado.total_paquete],
      [""],
      ["MERCADO"],
      ["Posicion", calc.resultado.comparacion_mercado.posicion],
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Calculo")
    XLSX.writeFile(wb, `NOM_${calc.empleado_nombre.replace(/\s+/g, "_")}.xlsx`)
  }

  const filtered = calculos.filter(c =>
    c.empleado_nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.empleado_cargo.toLowerCase().includes(search.toLowerCase()) ||
    (c.empleado_cedula || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-full bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Historial de Calculos</h1>
            <p className="text-sm text-gray-400">{calculos.length} calculos guardados</p>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
          placeholder="Buscar por nombre, cargo o cedula..."
        />

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{search ? "Sin resultados" : "No hay calculos guardados"}</p>
            </div>
          ) : (
            filtered.map((calc) => (
              <div key={calc.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === calc.id ? null : calc.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {calc.empleado_nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{calc.empleado_nombre}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {calc.empleado_cargo} &middot; ${calc.resultado.total_paquete.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      calc.resultado.comparacion_mercado.posicion.includes("encima")
                        ? "bg-green-900/50 text-green-400"
                        : calc.resultado.comparacion_mercado.posicion.includes("debajo")
                        ? "bg-red-900/50 text-red-400"
                        : "bg-blue-900/50 text-blue-400"
                    }`}>
                      {calc.resultado.comparacion_mercado.posicion.length > 20
                        ? calc.resultado.comparacion_mercado.posicion.substring(0, 20) + "..."
                        : calc.resultado.comparacion_mercado.posicion}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); exportarPDF(calc) }}
                      className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                      title="Exportar PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); exportarExcel(calc) }}
                      className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                      title="Exportar Excel"
                    >
                      <Table className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCalculo(calc.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedId === calc.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {expandedId === calc.id && (
                  <div className="px-4 pb-4 border-t border-gray-800 space-y-3 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Salario Base</p>
                        <p className="text-sm font-semibold text-white">${calc.resultado.salario_base.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Antiguedad ({calc.resultado.porcentaje_antiguedad}%)</p>
                        <p className="text-sm font-semibold text-amber-400">${calc.resultado.bonificacion_antiguedad.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Total Paquete</p>
                        <p className="text-sm font-semibold text-white">${calc.resultado.total_paquete.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Posicion Mercado</p>
                        <p className="text-sm font-semibold text-white">{calc.resultado.comparacion_mercado.posicion}</p>
                      </div>
                    </div>
                    {calc.resultado.recomendaciones.length > 0 && (
                      <div className="bg-gray-800/30 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-2">Recomendaciones:</p>
                        <div className="space-y-1">
                          {calc.resultado.recomendaciones.map((r, i) => (
                            <p key={i} className="text-xs text-gray-300">• {r}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-600">
                      Calculado el {new Date(calc.created_at).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
