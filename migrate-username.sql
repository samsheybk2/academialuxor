-- Migracion: Agregar campo username a profiles
-- Ejecutar en Supabase SQL Editor

-- Agregar columna username
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Generar usernames automaticos para usuarios existentes basado en email
UPDATE profiles
SET username = LOWER(REPLACE(REPLACE(SPLIT_PART(email, '@', 1), '.', '_'), '-', '_'))
WHERE username IS NULL;

-- Hacer NOT NULL despues de generar los usernames
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- Crear indice unico para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
