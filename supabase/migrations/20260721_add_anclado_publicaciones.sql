ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS anclado_hasta TIMESTAMPTZ;

UPDATE publicaciones SET anclado_hasta = NOW() + INTERVAL '30 days' WHERE anclado = TRUE;
ALTER TABLE publicaciones DROP COLUMN IF EXISTS anclado;
