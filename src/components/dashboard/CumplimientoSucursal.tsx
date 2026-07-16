"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { name: "Cumple", value: 68, color: "#28315F" },
  { name: "En proceso", value: 22, color: "#3D4F7C" },
  { name: "No cumple", value: 10, color: "#f59e0b" },
]

const sucursales = [
  { nombre: "Luxor Centro", porcentaje: 92 },
  { nombre: "Luxor Norte", porcentaje: 85 },
  { nombre: "Luxor Sur", porcentaje: 78 },
  { nombre: "Luxor Este", porcentaje: 88 },
  { nombre: "Luxor Oeste", porcentaje: 71 },
]

export function CumplimientoSucursal() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Cumplimiento por Sucursal</h3>
        <p className="text-sm text-gray-500">Indice de cumplimiento general</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="h-52 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [`${value}%`]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {sucursales.map((s) => (
            <div key={s.nombre} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{s.nombre}</span>
                <span className="text-gray-500">{s.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${s.porcentaje}%`,
                    backgroundColor:
                      s.porcentaje >= 85
                        ? "#28315F"
                        : s.porcentaje >= 75
                          ? "#3D4F7C"
                          : "#f59e0b",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
