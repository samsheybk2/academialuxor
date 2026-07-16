export type Rol = "decano" | "facilitador" | "estudiante"

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
