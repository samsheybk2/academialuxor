-- ============================================================
-- MIGRACION: Agregar total_plazas a tabla cargos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Agregar columna total_plazas si no existe
ALTER TABLE cargos ADD COLUMN IF NOT EXISTS total_plazas INTEGER NOT NULL DEFAULT 1 CHECK (total_plazas > 0);

-- Actualizar valores por defecto para cargos existentes
UPDATE cargos SET total_plazas = 1 WHERE total_plazas IS NULL;

SELECT 'Columna total_plazas agregada correctamente' AS mensaje;
