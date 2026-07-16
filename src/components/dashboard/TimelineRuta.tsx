"use client"

import type { ElementoRuta, TipoEtapa } from "@/types/ruta-aprendizaje"
import { tipoEtapaConfig } from "@/types/ruta-aprendizaje"
import {
  BookOpen,
  Wrench,
  FileText,
} from "lucide-react"

const iconMap: Record<TipoEtapa, React.ElementType> = {
  curso: BookOpen,
  taller: Wrench,
  examen: FileText,
}

interface TimelineProps {
  elementos: ElementoRuta[]
}

export function TimelineRuta({ elementos }: TimelineProps) {
  return (
    <div className="relative">
      {elementos.map((elemento, index) => {
        const config = tipoEtapaConfig[elemento.tipo]
        const Icon = iconMap[elemento.tipo]
        const isLast = index === elementos.length - 1

        return (
          <div key={elemento.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div className="absolute left-5 top-10 w-0.5 h-[calc(100%-20px)] bg-gray-200" />
            )}

            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 border-gray-200">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color} bg-opacity-10`} style={{ backgroundColor: `${config.bgColor}15` }}>
                      {config.label}
                    </span>
                    {elemento.obligatorio && (
                      <span className="text-xs font-medium text-red-500">Obligatorio</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mt-1">{elemento.titulo}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{elemento.descripcion}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{elemento.duracion}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
