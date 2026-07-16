"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

const data = [
  { mes: "Ene", visitas: 45 },
  { mes: "Feb", visitas: 52 },
  { mes: "Mar", visitas: 61 },
  { mes: "Abr", visitas: 48 },
  { mes: "May", visitas: 73 },
  { mes: "Jun", visitas: 68 },
  { mes: "Jul", visitas: 82 },
  { mes: "Ago", visitas: 76 },
  { mes: "Sep", visitas: 90 },
  { mes: "Oct", visitas: 85 },
  { mes: "Nov", visitas: 95 },
  { mes: "Dic", visitas: 88 },
]

export function VisitasPresenciales() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Visitas Presenciales</h3>
        <p className="text-sm text-gray-500">Capacitaciones presenciales por mes</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#28315F" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#28315F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value} visitas`, "Visitas"]}
            />
            <Area
              type="monotone"
              dataKey="visitas"
              stroke="#28315F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisitas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
