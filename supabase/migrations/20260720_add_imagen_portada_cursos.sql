-- Agregar campo imagen_portada a la tabla cursos
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS imagen_portada TEXT;

-- Comentario
COMMENT ON COLUMN cursos.imagen_portada IS 'URL de imagen de portada del curso';
