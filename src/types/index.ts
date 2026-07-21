export type Rol = "decano" | "facilitador" | "estudiante" | "developer"

export type NivelContenido =
  | "gerentes"
  | "coordinadores"
  | "administrativos"
  | "operadores"

export type EstadoCurso = "borrador" | "pendiente" | "aprobado" | "rechazado"

export interface UserProfile {
  id: string
  email: string
  nombre: string
  rol: Rol
  nivel?: NivelContenido
  avatar?: string
  avatar_url?: string
  bio?: string
  cargo?: string
  sucursal?: string
  aprobado?: boolean
  cedula?: string
  fecha_nacimiento?: string
  created_at?: string
  createdAt?: string
}

export interface Curso {
  id: string
  titulo: string
  nivel: NivelContenido
  facilitador: string
  facilitadorId?: string
  descripcion: string
  modulos: number
  estudiantes: number
  activo: boolean
  duracion: string
  estado: EstadoCurso
  fechaCreacion?: string
  observaciones?: string
  imagen_portada?: string
}

export interface Modulo {
  id: string
  titulo: string
  orden: number
  tipo: "texto" | "video" | "quiz"
  contenido: string
}

export interface Progreso {
  id: string
  userId: string
  cursoId: string
  moduloActual: number
  completado: boolean
  porcentaje: number
  fechaInicio: string
  fechaFin?: string
}

export type TipoReaccion = "me_gusta" | "me_encanta" | "me_enoja" | "me_entristece" | "me_divierte" | "estoy_confundido"

export interface Publicacion {
  id: string
  autor_id: string
  contenido: string
  imagen_url?: string
  enlace_url?: string
  enlace_titulo?: string
  anclado_hasta?: string
  created_at: string
  autor?: UserProfile
  mis_reacciones?: string
  total_reacciones?: Record<string, number>
  encuesta_id?: string
}

export interface Reaccion {
  id: string
  publicacion_id: string
  usuario_id: string
  tipo: TipoReaccion
  created_at: string
}

export interface Encuesta {
  id: string
  publicacion_id: string
  pregunta: string
  multiple: boolean
  cerrada: boolean
  fecha_cierre?: string
  created_at: string
  opciones?: EncuestaOpcion[]
  mis_votos?: string[]
  total_votos?: number
}

export interface EncuestaOpcion {
  id: string
  encuesta_id: string
  texto: string
  orden: number
  created_at: string
  votos?: number
}

export type TipoUnidad = "direccion" | "gerencia" | "departamento"

export interface UnidadOrganizacional {
  id: string
  codigo?: string
  nombre: string
  tipo: TipoUnidad
  parent_id: string | null
  color: string
  descripcion?: string
  created_at?: string
}

export interface Competencia {
  id: string
  nombre: string
  descripcion?: string
  color: string
  created_at?: string
}

export interface CargoCompetencia {
  id: string
  cargo_id: string
  competencia_id: string
  nivel_requerido: number
  competencia?: Competencia
}
