"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createSupabaseClient } from "@/lib/supabase"
import { Calculator, User, Layers, BarChart3, Save, TrendingUp, TrendingDown, Minus, FileText, Table } from "lucide-react"

interface EscalaNivel {
  id: string
  nivel: number
  nombre: string
  salario_minimo: number
  salario_maximo: number
}

interface Escala {
  id: string
  nombre: string
  tipo: string
  porcentaje_diferencia: number | null
  niveles: EscalaNivel[]
}

interface ReglaAntiguedad {
  id: string
  nombre: string
  tipo: string
  porcentaje_anual: number | null
  tramos: Array<{ desde: number; hasta: number; porcentaje: number }>
}

interface PercentilMercado {
  id: string
  cargo_nombre: string
  nivel: string | null
  percentil_25: number
  percentil_50: number
  percentil_75: number
  percentil_90: number
  fuente: string | null
}

interface ResultadoCalculo {
  salario_base: number
  bonificacion_antiguedad: number
  porcentaje_antiguedad: number
  total_paquete: number
  comparacion_mercado: {
    percentil_25: number
    percentil_50: number
    percentil_75: number
    percentil_90: number
    posicion: string
    diferencias: {
      vs_p25: number
      vs_p50: number
      vs_p75: number
      vs_p90: number
    }
  }
  recomendaciones: string[]
}

