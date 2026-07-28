"use client"

import { BarChart3, Users, ClipboardList, TrendingUp, Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react"

export default function PanelControlPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Candidatos Activos", value: "24", icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Tests Activos", value: "4", icon: ClipboardList, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Entrevistas Pendientes", value: "8", icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Contrataciones Mes", value: "3", icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Candidatos por Etapa</h2>
          <div className="space-y-3">
            {[
              { etapa: "Nuevo", count: 5, color: "bg-blue-500" },
              { etapa: "En Revision", count: 8, color: "bg-amber-500" },
              { etapa: "Entrevista", count: 4, color: "bg-purple-500" },
              { etapa: "Evaluacion", count: 3, color: "bg-indigo-500" },
              { etapa: "Oferta", count: 2, color: "bg-teal-500" },
              { etapa: "Contratado", count: 2, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.etapa} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24">{item.etapa}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / 10) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-900 w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {[
              { accion: "Nuevo candidato: Maria Garcia", fecha: "Hace 2h", tipo: "candidato" },
              { accion: "Test asignado: Liderazgo a Carlos R.", fecha: "Hace 4h", tipo: "test" },
              { accion: "Entrevista programada: Ana M.", fecha: "Ayer", tipo: "entrevista" },
              { accion: "Candidato contratado: Pedro L.", fecha: "Hace 2 dias", tipo: "contrato" },
              { accion: "Test creado: Conocimiento Retail", fecha: "Hace 3 dias", tipo: "test" },
            ].map((actividad, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-1.5 rounded-full ${
                  actividad.tipo === "candidato" ? "bg-blue-50" :
                  actividad.tipo === "test" ? "bg-emerald-50" :
                  actividad.tipo === "entrevista" ? "bg-purple-50" :
                  "bg-green-50"
                }`}>
                  {actividad.tipo === "candidato" ? <Users className="w-3 h-3 text-blue-600" /> :
                   actividad.tipo === "test" ? <ClipboardList className="w-3 h-3 text-emerald-600" /> :
                   actividad.tipo === "entrevista" ? <Calendar className="w-3 h-3 text-purple-600" /> :
                   <CheckCircle2 className="w-3 h-3 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{actividad.accion}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{actividad.fecha}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
