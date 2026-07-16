"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { name: "Gerentes", total: 24, capacitados: 20 },
  { name: "Coordinadores", total: 48, capacitados: 38 },
  { name: "Administrativos", total: 36, capacitados: 32 },
  { name: "Operadores", total: 204, capacitados: 128 },
]

export function TotalCapacitaciones() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Total de Capacitaciones</h3>
        <p className="text-sm text-gray-500">Colaboradores capacitados vs total</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              width={120}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="total" fill="#e5e7eb" radius={[0, 4, 4, 0]} name="Total" />
            <Bar dataKey="capacitados" fill="#3D4F7C" radius={[0, 4, 4, 0]} name="Capacitados" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
