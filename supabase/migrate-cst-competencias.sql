-- ============================================================
-- MIGRACION: CST - Tests de Competencias con Preguntas Puntuadas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Preguntas de competencias (configuracion de tests)
CREATE TABLE IF NOT EXISTS cst_competencia_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia_id UUID NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Respuestas puntuadas para cada pregunta de competencia
CREATE TABLE IF NOT EXISTS cst_competencia_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID NOT NULL REFERENCES cst_competencia_preguntas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  puntaje INTEGER NOT NULL DEFAULT 0 CHECK (puntaje >= 0 AND puntaje <= 10),
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sesiones de test (cuando un candidato realiza el test)
CREATE TABLE IF NOT EXISTS cst_test_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES cst_candidatos(id) ON DELETE CASCADE,
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  puntaje_total INTEGER DEFAULT 0,
  puntaje_maximo INTEGER DEFAULT 0,
  porcentaje INTEGER DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'expirado')),
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Respuestas del candidato en el test
CREATE TABLE IF NOT EXISTS cst_test_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES cst_test_sesiones(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES cst_competencia_preguntas(id) ON DELETE CASCADE,
  respuesta_id UUID NOT NULL REFERENCES cst_competencia_respuestas(id) ON DELETE CASCADE,
  puntaje_obtenido INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sesion_id, pregunta_id)
);

-- 5. RLS
ALTER TABLE cst_competencia_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_competencia_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_respuestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cst_comp_preguntas_select" ON cst_competencia_preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_comp_respuestas_select" ON cst_competencia_respuestas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_test_sesiones_select" ON cst_test_sesiones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_test_respuestas_select" ON cst_test_respuestas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cst_comp_preguntas_anon" ON cst_competencia_preguntas FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "cst_comp_respuestas_anon" ON cst_competencia_respuestas FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "cst_comp_preguntas_insert" ON cst_competencia_preguntas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_comp_preguntas_update" ON cst_competencia_preguntas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_comp_preguntas_delete" ON cst_competencia_preguntas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_comp_respuestas_insert" ON cst_competencia_respuestas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_comp_respuestas_update" ON cst_competencia_respuestas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_comp_respuestas_delete" ON cst_competencia_respuestas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

DROP POLICY IF EXISTS "cst_test_sesiones_insert_anon" ON cst_test_sesiones;
CREATE POLICY "cst_test_sesiones_insert_anon" ON cst_test_sesiones FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "cst_test_sesiones_update_anon" ON cst_test_sesiones;
CREATE POLICY "cst_test_sesiones_update_anon" ON cst_test_sesiones FOR UPDATE USING (true);

DROP POLICY IF EXISTS "cst_test_respuestas_insert_anon" ON cst_test_respuestas;
CREATE POLICY "cst_test_respuestas_insert_anon" ON cst_test_respuestas FOR INSERT WITH CHECK (true);

CREATE INDEX idx_cst_comp_preguntas_competencia ON cst_competencia_preguntas(competencia_id);
CREATE INDEX idx_cst_comp_respuestas_pregunta ON cst_competencia_respuestas(pregunta_id);
CREATE INDEX idx_cst_test_sesiones_candidato ON cst_test_sesiones(candidato_id);
CREATE INDEX idx_cst_test_respuestas_sesion ON cst_test_respuestas(sesion_id);

SELECT 'Tablas CST de competencias creadas correctamente' AS mensaje;
