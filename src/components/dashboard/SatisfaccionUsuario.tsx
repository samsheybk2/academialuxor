"use client"

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"

const data = [{ name: "Satisfacción", value: 87, fill: "#28315F" }]

const indicadores = [
  { label: "Calidad de contenido", value: 91 },
  { label: "Experiencia del facilitador", value: 89 },
  { label: "Utilidad práctica", value: 85 },
  { label: "Accesibilidad", value: 82 },
  { label: "Tiempo de duración", value: 88 },
]

export function SatisfaccionUsuario() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Índice de Satisfacción</h3>
        <p className="text-sm text-gray-500">Encuesta de satisfacción del usuario</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={data}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: "#e5e7eb" }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">87%</span>
            <span className="text-xs text-gray-500">General</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {indicadores.map((ind) => (
            <div key={ind.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ind.label}</span>
                <span className="font-medium text-gray-900">{ind.value}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-luxor-primary transition-all duration-500"
                  style={{ width: `${ind.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
