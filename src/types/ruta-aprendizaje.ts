export type TipoEtapa = "curso" | "taller" | "examen"

export type EstadoEtapa = "definido" | "en_progreso" | "completado"

export interface ElementoRuta {
  id: string
  titulo: string
  tipo: TipoEtapa
  descripcion: string
  duracion: string
  orden: number
  obligatorio: boolean
  cursoId?: string
}

export interface RutaAprendizaje {
  id: string
  cargo: string
  descripcion: string
  nivel?: string
  elementos: ElementoRuta[]
  custom?: boolean
}

export const tipoEtapaConfig: Record<
  TipoEtapa,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  curso: {
    label: "Curso",
    icon: "📚",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  taller: {
    label: "Taller Práctico",
    icon: "🔧",
    color: "text-violet-700",
    bgColor: "bg-violet-100",
  },
  examen: {
    label: "Examen Escrito",
    icon: "📝",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
}

export const cargosDefinidos = [
  { id: "cajero", nombre: "Cajero", descripcion: "Atención al cliente en puntos de venta y manejo de cobros" },
  { id: "reposador", nombre: "Reposador", descripcion: "Reposición de mercancía y organización de estantes" },
  { id: "promotor_ventas", nombre: "Promotor de Ventas", descripcion: "Promoción de productos y atención especializada al cliente" },
  { id: "encargado_almacen", nombre: "Encargado de Almacén", descripcion: "Gestión de recepción, almacenamiento y distribución de mercancía" },
  { id: "coordinador_piso", nombre: "Coordinador de Piso", descripcion: "Supervisión de operaciones, equipo de piso y estándares de servicio" },
  { id: "analista_administrativo", nombre: "Analista Administrativo", descripcion: "Gestión documental, procesos administrativos y control de inventarios" },
  { id: "gerente_sucursal", nombre: "Gerente de Sucursal", descripcion: "Dirección operativa, financiera y de recursos humanos de la sucursal" },
]
