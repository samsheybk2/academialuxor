"use client"

import { Settings, Bell, Shield, Users, Building2, FileText } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-sm text-gray-500 mt-1">Ajustes generales del modulo CST</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Building2, titulo: "Departamentos", desc: "Gestionar departamentos de la empresa", href: "#" },
          { icon: FileText, titulo: "Requisitos de Puesto", desc: "Definir requisitos y competencias por puesto", href: "#" },
          { icon: Users, titulo: "Evaluadores", desc: "Administrar evaluadores autorizados", href: "#" },
          { icon: Bell, titulo: "Notificaciones", desc: "Configurar alertas de nuevas postulaciones", href: "#" },
          { icon: Shield, titulo: "Permisos", desc: "Gestionar accesos del modulo CST", href: "#" },
        ].map((item) => (
          <div
            key={item.titulo}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <item.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{item.titulo}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <span className="text-xs text-gray-400">Proximamente</span>
          </div>
        ))}
      </div>
    </div>
  )
}
