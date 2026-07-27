-- Migración: Video Conferencias - Cargos, Asistencia e Integración con Rutas de Aprendizaje

-- 1. Agregar columna video_conferencia_id a cargo_elementos
ALTER TABLE cargo_elementos ADD COLUMN IF NOT EXISTS video_conferencia_id UUID REFERENCES video_conferencias(id) ON DELETE SET NULL;

-- 2. Actualizar el CHECK de tipo en cargo_elementos para incluir 'video_conferencia'
ALTER TABLE cargo_elementos DROP CONSTRAINT IF EXISTS cargo_elementos_tipo_check;
ALTER TABLE cargo_elementos ADD CONSTRAINT cargo_elementos_tipo_check CHECK (tipo IN ('curso', 'taller', 'examen', 'video_conferencia'));

-- 3. Crear tabla de cargos invitados a video conferencias
CREATE TABLE IF NOT EXISTS video_conferencias_cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_conferencia_id UUID NOT NULL REFERENCES video_conferencias(id) ON DELETE CASCADE,
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  UNIQUE(video_conferencia_id, cargo_id)
);

ALTER TABLE video_conferencias_cargos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vc_cargos_select_auth" ON video_conferencias_cargos;
DROP POLICY IF EXISTS "vc_cargos_all_facilitador" ON video_conferencias_cargos;

CREATE POLICY "vc_cargos_select_auth" ON video_conferencias_cargos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "vc_cargos_all_facilitador" ON video_conferencias_cargos
  FOR ALL USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- 4. Crear tabla de asistencia a video conferencias
CREATE TABLE IF NOT EXISTS video_conferencias_asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_conferencia_id UUID NOT NULL REFERENCES video_conferencias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_conferencia_id, user_id)
);

ALTER TABLE video_conferencias_asistencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vc_asistencia_select_auth" ON video_conferencias_asistencia;
DROP POLICY IF EXISTS "vc_asistencia_insert_own" ON video_conferencias_asistencia;
DROP POLICY IF EXISTS "vc_asistencia_insert_facilitador" ON video_conferencias_asistencia;
DROP POLICY IF EXISTS "vc_asistencia_delete_facilitador" ON video_conferencias_asistencia;

CREATE POLICY "vc_asistencia_select_auth" ON video_conferencias_asistencia
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "vc_asistencia_insert_own" ON video_conferencias_asistencia
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "vc_asistencia_insert_facilitador" ON video_conferencias_asistencia
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

CREATE POLICY "vc_asistencia_delete_facilitador" ON video_conferencias_asistencia
  FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
