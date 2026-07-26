"use client"

import { useState } from "react"
import { Search, X, Briefcase } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
}: MultiSelectProps) {
  const [search, setSearch] = useState("")

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Search bar */}
      <div className="p-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selected count */}
      {value.length > 0 && (
        <div className="px-4 py-2 bg-luxor-primary/5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-luxor-primary">{value.length} seleccionado{value.length > 1 ? "s" : ""}</span>
          <button type="button" onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Limpiar</button>
        </div>
      )}

      {/* List */}
      <div className="max-h-52 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">{emptyText}</p>
        ) : (
          filtered.map(opt => {
            const selected = value.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  selected ? "bg-luxor-primary/10" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-luxor-primary text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${selected ? "text-luxor-primary" : "text-gray-900"}`}>{opt.label}</p>
                </div>
                {selected && (
                  <span className="w-5 h-5 rounded-full bg-luxor-primary flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
