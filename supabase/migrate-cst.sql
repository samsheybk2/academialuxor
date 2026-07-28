-- ============================================================
-- CST (Captacion y Seleccion de Talento) - Tablas del Modulo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

SET timezone = 'America/Caracas';

-- Permitir lectura anonima de cargos (para formulario publico de postulacion)
CREATE POLICY "cargos_select_anon"
  ON cargos FOR SELECT
  USING (auth.role() = 'anon');

-- ============================================================
-- 1. PLANTILLA DE EMPLEADOS
-- ============================================================

-- 1.1 Agregar total_plazas a cargos existentes
ALTER TABLE cargos ADD COLUMN IF NOT EXISTS total_plazas INTEGER NOT NULL DEFAULT 1 CHECK (total_plazas > 0);

-- Eliminar tabla separada (ya no se usa)
DROP TABLE IF EXISTS cst_plantilla_cargos;

-- 1.2 Registro de empleados
CREATE TABLE IF NOT EXISTS cst_empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cedula TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE RESTRICT,
  sucursal TEXT,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_retiro DATE,
  estatus TEXT NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'retirado')),
  motivo_retiro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ATS - CANDIDATOS
-- ============================================================

-- 2.1 Candidatos en el pipeline
CREATE TABLE IF NOT EXISTS cst_candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  cedula TEXT,
  ubicacion TEXT,
  cargo_id TEXT REFERENCES cargos(id) ON DELETE SET NULL,
  fuente TEXT DEFAULT 'Otro',
  salario_esperado TEXT,
  cv_url TEXT,
  notas TEXT,
  etapa TEXT NOT NULL DEFAULT 'nuevo' CHECK (etapa IN ('nuevo', 'revision', 'entrevista', 'evaluacion', 'oferta', 'contratado', 'rechazado')),
  calificacion INTEGER DEFAULT 0 CHECK (calificacion >= 0 AND calificacion <= 5),
  fecha_postulacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Historial de cambios de etapa de candidatos
CREATE TABLE IF NOT EXISTS cst_candidato_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES cst_candidatos(id) ON DELETE CASCADE,
  etapa_anterior TEXT,
  etapa_nueva TEXT NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TEST DE COMPETENCIAS
-- ============================================================

-- 3.1 Tests creados
CREATE TABLE IF NOT EXISTS cst_test_competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('psicometrico', 'competencias', 'habilidades', 'conocimiento')),
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'inactivo')),
  duracion_minutos INTEGER NOT NULL DEFAULT 30 CHECK (duracion_minutos > 0),
  calificacion_minima INTEGER DEFAULT 70 CHECK (calificacion_minima >= 0 AND calificacion_minima <= 100),
  instrucciones TEXT,
  creado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Preguntas de cada test
CREATE TABLE IF NOT EXISTS cst_test_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES cst_test_competencias(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('opcion_multiple', 'escala', 'verdadero_falso', 'abierta')),
  opciones JSONB,
  respuesta_correcta INTEGER,
  competencia TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Asignaciones de tests a candidatos
CREATE TABLE IF NOT EXISTS cst_test_asignaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES cst_test_competencias(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES cst_candidatos(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_limite DATE,
  fecha_completado TIMESTAMPTZ,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'expirado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, candidato_id)
);

-- 3.4 Respuestas/resultados de tests
CREATE TABLE IF NOT EXISTS cst_test_resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asignacion_id UUID NOT NULL REFERENCES cst_test_asignaciones(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES cst_test_preguntas(id) ON DELETE CASCADE,
  respuesta JSONB,
  calificacion INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asignacion_id, pregunta_id)
);

-- ============================================================
-- 4. CONFIGURACION DEL MODULO
-- ============================================================

CREATE TABLE IF NOT EXISTS cst_configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. RLS (ROW LEVEL SECURITY)
-- ============================================================

ALTER TABLE cst_plantilla_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_candidato_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_test_resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cst_configuracion ENABLE ROW LEVEL SECURITY;

