-- Migración: Sistema jerárquico de unidades organizacionales
-- Fecha: 2026-07-18

-- 1. Crear tabla unidades_organizacionales
CREATE TABLE IF NOT EXISTS unidades_organizacionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'departamento' CHECK (tipo IN ('direccion', 'gerencia', 'departamento')),
  parent_id UUID REFERENCES unidades_organizacionales(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6366f1',
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agregar columna unidad_id a cargos
ALTER TABLE cargos ADD COLUMN IF NOT EXISTS unidad_id UUID REFERENCES unidades_organizacionales(id) ON DELETE SET NULL;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_cargos_unidad ON cargos(unidad_id);
CREATE INDEX IF NOT EXISTS idx_unidades_parent ON unidades_organizacionales(parent_id);

-- 4. Habilitar RLS
ALTER TABLE unidades_organizacionales ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS unidades_select_authenticated ON unidades_organizacionales;
DROP POLICY IF EXISTS unidades_all_admin ON unidades_organizacionales;

CREATE POLICY "unidades_select_authenticated"
  ON unidades_organizacionales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "unidades_all_admin"
  ON unidades_organizacionales FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- 6. Si la tabla ya existe, agregar columna codigo
ALTER TABLE unidades_organizacionales ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;
