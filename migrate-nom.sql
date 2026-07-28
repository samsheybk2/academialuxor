-- ============================================================
-- MIGRACION: NOM - Nomina y Organizacion de Meta
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. ESCALAS SALARIALES
CREATE TABLE IF NOT EXISTS nom_escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fijo_porcentaje', 'rango_por_cargo', 'importar')),
  porcentaje_diferencia DECIMAL(5,2),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NIVELES DE ESCALA
CREATE TABLE IF NOT EXISTS nom_escalas_niveles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id UUID NOT NULL REFERENCES nom_escalas(id) ON DELETE CASCADE,
  nivel INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  salario_minimo DECIMAL(12,2),
  salario_maximo DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escala_id, nivel)
);

-- 3. REGLAS DE ANTIGUEDAD
CREATE TABLE IF NOT EXISTS nom_antiguedad_reglas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje_anual', 'tramos')),
  porcentaje_anual DECIMAL(5,2),
  tramos JSONB DEFAULT '[]'::jsonb,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERCENTILES DE MERCADO
CREATE TABLE IF NOT EXISTS nom_percentiles_mercado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id TEXT,
  cargo_nombre TEXT NOT NULL,
  nivel TEXT,
  percentil_25 DECIMAL(12,2),
  percentil_50 DECIMAL(12,2),
  percentil_75 DECIMAL(12,2),
  percentil_90 DECIMAL(12,2),
  fuente TEXT,
  fecha_referencia DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CALCULOS GUARDADOS
CREATE TABLE IF NOT EXISTS nom_calculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  empleado_nombre TEXT NOT NULL,
  empleado_cedula TEXT,
  empleado_cargo TEXT NOT NULL,
  empleado_nivel TEXT,
  empleado_salario_actual DECIMAL(12,2) NOT NULL,
  empleado_antiguedad_anos INTEGER DEFAULT 0,
  escala_id UUID REFERENCES nom_escalas(id),
  antiguedad_regla_id UUID REFERENCES nom_antiguedad_reglas(id),
  resultado JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_nom_escalas_niveles_escala ON nom_escalas_niveles(escala_id);
CREATE INDEX IF NOT EXISTS idx_nom_percentiles_cargo ON nom_percentiles_mercado(cargo_id);
CREATE INDEX IF NOT EXISTS idx_nom_calculos_user ON nom_calculos(user_id);

-- TRIGGERS
CREATE TRIGGER update_nom_escalas_updated_at
  BEFORE UPDATE ON nom_escalas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nom_antiguedad_reglas_updated_at
  BEFORE UPDATE ON nom_antiguedad_reglas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE nom_escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom_escalas_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom_antiguedad_reglas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom_percentiles_mercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE nom_calculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nom_escalas_select_auth" ON nom_escalas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "nom_escalas_all_admin" ON nom_escalas
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "nom_niveles_select_auth" ON nom_escalas_niveles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "nom_niveles_all_admin" ON nom_escalas_niveles
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "nom_antiguedad_select_auth" ON nom_antiguedad_reglas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "nom_antiguedad_all_admin" ON nom_antiguedad_reglas
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "nom_percentiles_select_auth" ON nom_percentiles_mercado
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "nom_percentiles_all_admin" ON nom_percentiles_mercado
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "nom_calculos_select_own" ON nom_calculos
  FOR SELECT USING (auth.uid() = user_id OR public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "nom_calculos_insert_auth" ON nom_calculos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nom_calculos_delete_own" ON nom_calculos
  FOR DELETE USING (auth.uid() = user_id OR public.get_my_role() IN ('decano', 'developer'));
