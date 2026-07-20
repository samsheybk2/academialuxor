export type TipoTest = 'cuestionario' | 'proyectivo'
export type TipoRespuesta = 'escala' | 'texto' | 'opcion_multiple' | 'dibujo'
export type EstadoRespuesta = 'en_progreso' | 'completado'

export interface TestPsicologico {
  id: string
  nombre: string
  descripcion?: string
  tipo: TipoTest
  duracion_minutos?: number
  instrucciones?: string
  activo?: boolean
  created_at?: string
}

export interface PreguntaTest {
  id: string
  test_id: string
  texto: string
  orden: number
  tipo_respuesta: TipoRespuesta
  opciones?: string[]
  created_at?: string
}

export interface RespuestaTest {
  id: string
  test_id: string
  user_id: string
  estado: EstadoRespuesta
  fecha_inicio?: string
  fecha_completado?: string
  created_at?: string
}

export interface DetalleRespuesta {
  id: string
  respuesta_id: string
  pregunta_id: string
  valor?: string
  imagen_url?: string
  created_at?: string
}

export interface ResultadoTest {
  id: string
  respuesta_id: string
  interpretacion?: string
  puntuacion?: Record<string, any>
  creado_por?: string
  fecha_interpretacion?: string
  created_at?: string
}
