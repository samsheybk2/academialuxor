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
  { name: "Ene", cursos: 8, completados: 6 },
  { name: "Feb", cursos: 10, completados: 8 },
  { name: "Mar", cursos: 12, completados: 11 },
  { name: "Abr", cursos: 9, completados: 7 },
  { name: "May", cursos: 14, completados: 12 },
  { name: "Jun", cursos: 11, completados: 10 },
  { name: "Jul", cursos: 13, completados: 9 },
]

export function FinalizacionCursos() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Finalización de Cursos</h3>
        <p className="text-sm text-gray-500">Cursos iniciados vs completados</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="cursos" fill="#8B9CC7" radius={[4, 4, 0, 0]} name="Iniciados" />
            <Bar dataKey="completados" fill="#28315F" radius={[4, 4, 0, 0]} name="Completados" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
