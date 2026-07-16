"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface Festividad {
  dia: number
  mes: number
  nombre: string
  tipo: "feriado" | "efemeride"
}

const festividades: Festividad[] = [
  { dia: 1, mes: 1, nombre: "Ano Nuevo", tipo: "feriado" },
  { dia: 6, mes: 1, nombre: "Dia de los Reyes Magos", tipo: "efemeride" },
  { dia: 12, mes: 1, nombre: "Dia del Comerciante", tipo: "efemeride" },
  { dia: 19, mes: 3, nombre: "Dia de San Jose", tipo: "feriado" },
  { dia: 28, mes: 3, nombre: "Jueves Santo", tipo: "feriado" },
  { dia: 29, mes: 3, nombre: "Viernes Santo", tipo: "feriado" },
  { dia: 2, mes: 4, nombre: "Declaracion de la Independencia", tipo: "efemeride" },
  { dia: 19, mes: 4, nombre: "Batalla de Carabobo", tipo: "feriado" },
  { dia: 1, mes: 5, nombre: "Dia del Trabajador", tipo: "feriado" },
  { dia: 3, mes: 5, nombre: "Natalicio de Simon Bolivar", tipo: "feriado" },
  { dia: 14, mes: 6, nombre: "Dia de la Bandera", tipo: "efemeride" },
  { dia: 24, mes: 6, nombre: "Batalla de Carabobo (efemeride)", tipo: "efemeride" },
  { dia: 5, mes: 7, nombre: "Dia de la Independencia", tipo: "feriado" },
  { dia: 24, mes: 7, nombre: "Natalicio de Simon Bolivar", tipo: "feriado" },
  { dia: 15, mes: 8, nombre: "Dia de la Asuncion de la Virgen Maria", tipo: "feriado" },
  { dia: 11, mes: 9, nombre: "Dia de los Libertadores", tipo: "efemeride" },
  { dia: 12, mes: 10, nombre: "Dia de la Resistencia Indigena", tipo: "feriado" },
  { dia: 15, mes: 10, nombre: "Dia de la Maternidad", tipo: "efemeride" },
  { dia: 21, mes: 10, nombre: "Dia de las Madres Venezolanas", tipo: "efemeride" },
  { dia: 29, mes: 10, nombre: "Dia del Amor", tipo: "efemeride" },
  { dia: 1, mes: 11, nombre: "Dia de Todos los Santos", tipo: "feriado" },
  { dia: 2, mes: 11, nombre: "Dia de los Difuntos", tipo: "feriado" },
  { dia: 17, mes: 11, nombre: "Transito del Libertador", tipo: "feriado" },
  { dia: 24, mes: 12, nombre: "Navidad", tipo: "feriado" },
  { dia: 28, mes: 12, nombre: "Dia de los Santos Inocentes", tipo: "efemeride" },
  { dia: 31, mes: 12, nombre: "Fin de Ano", tipo: "efemeride" },
]

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const diasSemana = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

function getDiasDelMes(mes: number, anio: number) {
  return new Date(anio, mes, 0).getDate()
}

function getPrimerDia(mes: number, anio: number) {
  return new Date(anio, mes - 1, 1).getDay()
}

function getHoy() {
  const h = new Date()
  return { dia: h.getDate(), mes: h.getMonth() + 1, anio: h.getFullYear() }
}

export function CalendarioFestividades() {
  const hoy = getHoy()
  const [mesActual, setMesActual] = useState(hoy.mes)
  const [anioActual, setAnioActual] = useState(hoy.anio)

  const dias = getDiasDelMes(mesActual, anioActual)
  const primerDia = getPrimerDia(mesActual, anioActual)
  const festividadesMes = festividades.filter((f) => f.mes === mesActual)

  function diaTieneFestividad(dia: number) {
    return festividadesMes.find((f) => f.dia === dia)
  }

  function anterior() {
    if (mesActual === 1) { setMesActual(12); setAnioActual(anioActual - 1) }
    else setMesActual(mesActual - 1)
  }

  function siguiente() {
    if (mesActual === 12) { setMesActual(1); setAnioActual(anioActual + 1) }
    else setMesActual(mesActual + 1)
  }

  function esHoy(dia: number) {
    return dia === hoy.dia && mesActual === hoy.mes && anioActual === hoy.anio
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={anterior} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
        <h3 className="text-base font-semibold text-gray-900">{meses[mesActual - 1]} {anioActual}</h3>
        <button onClick={siguiente} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {diasSemana.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: primerDia }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: dias }).map((_, i) => {
          const dia = i + 1
          const fest = diaTieneFestividad(dia)
          const hoy = esHoy(dia)
          return (
            <div
              key={dia}
              className={`relative flex items-center justify-center h-9 rounded-lg text-sm transition-all cursor-default ${
                fest
                  ? fest.tipo === "feriado"
                    ? "bg-red-100 text-red-700 font-semibold"
                    : "bg-blue-100 text-blue-700 font-medium"
                  : hoy
                    ? "bg-luxor-primary text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
              title={fest ? fest.nombre : undefined}
            >
              {dia}
              {fest && <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${fest.tipo === "feriado" ? "bg-red-500" : "bg-blue-500"}`} />}
            </div>
          )
        })}
      </div>

      {festividadesMes.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500">Festividades este mes</p>
          {festividadesMes.sort((a, b) => a.dia - b.dia).map((f, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${f.tipo === "feriado" ? "bg-red-50" : "bg-blue-50"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${f.tipo === "feriado" ? "bg-red-200 text-red-700" : "bg-blue-200 text-blue-700"}`}>
                {f.dia}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${f.tipo === "feriado" ? "text-red-700" : "text-blue-700"}`}>{f.nombre}</p>
                <p className="text-xs text-gray-400">{f.tipo === "feriado" ? "Feriado" : "Efemeride"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {festividadesMes.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">No hay festividades este mes</p>
      )}
    </div>
  )
}