-- 5.1 Todos los usuarios autenticados pueden leer
CREATE POLICY "cst_select_all" ON cst_plantilla_cargos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_empleados FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_candidatos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_candidato_historial FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_test_competencias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_test_preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_test_asignaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_test_resultados FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cst_select_all" ON cst_configuracion FOR SELECT USING (auth.role() = 'authenticated');

-- 5.2 Solo decano y developer pueden insertar/actualizar/eliminar
CREATE POLICY "cst_insert_all" ON cst_plantilla_cargos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_update_all" ON cst_plantilla_cargos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_delete_all" ON cst_plantilla_cargos FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_empleados FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_update_all" ON cst_empleados FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_delete_all" ON cst_empleados FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_candidatos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer', 'facilitador'))
);
CREATE POLICY "cst_insert_anon" ON cst_candidatos FOR INSERT WITH CHECK (
  auth.role() = 'anon'
);
CREATE POLICY "cst_update_all" ON cst_candidatos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer', 'facilitador'))
);
CREATE POLICY "cst_delete_all" ON cst_candidatos FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_candidato_historial FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer', 'facilitador'))
);
CREATE POLICY "cst_update_all" ON cst_candidato_historial FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_test_competencias FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_update_all" ON cst_test_competencias FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_delete_all" ON cst_test_competencias FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_test_preguntas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_update_all" ON cst_test_preguntas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_delete_all" ON cst_test_preguntas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_test_asignaciones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer', 'facilitador'))
);
CREATE POLICY "cst_update_all" ON cst_test_asignaciones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

CREATE POLICY "cst_insert_all" ON cst_test_resultados FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "cst_insert_all" ON cst_configuracion FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_update_all" ON cst_configuracion FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);
CREATE POLICY "cst_delete_all" ON cst_configuracion FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('decano', 'developer'))
);

-- ============================================================
-- 6. TRIGGERS (updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_cst_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cst_plantilla_cargos_updated_at
  BEFORE UPDATE ON cst_plantilla_cargos
  FOR EACH ROW EXECUTE FUNCTION update_cst_updated_at();

CREATE TRIGGER set_cst_empleados_updated_at
  BEFORE UPDATE ON cst_empleados
  FOR EACH ROW EXECUTE FUNCTION update_cst_updated_at();

CREATE TRIGGER set_cst_candidatos_updated_at
  BEFORE UPDATE ON cst_candidatos
  FOR EACH ROW EXECUTE FUNCTION update_cst_updated_at();

CREATE TRIGGER set_cst_test_competencias_updated_at
  BEFORE UPDATE ON cst_test_competencias
  FOR EACH ROW EXECUTE FUNCTION update_cst_updated_at();

CREATE TRIGGER set_cst_configuracion_updated_at
  BEFORE UPDATE ON cst_configuracion
  FOR EACH ROW EXECUTE FUNCTION update_cst_updated_at();

-- ============================================================
-- 7. INDICES
-- ============================================================

CREATE INDEX idx_cst_empleados_cargo ON cst_empleados(cargo_id);
CREATE INDEX idx_cst_empleados_estatus ON cst_empleados(estatus);
CREATE INDEX idx_cst_candidatos_etapa ON cst_candidatos(etapa);
CREATE INDEX idx_cst_candidatos_cargo ON cst_candidatos(cargo_id);
CREATE INDEX idx_cst_candidato_historial_candidato ON cst_candidato_historial(candidato_id);
CREATE INDEX idx_cst_test_asignaciones_candidato ON cst_test_asignaciones(candidato_id);
CREATE INDEX idx_cst_test_asignaciones_test ON cst_test_asignaciones(test_id);
CREATE INDEX idx_cst_test_preguntas_test ON cst_test_preguntas(test_id);
CREATE INDEX idx_cst_test_resultados_asignacion ON cst_test_resultados(asignacion_id);