export default function CalculadoraPage() {
  const { user } = useAuth()
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [reglas, setReglas] = useState<ReglaAntiguedad[]>([])
  const [percentiles, setPercentiles] = useState<PercentilMercado[]>([])
  const [cargos, setCargos] = useState<Array<{ id: string; nombre: string; nivel: string }>>([])

  const [empleadoNombre, setEmpleadoNombre] = useState("")
  const [empleadoCedula, setEmpleadoCedula] = useState("")
  const [empleadoCargoId, setEmpleadoCargoId] = useState("")
  const [empleadoSalario, setEmpleadoSalario] = useState("")
  const [empleadoAntiguedad, setEmpleadoAntiguedad] = useState("")

  const [escalaId, setEscalaId] = useState("")
  const [reglaId, setReglaId] = useState("")

  const [percentilP25, setPercentilP25] = useState("")
  const [percentilP50, setPercentilP50] = useState("")
  const [percentilP75, setPercentilP75] = useState("")
  const [percentilP90, setPercentilP90] = useState("")
  const [percentilFuente, setPercentilFuente] = useState("")

  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [calculando, setCalculando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)



  const supabase = createSupabaseClient()

  const fetchData = useCallback(async () => {
    const [escalasRes, reglasRes, percentilesRes, cargosRes] = await Promise.all([
      supabase.from("nom_escalas").select("*, nom_escalas_niveles(*)").eq("activa", true).order("created_at"),
      supabase.from("nom_antiguedad_reglas").select("*").eq("activa", true).order("created_at"),
      supabase.from("nom_percentiles_mercado").select("*").order("created_at"),
      supabase.from("cargos").select("id, nombre, nivel").order("nombre"),
    ])

    if (escalasRes.data) {
      const esc = escalasRes.data.map((e: Record<string, unknown>) => ({
        id: e.id as string,
        nombre: e.nombre as string,
        tipo: e.tipo as string,
        porcentaje_diferencia: e.porcentaje_diferencia as number | null,
        niveles: ((e.nom_escalas_niveles as Array<Record<string, unknown>>) || [])
          .sort((a, b) => (a.nivel as number) - (b.nivel as number))
          .map((n: Record<string, unknown>) => ({
            id: n.id as string,
            nivel: n.nivel as number,
            nombre: n.nombre as string,
            salario_minimo: Number(n.salario_minimo),
            salario_maximo: Number(n.salario_maximo),
          })),
      }))
      setEscalas(esc)
    }

    if (reglasRes.data) {
      setReglas(reglasRes.data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        nombre: r.nombre as string,
        tipo: r.tipo as string,
        porcentaje_anual: r.porcentaje_anual as number | null,
        tramos: (r.tramos as Array<{ desde: number; hasta: number; porcentaje: number }>) || [],
      })))
    }

    if (percentilesRes.data) {
      setPercentiles(percentilesRes.data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        cargo_nombre: p.cargo_nombre as string,
        nivel: p.nivel as string | null,
        percentil_25: Number(p.percentil_25),
        percentil_50: Number(p.percentil_50),
        percentil_75: Number(p.percentil_75),
        percentil_90: Number(p.percentil_90),
        fuente: p.fuente as string | null,
      })))
    }

    if (cargosRes.data) {
      setCargos(cargosRes.data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        nombre: c.nombre as string,
        nivel: c.nivel as string,
      })))
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const autoFillPercentiles = (cargoId: string) => {
    const cargo = cargos.find(c => c.id === cargoId)
    if (!cargo) return
    const existente = percentiles.find(
      p => p.cargo_nombre.toLowerCase() === cargo.nombre.toLowerCase()
    )
    if (existente) {
      setPercentilP25(existente.percentil_25.toString())
      setPercentilP50(existente.percentil_50.toString())
      setPercentilP75(existente.percentil_75.toString())
      setPercentilP90(existente.percentil_90.toString())
      setPercentilFuente(existente.fuente || "")
    }
  }

  const calcularSalarioBase = (salario: number, escala: Escala): number => {
    for (const nivel of escala.niveles) {
      if (salario >= nivel.salario_minimo && salario <= nivel.salario_maximo) {
        return nivel.salario_minimo
      }
    }
    if (escala.niveles.length > 0) {
      const primerNivel = escala.niveles[0]
      const ultimoNivel = escala.niveles[escala.niveles.length - 1]
      if (salario < primerNivel.salario_minimo) return primerNivel.salario_minimo
      if (salario > ultimoNivel.salario_maximo) return ultimoNivel.salario_maximo
    }
    return salario
  }

  const calcularAntiguedad = (salario: number, anos: number, regla: ReglaAntiguedad): { monto: number; porcentaje: number } => {
    if (regla.tipo === "porcentaje_anual" && regla.porcentaje_anual) {
      const porcentaje = Math.min(anos * regla.porcentaje_anual, 50)
      return { monto: salario * (porcentaje / 100), porcentaje }
    }
    if (regla.tipo === "tramos" && regla.tramos.length > 0) {
      for (const tramo of regla.tramos) {
        if (anos >= tramo.desde && anos <= tramo.hasta) {
          return { monto: salario * (tramo.porcentaje / 100), porcentaje: tramo.porcentaje }
        }
      }
      const ultimoTramo = regla.tramos[regla.tramos.length - 1]
      if (anos > ultimoTramo.hasta) {
        return { monto: salario * (ultimoTramo.porcentaje / 100), porcentaje: ultimoTramo.porcentaje }
      }
    }
    return { monto: 0, porcentaje: 0 }
  }

  const calcular = () => {
    const salario = parseFloat(empleadoSalario)
    const antiguedad = parseInt(empleadoAntiguedad) || 0
    const escala = escalas.find(e => e.id === escalaId)
    const regla = reglas.find(r => r.id === reglaId)

    if (!salario || !escala || !regla) {
      alert("Complete todos los campos obligatorios")
      return
    }

    setCalculando(true)

    setTimeout(() => {
      const salarioBase = calcularSalarioBase(salario, escala)
      const { monto: bonoAntiguedad, porcentaje: pctAntiguedad } = calcularAntiguedad(salario, antiguedad, regla)
      const totalPaquete = salario + bonoAntiguedad

      const p25 = parseFloat(percentilP25) || 0
      const p50 = parseFloat(percentilP50) || 0
      const p75 = parseFloat(percentilP75) || 0
      const p90 = parseFloat(percentilP90) || 0

      let posicion = "Sin datos de mercado"
      if (p50 > 0) {
        if (totalPaquete < p25) posicion = "Por debajo del percentil 25"
        else if (totalPaquete < p50) posicion = "Entre percentil 25 y 50"
        else if (totalPaquete < p75) posicion = "Entre percentil 50 y 75"
        else if (totalPaquete < p90) posicion = "Entre percentil 75 y 90"
        else posicion = "Por encima del percentil 90"
      }

      const recomendaciones: string[] = []
      if (p50 > 0) {
        if (totalPaquete < p25) {
          recomendaciones.push("El paquete salarial esta significativamente por debajo del mercado. Se recomienda un ajuste urgente.")
          const ajuste = p50 - totalPaquete
          recomendaciones.push(`Ajuste sugerido para alcanzar el percentil 50: +${ajuste.toLocaleString("es-VE", { style: "currency", currency: "USD" })}`)
        } else if (totalPaquete < p50) {
          recomendaciones.push("El paquete esta por debajo del promedio del mercado. Considere un ajuste moderado.")
          const ajuste = p50 - totalPaquete
          recomendaciones.push(`Diferencia vs percentil 50: -${ajuste.toLocaleString("es-VE", { style: "currency", currency: "USD" })}`)
        } else if (totalPaquete < p75) {
          recomendaciones.push("El paquete es competitivo. Se encuentra en un rango saludable del mercado.")
        } else if (totalPaquete < p90) {
          recomendaciones.push("El paquete esta por encima del promedio. Excelente posicion competitiva.")
        } else {
          recomendaciones.push("El paquete supera el percentil 90. Verifique que sea sostenible.")
        }
      }
      if (antiguedad >= 5) {
        recomendaciones.push(`Con ${antiguedad} anios de antiguedad, el colaborador merece reconocimiento por su permanencia.`)
      }
      if (pctAntiguedad >= 20) {
        recomendaciones.push("La bonificacion por antiguedad es significativa. Evaluar si el esquema actual sigue siendo sostenible.")
      }

      const res: ResultadoCalculo = {
        salario_base: salarioBase,
        bonificacion_antiguedad: bonoAntiguedad,
        porcentaje_antiguedad: pctAntiguedad,
        total_paquete: totalPaquete,
        comparacion_mercado: {
          percentil_25: p25,
          percentil_50: p50,
          percentil_75: p75,
          percentil_90: p90,
          posicion,
          diferencias: {
            vs_p25: totalPaquete - p25,
            vs_p50: totalPaquete - p50,
            vs_p75: totalPaquete - p75,
            vs_p90: totalPaquete - p90,
          },
        },
        recomendaciones,
      }

      setResultado(res)
      setShowResults(true)
      setCalculando(false)
    }, 800)
  }

  const guardarCalculo = async () => {
    if (!resultado || !user) return
    setGuardando(true)
    const cargo = cargos.find(c => c.id === empleadoCargoId)
    await supabase.from("nom_calculos").insert({
      user_id: user.id,
      empleado_nombre: empleadoNombre,
      empleado_cedula: empleadoCedula,
      empleado_cargo: cargo?.nombre || "",
      empleado_nivel: cargo?.nivel || "",
      empleado_salario_actual: parseFloat(empleadoSalario),
      empleado_antiguedad_anos: parseInt(empleadoAntiguedad) || 0,
      escala_id: escalaId || null,
      antiguedad_regla_id: reglaId || null,
      resultado: resultado as unknown as Record<string, unknown>,
    })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const exportarPDF = async () => {
    if (!resultado) return
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    const cargo = cargos.find(c => c.id === empleadoCargoId)

    doc.setFontSize(20)
    doc.text("NOM - Calculo Salarial", 20, 20)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-VE")}`, 20, 28)

    doc.setFontSize(14)
    doc.text("Datos del Empleado", 20, 42)
    doc.setFontSize(10)
    doc.text(`Nombre: ${empleadoNombre}`, 25, 50)
    doc.text(`Cedula: ${empleadoCedula || "N/A"}`, 25, 56)
    doc.text(`Cargo: ${cargo?.nombre || ""}`, 25, 62)
    doc.text(`Salario Actual: $${parseFloat(empleadoSalario).toLocaleString()}`, 25, 68)
    doc.text(`Antiguedad: ${empleadoAntiguedad || "0"} anios`, 25, 74)

    doc.setFontSize(14)
    doc.text("Desglose del Paquete Salarial", 20, 90)
    doc.setFontSize(10)
    doc.text(`Salario Base: $${resultado.salario_base.toLocaleString()}`, 25, 98)
    doc.text(`Bonificacion Antiguedad (${resultado.porcentaje_antiguedad}%): $${resultado.bonificacion_antiguedad.toLocaleString()}`, 25, 104)
    doc.setFontSize(12)
    doc.text(`TOTAL PAQUETE: $${resultado.total_paquete.toLocaleString()}`, 25, 114)

    doc.setFontSize(14)
    doc.text("Comparacion con Mercado", 20, 130)
    doc.setFontSize(10)
    doc.text(`Posicion: ${resultado.comparacion_mercado.posicion}`, 25, 138)
    doc.text(`Percentil 25: $${resultado.comparacion_mercado.percentil_25.toLocaleString()}`, 25, 146)
    doc.text(`Percentil 50: $${resultado.comparacion_mercado.percentil_50.toLocaleString()}`, 25, 152)
    doc.text(`Percentil 75: $${resultado.comparacion_mercado.percentil_75.toLocaleString()}`, 25, 158)
    doc.text(`Percentil 90: $${resultado.comparacion_mercado.percentil_90.toLocaleString()}`, 25, 164)

    doc.setFontSize(14)
    doc.text("Recomendaciones", 20, 180)
    doc.setFontSize(10)
    resultado.recomendaciones.forEach((rec, i) => {
      const lines = doc.splitTextToSize(`• ${rec}`, 160)
      doc.text(lines, 25, 188 + i * 12)
    })

    doc.save(`NOM_Calculo_${empleadoNombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const exportarExcel = async () => {
    if (!resultado) return
    const XLSX = await import("xlsx")
    const cargo = cargos.find(c => c.id === empleadoCargoId)

    const data = [
      ["NOM - Calculo Salarial"],
      [""],
      ["DATOS DEL EMPLEADO"],
      ["Nombre", empleadoNombre],
      ["Cedula", empleadoCedula || "N/A"],
      ["Cargo", cargo?.nombre || ""],
      ["Nivel", cargo?.nivel || ""],
      ["Salario Actual", parseFloat(empleadoSalario)],
      ["Antiguedad (anios)", parseInt(empleadoAntiguedad) || 0],
      [""],
      ["DESGLOSE DEL PAQUETE"],
      ["Salario Base", resultado.salario_base],
      ["Bonificacion Antiguedad (%)", resultado.porcentaje_antiguedad],
      ["Bonificacion Antiguedad ($)", resultado.bonificacion_antiguedad],
      ["TOTAL PAQUETE", resultado.total_paquete],
      [""],
      ["COMPARACION CON MERCADO"],
      ["Posicion", resultado.comparacion_mercado.posicion],
      ["Percentil 25", resultado.comparacion_mercado.percentil_25],
      ["Percentil 50", resultado.comparacion_mercado.percentil_50],
      ["Percentil 75", resultado.comparacion_mercado.percentil_75],
      ["Percentil 90", resultado.comparacion_mercado.percentil_90],
      [""],
      ["RECOMENDACIONES"],
      ...resultado.recomendaciones.map((r, i) => [`${i + 1}`, r]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Calculo Salarial")
    XLSX.writeFile(wb, `NOM_Calculo_${empleadoNombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const formatearMoneda = (v: number) => v.toLocaleString("es-VE", { style: "currency", currency: "USD" })

  return (
    <div className="min-h-full bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Calculadora Salarial</h1>
            <p className="text-sm text-gray-400">Calcule paquetes salariales con datos de mercado</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Data */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-white">Datos del Empleado</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nombre completo *</label>
                <input
                  type="text"
                  value={empleadoNombre}
                  onChange={(e) => setEmpleadoNombre(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="Ej: Juan Perez"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Cedula</label>
                <input
                  type="text"
                  value={empleadoCedula}
                  onChange={(e) => setEmpleadoCedula(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="V-12345678"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Cargo *</label>
                <select
                  value={empleadoCargoId}
                  onChange={(e) => {
                    setEmpleadoCargoId(e.target.value)
                    autoFillPercentiles(e.target.value)
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                >
                  <option value="">Seleccionar cargo...</option>
                  {cargos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.nivel})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Salario actual ($) *</label>
                  <input
                    type="number"
                    value={empleadoSalario}
                    onChange={(e) => setEmpleadoSalario(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Antiguedad (anios) *</label>
                  <input
                    type="number"
                    value={empleadoAntiguedad}
                    onChange={(e) => setEmpleadoAntiguedad(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-white">Configuracion</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Escala Salarial *</label>
                <select
                  value={escalaId}
                  onChange={(e) => setEscalaId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                >
                  <option value="">Seleccionar escala...</option>
                  {escalas.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} ({e.niveles.length} niveles)</option>
                  ))}
                </select>
                {escalas.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    No hay escalas.{" "}
                    <a href="/nom/escalas" className="underline hover:text-amber-300">Crear escala</a>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Regla de Antiguedad *</label>
                <select
                  value={reglaId}
                  onChange={(e) => setReglaId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                >
                  <option value="">Seleccionar regla...</option>
                  {reglas.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre} ({r.tipo === "porcentaje_anual" ? `${r.porcentaje_anual}% anual` : `${r.tramos.length} tramos`})</option>
                  ))}
                </select>
                {reglas.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    No hay reglas.{" "}
                    <a href="/nom/antiguedad" className="underline hover:text-amber-300">Crear regla</a>
                  </p>
                )}
              </div>

              {/* Preview of selected scale */}
              {escalaId && (() => {
                const escala = escalas.find(e => e.id === escalaId)
                if (!escala || escala.niveles.length === 0) return null
                return (
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-2">Vista previa de la escala:</p>
                    <div className="space-y-1">
                      {escala.niveles.map(n => (
                        <div key={n.id} className="flex justify-between text-xs">
                          <span className="text-gray-400">Nivel {n.nivel}: {n.nombre}</span>
                          <span className="text-gray-300">${n.salario_minimo.toLocaleString()} - ${n.salario_maximo.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Preview of selected rule */}
              {reglaId && (() => {
                const regla = reglas.find(r => r.id === reglaId)
                if (!regla) return null
                return (
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-2">Vista previa de la regla:</p>
                    {regla.tipo === "porcentaje_anual" ? (
                      <p className="text-xs text-gray-300">{regla.porcentaje_anual}% por anio de antiguedad (max 50%)</p>
                    ) : (
                      <div className="space-y-1">
                        {regla.tramos.map((t, i) => (
                          <div key={i} className="text-xs text-gray-300">
                            {t.desde}-{t.hasta} anios: {t.porcentaje}%
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Market Percentiles */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Percentiles de Mercado</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Percentil 25 ($)</label>
              <input
                type="number"
                value={percentilP25}
                onChange={(e) => setPercentilP25(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Percentil 50 ($)</label>
              <input
                type="number"
                value={percentilP50}
                onChange={(e) => setPercentilP50(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Percentil 75 ($)</label>
              <input
                type="number"
                value={percentilP75}
                onChange={(e) => setPercentilP75(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Percentil 90 ($)</label>
              <input
                type="number"
                value={percentilP90}
                onChange={(e) => setPercentilP90(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">Fuente</label>
              <input
                type="text"
                value={percentilFuente}
                onChange={(e) => setPercentilFuente(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-500 transition-colors"
                placeholder="Ej: Survey 2024, Mercer, etc."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={calcular}
            disabled={calculando || !empleadoNombre || !empleadoSalario || !escalaId || !reglaId}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white font-semibold rounded-xl hover:from-slate-500 hover:to-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {calculando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Calculator className="w-5 h-5" />
            )}
            {calculando ? "Calculando..." : "Calcular"}
          </button>

          {showResults && resultado && (
            <>
              <button
                onClick={guardarCalculo}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Save className="w-4 h-4" />
                {guardando ? "Guardando..." : guardado ? "Guardado!" : "Guardar"}
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportarExcel}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Table className="w-4 h-4" />
                Excel
              </button>
            </>
          )}
        </div>

        {/* Results */}
        {showResults && resultado && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Salary Breakdown */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="text-base font-semibold text-white mb-5">Desglose del Paquete Salarial</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-1">Salario Base</p>
                  <p className="text-xl font-bold text-white">{formatearMoneda(resultado.salario_base)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-1">Bonificacion Antiguedad ({resultado.porcentaje_antiguedad}%)</p>
                  <p className="text-xl font-bold text-amber-400">{formatearMoneda(resultado.bonificacion_antiguedad)}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700/50 to-gray-700/50 rounded-xl p-4 border border-slate-600/50">
                  <p className="text-xs text-gray-400 mb-1">Total Paquete</p>
                  <p className="text-2xl font-bold text-white">{formatearMoneda(resultado.total_paquete)}</p>
                </div>
              </div>
            </div>

            {/* Market Comparison */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="text-base font-semibold text-white mb-5">Comparacion con Mercado</h3>

              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  resultado.comparacion_mercado.posicion.includes("encima")
                    ? "bg-green-900/50 text-green-300 border border-green-700/50"
                    : resultado.comparacion_mercado.posicion.includes("debajo")
                    ? "bg-red-900/50 text-red-300 border border-red-700/50"
                    : "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                }`}>
                  {resultado.comparacion_mercado.posicion.includes("encima") ? <TrendingUp className="w-4 h-4" /> :
                   resultado.comparacion_mercado.posicion.includes("debajo") ? <TrendingDown className="w-4 h-4" /> :
                   <Minus className="w-4 h-4" />}
                  {resultado.comparacion_mercado.posicion}
                </div>
              </div>

              {/* Visual bar chart */}
              {resultado.comparacion_mercado.percentil_50 > 0 && (
                <div className="mb-6">
                  <div className="relative h-12 bg-gray-800 rounded-xl overflow-hidden">
                    {/* Scale bar */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="absolute left-0 right-0 h-2 bg-gray-700 mx-4 rounded-full" />
                      {/* Percentile markers */}
                      {[
                        { val: resultado.comparacion_mercado.percentil_25, label: "P25", color: "bg-gray-500" },
                        { val: resultado.comparacion_mercado.percentil_50, label: "P50", color: "bg-blue-500" },
                        { val: resultado.comparacion_mercado.percentil_75, label: "P75", color: "bg-purple-500" },
                        { val: resultado.comparacion_mercado.percentil_90, label: "P90", color: "bg-green-500" },
                      ].map((p, i) => {
                        const maxVal = resultado.comparacion_mercado.percentil_90 * 1.1 || 1
                        const left = (p.val / maxVal) * 100
                        return (
                          <div key={i} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${Math.min(left, 95)}%` }}>
                            <div className={`w-0.5 h-full ${p.color}`} />
                          </div>
                        )
                      })}
                      {/* Employee marker */}
                      {(() => {
                        const maxVal = resultado.comparacion_mercado.percentil_90 * 1.1 || 1
                        const left = (resultado.total_paquete / maxVal) * 100
                        return (
                          <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${Math.min(left, 95)}%` }}>
                            <div className="w-1 h-full bg-amber-400" />
                            <div className="absolute -top-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900" />
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 px-4 text-xs text-gray-500">
                    <span>P25: ${resultado.comparacion_mercado.percentil_25.toLocaleString()}</span>
                    <span>P50: ${resultado.comparacion_mercado.percentil_50.toLocaleString()}</span>
                    <span>P75: ${resultado.comparacion_mercado.percentil_75.toLocaleString()}</span>
                    <span>P90: ${resultado.comparacion_mercado.percentil_90.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <span className="text-xs text-gray-400">Empleado: ${resultado.total_paquete.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Differences table */}
              {resultado.comparacion_mercado.percentil_50 > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "vs P25", value: resultado.comparacion_mercado.diferencias.vs_p25 },
                    { label: "vs P50", value: resultado.comparacion_mercado.diferencias.vs_p50 },
                    { label: "vs P75", value: resultado.comparacion_mercado.diferencias.vs_p75 },
                    { label: "vs P90", value: resultado.comparacion_mercado.diferencias.vs_p90 },
                  ].map((d) => (
                    <div key={d.label} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                      <p className="text-xs text-gray-500 mb-1">{d.label}</p>
                      <p className={`text-sm font-semibold ${d.value >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {d.value >= 0 ? "+" : ""}{formatearMoneda(d.value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="text-base font-semibold text-white mb-4">Recomendaciones</h3>
              <div className="space-y-3">
                {resultado.recomendaciones.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-white font-semibold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
