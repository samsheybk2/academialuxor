"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const data = [
  { name: "Gerentes", meta: 100, actual: 85 },
  { name: "Coordinadores", meta: 100, actual: 72 },
  { name: "Administrativos", meta: 100, actual: 90 },
  { name: "Operadores", meta: 100, actual: 63 },
]

export function CoberturaCapacitacion() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Cobertura de Capacitación</h3>
        <p className="text-sm text-gray-500">Porcentaje por nivel</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value}%`, "Cobertura"]}
            />
            <Bar dataKey="meta" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Meta" />
            <Bar dataKey="actual" radius={[4, 4, 0, 0]} name="Actual">
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.actual >= 80 ? "#28315F" : entry.actual >= 60 ? "#3D4F7C" : "#f59e0b"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
