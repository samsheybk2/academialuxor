-- ============================================================
-- COMPETENCIAS DE CARGOS
-- ============================================================

-- Tabla de competencias
CREATE TABLE IF NOT EXISTS competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación cargo-competencias
CREATE TABLE IF NOT EXISTS cargo_competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  competencia_id UUID NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  nivel_requerido INTEGER DEFAULT 3 CHECK (nivel_requerido BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cargo_id, competencia_id)
);

-- Políticas RLS
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_competencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competencias_select_all" ON competencias;
CREATE POLICY "competencias_select_all" ON competencias
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "competencias_insert_admin" ON competencias;
CREATE POLICY "competencias_insert_admin" ON competencias
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "competencias_update_admin" ON competencias;
CREATE POLICY "competencias_update_admin" ON competencias
  FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "competencias_delete_admin" ON competencias;
CREATE POLICY "competencias_delete_admin" ON competencias
  FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "cargo_competencias_select_all" ON cargo_competencias;
CREATE POLICY "cargo_competencias_select_all" ON cargo_competencias
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "cargo_competencias_insert_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_insert_admin" ON cargo_competencias
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "cargo_competencias_update_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_update_admin" ON cargo_competencias
  FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "cargo_competencias_delete_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_delete_admin" ON cargo_competencias
  FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- ============================================================
-- COMPETENCIAS BASE
-- ============================================================

INSERT INTO competencias (nombre, descripcion, color) VALUES
  ('Agilidad Numérica', 'Capacidad para realizar cálculos matemáticos y analizar datos numéricos', '#3b82f6'),
  ('Liderazgo', 'Capacidad para guiar, motivar e influir en equipos de trabajo', '#8b5cf6'),
  ('Comunicación Efectiva', 'Habilidad para transmitir ideas de manera clara y concisa', '#10b981'),
  ('Persuasión', 'Capacidad para influir en las decisiones y opiniones de otros', '#f59e0b'),
  ('Trabajo en Equipo', 'Habilidad para colaborar efectivamente con otros', '#ec4899'),
  ('Resolución de Problemas', 'Capacidad para identificar y solucionar problemas complejos', '#ef4444'),
  ('Pensamiento Crítico', 'Habilidad para analizar información de manera objetiva', '#06b6d4'),
  ('Adaptabilidad', 'Capacidad para ajustarse a cambios y nuevas situaciones', '#84cc16'),
  ('Gestión del Tiempo', 'Habilidad para organizar y priorizar tareas eficientemente', '#f97316'),
  ('Creatividad', 'Capacidad para generar ideas innovadoras y originales', '#a855f7'),
  ('Inteligencia Emocional', 'Habilidad para reconocer y gestionar emociones propias y ajenas', '#14b8a6'),
  ('Negociación', 'Capacidad para alcanzar acuerdos beneficiosos', '#eab308'),
  ('Orientación al Cliente', 'Enfoque en satisfacer las necesidades del cliente', '#3b82f6'),
  ('Toma de Decisiones', 'Capacidad para elegir la mejor opción basada en análisis', '#6366f1'),
  ('Planificación Estratégica', 'Habilidad para definir objetivos y planes a largo plazo', '#8b5cf6')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_competencias_nombre ON competencias(nombre);
CREATE INDEX IF NOT EXISTS idx_cargo_competencias_cargo ON cargo_competencias(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargo_competencias_competencia ON cargo_competencias(competencia_id);
