-- Agregar campo obligatorio a cursos
-- true = obligatorio (default), false = electivo
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS obligatorio BOOLEAN DEFAULT true;

-- Los cursos existentes quedan como obligatorios por defecto
-- Para marcar un curso como electivo, ejecuta:
-- UPDATE cursos SET obligatorio = false WHERE id = 'curso-uuid';
