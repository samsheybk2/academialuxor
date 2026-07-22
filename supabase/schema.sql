-- ============================================================
-- ACADEMIA LUXOR - Schema Completo de Base de Datos
-- Ejecutar TODO este script en Supabase SQL Editor una sola vez
-- ============================================================

-- IMPORTANTE: Configurar zona horaria permanente en Supabase
-- Ejecutar este comando en Supabase SQL Editor para establecer la zona horaria de la base de datos:
-- ALTER DATABASE postgres SET timezone = 'America/Caracas';
--
-- O desde el Dashboard de Supabase:
-- Settings > Database > Timezone > America/Caracas

-- Configurar zona horaria para esta sesión
SET timezone = 'America/Caracas';

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- 1.1 PERFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('decano', 'facilitador', 'estudiante', 'developer')),
  nivel TEXT CHECK (nivel IN ('gerentes', 'coordinadores', 'administrativos', 'operadores')),
  avatar_url TEXT,
  bio TEXT,
  aprobado BOOLEAN DEFAULT FALSE,
  cedula TEXT,
  cargo TEXT,
  sucursal TEXT,
  fecha_nacimiento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 CURSOS
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  nivel JSONB DEFAULT '["operadores"]'::jsonb,
  tipo TEXT CHECK (tipo IN ('sincronico', 'asincronico')),
  introduccion TEXT,
  video_bienvenida TEXT,
  facilitador_id UUID REFERENCES profiles(id),
  facilitador_nombre TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente', 'aprobado', 'rechazado')),
  duracion TEXT,
  modulos_count INTEGER DEFAULT 0,
  estudiantes_count INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 MODULOS
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  video_url TEXT,
  imagen_portada TEXT,
  duracion TEXT,
  orden INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 PREGUNTAS (Quiz)
CREATE TABLE IF NOT EXISTS preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  respuesta_correcta INTEGER,
  tipo TEXT NOT NULL DEFAULT 'multiple' CHECK (tipo IN ('multiple', 'libre', 'analisis')),
  texto_ayuda TEXT,
  orden INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multiple';
ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS texto_ayuda TEXT;
ALTER TABLE preguntas ALTER COLUMN opciones SET DEFAULT '[]'::jsonb;
ALTER TABLE preguntas ALTER COLUMN respuesta_correcta DROP NOT NULL;

-- 1.5 RESPUESTAS DE PREGUNTAS
CREATE TABLE IF NOT EXISTS respuestas_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  respuesta_seleccionada INTEGER,
  respuesta_libre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pregunta_id)
);

-- 1.6 INSCRIPCIONES
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'cancelada')),
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  UNIQUE(user_id, curso_id)
);

-- 1.6 PROGRESO DE MODULOS
CREATE TABLE IF NOT EXISTS progreso_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT false,
  quiz_aprobado BOOLEAN DEFAULT false,
  puntuacion INTEGER,
  intentos INTEGER DEFAULT 0,
  fecha_completado TIMESTAMPTZ,
  UNIQUE(user_id, modulo_id)
);

-- 1.7 CERTIFICADOS
CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  cert_id TEXT NOT NULL UNIQUE,
  user_nombre TEXT NOT NULL,
  curso_nombre TEXT NOT NULL,
  duracion TEXT,
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 MATERIALES PDF
CREATE TABLE IF NOT EXISTS material_pdf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'curso' CHECK (tipo IN ('curso', 'modulo')),
  storage_path TEXT,
  orden INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_material_pdf_curso ON material_pdf(curso_id);
CREATE INDEX IF NOT EXISTS idx_material_pdf_modulo ON material_pdf(modulo_id);

ALTER TABLE material_pdf ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_preguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preguntas_select_authenticated" ON preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "preguntas_insert_facilitador" ON preguntas FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
CREATE POLICY "preguntas_update_facilitador" ON preguntas FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
CREATE POLICY "preguntas_delete_facilitador" ON preguntas FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

CREATE POLICY "respuestas_select_authenticated" ON respuestas_preguntas FOR SELECT USING (auth.uid() = user_id OR public.get_my_role() IN ('decano', 'facilitador', 'developer'));
CREATE POLICY "respuestas_insert_authenticated" ON respuestas_preguntas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "respuestas_update_authenticated" ON respuestas_preguntas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "respuestas_delete_authenticated" ON respuestas_preguntas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "material_pdf_select_authenticated" ON material_pdf FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "material_pdf_insert_facilitador" ON material_pdf FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
CREATE POLICY "material_pdf_update_facilitador" ON material_pdf FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
CREATE POLICY "material_pdf_delete_facilitador" ON material_pdf FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- 1.10 RUTAS DE APRENDIZAJE
CREATE TABLE IF NOT EXISTS rutas_aprendizaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN ('gerentes', 'coordinadores', 'administrativos', 'operadores')),
  color TEXT DEFAULT '#1B4332',
  duracion_estimada TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 CURSOS EN RUTAS (relacion N:N)
CREATE TABLE IF NOT EXISTS ruta_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES rutas_aprendizaje(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  etapa TEXT,
  UNIQUE(ruta_id, curso_id)
);

-- 1.10 PROGRESO DE RUTAS
CREATE TABLE IF NOT EXISTS progreso_rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ruta_id UUID NOT NULL REFERENCES rutas_aprendizaje(id) ON DELETE CASCADE,
  curso_actual_id UUID REFERENCES cursos(id),
  porcentaje INTEGER DEFAULT 0,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  UNIQUE(user_id, ruta_id)
);

-- 1.10B UNIDADES ORGANIZACIONALES (Direcciones, Gerencias, Departamentos)
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

-- 1.11 CARGOS
CREATE TABLE IF NOT EXISTS cargos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT DEFAULT 'operadores',
  unidad_id UUID REFERENCES unidades_organizacionales(id) ON DELETE SET NULL,
  jefe_id TEXT REFERENCES cargos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 ELEMENTOS DE CARGO
CREATE TABLE IF NOT EXISTS cargo_elementos (
  id TEXT PRIMARY KEY,
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'curso' CHECK (tipo IN ('curso', 'taller', 'examen')),
  descripcion TEXT,
  duracion TEXT,
  orden INTEGER DEFAULT 0,
  obligatorio BOOLEAN DEFAULT TRUE,
  curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 2. FUNCIONES
-- ============================================================

-- 2.1 Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.6 Limpiar imágenes de noticias mayores a 30 días
CREATE OR REPLACE FUNCTION public.cleanup_noticias_imagenes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_record RECORD;
  storage_path TEXT;
BEGIN
  FOR pub_record IN
    SELECT id, imagen_url
    FROM publicaciones
    WHERE imagen_url IS NOT NULL
      AND created_at < NOW() - INTERVAL '30 days'
  LOOP
    -- Extraer path del URL de storage
    storage_path := regexp_replace(
      pub_record.imagen_url,
      '.*publicaciones/',
      ''
    );
    storage_path := regexp_replace(storage_path, '\?.*$', '');

    -- Eliminar archivo del storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'publicaciones'
      AND name = storage_path;

    -- Limpiar la referencia en la publicación
    UPDATE publicaciones
    SET imagen_url = NULL
    WHERE id = pub_record.id;
  END LOOP;
END;
$$;

-- 2.2 Contador de modulos en curso
CREATE OR REPLACE FUNCTION update_curso_modulos_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cursos SET modulos_count = modulos_count + 1 WHERE id = NEW.curso_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cursos SET modulos_count = modulos_count - 1 WHERE id = OLD.curso_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Contador de estudiantes en curso
CREATE OR REPLACE FUNCTION update_curso_estudiantes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cursos SET estudiantes_count = estudiantes_count + 1 WHERE id = NEW.curso_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cursos SET estudiantes_count = estudiantes_count - 1 WHERE id = OLD.curso_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2.4 SECURITY DEFINER: leer rol sin circular en RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM profiles WHERE id = auth.uid();
$$;

-- 2.5 Auto-crear perfil al confirmar email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta JSONB;
  user_rol TEXT;
  user_nombre TEXT;
  user_cedula TEXT;
  user_sucursal TEXT;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  user_rol := COALESCE(meta ->> 'rol', 'estudiante');
  user_nombre := COALESCE(meta ->> 'nombre', NEW.email);
  user_cedula := COALESCE(meta ->> 'cedula', '');
  user_sucursal := COALESCE(meta ->> 'sucursal', '');

  INSERT INTO public.profiles (id, email, nombre, rol, cedula, sucursal, aprobado)
  VALUES (
    NEW.id,
    NEW.email,
    user_nombre,
    user_rol,
    NULLIF(user_cedula, ''),
    NULLIF(user_sucursal, ''),
    user_rol IN ('decano', 'facilitador')
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    cedula = EXCLUDED.cedula,
    sucursal = EXCLUDED.sucursal;

  RETURN NEW;
END;
$$;

-- 1.10 AGENDA DE EVENTOS
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL DEFAULT '09:00',
  hora_fin TIME NOT NULL DEFAULT '10:00',
  categoria TEXT NOT NULL CHECK (categoria IN ('reunion', 'capacitacion', 'tarea', 'evento', 'otro')),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenda_eventos_usuario ON agenda_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_fecha ON agenda_eventos(fecha);

ALTER TABLE agenda_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_select_own" ON agenda_eventos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "agenda_insert_own" ON agenda_eventos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "agenda_update_own" ON agenda_eventos FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "agenda_delete_own" ON agenda_eventos FOR DELETE USING (auth.uid() = usuario_id);

-- 1.10b ETIQUETAS DE EVENTOS (estudiantes etiquetados por facilitadores)
CREATE TABLE IF NOT EXISTS evento_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES agenda_eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_evento_etiquetas_evento ON evento_etiquetas(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_etiquetas_usuario ON evento_etiquetas(usuario_id);

ALTER TABLE evento_etiquetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evento_etiquetas_select_auth" ON evento_etiquetas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "evento_etiquetas_insert_auth" ON evento_etiquetas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "evento_etiquetas_delete_auth" ON evento_etiquetas FOR DELETE USING (auth.role() = 'authenticated');

-- 1.11 NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'general',
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(usuario_id, leido);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_select_own" ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_insert_auth" ON notificaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notificaciones_update_own" ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_delete_own" ON notificaciones FOR DELETE USING (auth.uid() = usuario_id);

-- 1.13 OPINIONES DE CURSOS
CREATE TABLE IF NOT EXISTS opiniones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  user_nombre TEXT NOT NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_opiniones_curso ON opiniones(curso_id);
CREATE INDEX IF NOT EXISTS idx_opiniones_user ON opiniones(user_id);

ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opiniones_select_authenticated" ON opiniones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "opiniones_insert_own" ON opiniones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "opiniones_update_own" ON opiniones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "opiniones_delete_own" ON opiniones
  FOR DELETE USING (auth.uid() = user_id);

-- 1.14 ACTIVIDAD DIARIO DE USUARIO (para rachas)
CREATE TABLE IF NOT EXISTS actividad_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('completo_modulo', 'aprobo_quiz', 'inscribio_curso', 'completo_curso', 'otro')),
  puntos INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fecha, tipo)
);

CREATE INDEX IF NOT EXISTS idx_actividad_usuario_user ON actividad_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario_fecha ON actividad_usuario(user_id, fecha);

ALTER TABLE actividad_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actividad_select_own" ON actividad_usuario
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "actividad_insert_own" ON actividad_usuario
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- 3.1 updated_at en profiles, cursos, rutas
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON cursos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rutas_updated_at
  BEFORE UPDATE ON rutas_aprendizaje
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 Contadores automaticos
CREATE TRIGGER trigger_update_modulos_count
  AFTER INSERT OR DELETE ON modulos
  FOR EACH ROW EXECUTE FUNCTION update_curso_modulos_count();

CREATE TRIGGER trigger_update_estudiantes_count
  AFTER INSERT OR DELETE ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION update_curso_estudiantes_count();

-- 3.3 Auto-crear perfil al registrar usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- -------------------------------------------------
-- 4.1 PROFILES - usa SECURITY DEFINER get_my_role()
-- -------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las politicas viejas de profiles
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
  END LOOP;
END $$;

-- Politicas limpias con funcion segura
CREATE POLICY "p_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "p_select_decano" ON profiles
  FOR SELECT USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "p_select_facilitador" ON profiles
  FOR SELECT USING (public.get_my_role() = 'facilitador');

CREATE POLICY "p_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "p_insert_admin" ON profiles
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

CREATE POLICY "p_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "p_update_decano" ON profiles
  FOR UPDATE USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "p_update_facilitador" ON profiles
  FOR UPDATE USING (public.get_my_role() = 'facilitador');

CREATE POLICY "p_delete_decano" ON profiles
  FOR DELETE USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "p_delete_facilitador" ON profiles
  FOR DELETE USING (public.get_my_role() = 'facilitador');

-- -------------------------------------------------
-- 4.2 CURSOS
-- -------------------------------------------------
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cursos_select_aprobados"
  ON cursos FOR SELECT
  USING (estado = 'aprobado');

CREATE POLICY "cursos_select_facilitador"
  ON cursos FOR SELECT
  USING (facilitador_id = auth.uid());

CREATE POLICY "cursos_select_decano"
  ON cursos FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "cursos_insert_facilitador"
  ON cursos FOR INSERT
  WITH CHECK (public.get_my_role() = 'facilitador');

CREATE POLICY "cursos_update_facilitador"
  ON cursos FOR UPDATE
  USING (facilitador_id = auth.uid());

CREATE POLICY "cursos_update_decano"
  ON cursos FOR UPDATE
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "cursos_delete_facilitador"
  ON cursos FOR DELETE
  USING (facilitador_id = auth.uid());

-- -------------------------------------------------
-- 4.3 MODULOS
-- -------------------------------------------------
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modulos_select_aprobados"
  ON modulos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND estado = 'aprobado')
  );

CREATE POLICY "modulos_select_facilitador"
  ON modulos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND facilitador_id = auth.uid())
  );

CREATE POLICY "modulos_select_decano"
  ON modulos FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "modulos_all_facilitador"
  ON modulos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND facilitador_id = auth.uid())
  );

-- -------------------------------------------------
-- 4.4 PREGUNTAS
-- -------------------------------------------------
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preguntas_select_aprobados"
  ON preguntas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modulos m JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = modulo_id AND c.estado = 'aprobado'
    )
  );

CREATE POLICY "preguntas_select_facilitador"
  ON preguntas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modulos m JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = modulo_id AND c.facilitador_id = auth.uid()
    )
  );

CREATE POLICY "preguntas_select_decano"
  ON preguntas FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "preguntas_all_facilitador"
  ON preguntas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM modulos m JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = modulo_id AND c.facilitador_id = auth.uid()
    )
  );

-- -------------------------------------------------
-- 4.5 INSCRIPCIONES
-- -------------------------------------------------
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inscripciones_select_own"
  ON inscripciones FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "inscripciones_select_facilitador"
  ON inscripciones FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND facilitador_id = auth.uid())
  );

CREATE POLICY "inscripciones_select_decano"
  ON inscripciones FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "inscripciones_insert_own"
  ON inscripciones FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND estado = 'aprobado')
  );

CREATE POLICY "inscripciones_update_own"
  ON inscripciones FOR UPDATE
  USING (user_id = auth.uid());

-- -------------------------------------------------
-- 4.6 PROGRESO DE MODULOS
-- -------------------------------------------------
ALTER TABLE progreso_modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progreso_select_own"
  ON progreso_modulos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "progreso_select_facilitador"
  ON progreso_modulos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND facilitador_id = auth.uid())
  );

CREATE POLICY "progreso_select_decano"
  ON progreso_modulos FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "progreso_insert_own"
  ON progreso_modulos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "progreso_update_own"
  ON progreso_modulos FOR UPDATE
  USING (user_id = auth.uid());

-- -------------------------------------------------
-- 4.7 CERTIFICADOS
-- -------------------------------------------------
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificados_select_own"
  ON certificados FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "certificados_select_decano"
  ON certificados FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "certificados_select_facilitador"
  ON certificados FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cursos WHERE id = curso_id AND facilitador_id = auth.uid())
  );

CREATE POLICY "certificados_select_publico"
  ON certificados FOR SELECT
  USING (true);

CREATE POLICY "certificados_insert_sistema"
  ON certificados FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------
-- 4.8 RUTAS DE APRENDIZAJE
-- -------------------------------------------------
ALTER TABLE rutas_aprendizaje ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rutas_select_activas"
  ON rutas_aprendizaje FOR SELECT
  USING (activa = true);

CREATE POLICY "rutas_all_decano"
  ON rutas_aprendizaje FOR ALL
  USING (public.get_my_role() IN ('decano', 'developer'));

-- -------------------------------------------------
-- 4.9 RUTA_CURSOS
-- -------------------------------------------------
ALTER TABLE ruta_cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ruta_cursos_select_activas"
  ON ruta_cursos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM rutas_aprendizaje WHERE id = ruta_id AND activa = true)
  );

CREATE POLICY "ruta_cursos_all_decano"
  ON ruta_cursos FOR ALL
  USING (public.get_my_role() IN ('decano', 'developer'));

-- -------------------------------------------------
-- 4.10 PROGRESO DE RUTAS
-- -------------------------------------------------
ALTER TABLE progreso_rutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progreso_rutas_select_own"
  ON progreso_rutas FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "progreso_rutas_select_decano"
  ON progreso_rutas FOR SELECT
  USING (public.get_my_role() IN ('decano', 'developer'));

CREATE POLICY "progreso_rutas_insert_own"
  ON progreso_rutas FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "progreso_rutas_update_own"
  ON progreso_rutas FOR UPDATE
  USING (user_id = auth.uid());

-- -------------------------------------------------
-- 4.10B UNIDADES ORGANIZACIONALES
-- -------------------------------------------------
ALTER TABLE unidades_organizacionales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unidades_select_authenticated"
  ON unidades_organizacionales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "unidades_all_admin"
  ON unidades_organizacionales FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- -------------------------------------------------
-- 4.11 CARGOS
-- -------------------------------------------------
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cargos_select_authenticated"
  ON cargos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cargos_all_admin"
  ON cargos FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- -------------------------------------------------
-- 4.12 CARGO_ELEMENTOS
-- -------------------------------------------------
ALTER TABLE cargo_elementos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cargo_elementos_select_authenticated"
  ON cargo_elementos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cargo_elementos_all_admin"
  ON cargo_elementos FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));


-- 1.13 EVALUACIONES DE TALLERES
CREATE TABLE IF NOT EXISTS evaluacion_talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id TEXT NOT NULL REFERENCES cargo_elementos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  facilitador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  aprobado BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(taller_id, user_id)
);

ALTER TABLE evaluacion_talleres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eval_talleres_select_own"
  ON evaluacion_talleres FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "eval_talleres_select_facilitador"
  ON evaluacion_talleres FOR SELECT
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

CREATE POLICY "eval_talleres_insert_facilitador"
  ON evaluacion_talleres FOR INSERT
  WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer') AND facilitador_id = auth.uid());

CREATE POLICY "eval_talleres_update_facilitador"
  ON evaluacion_talleres FOR UPDATE
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer') AND facilitador_id = auth.uid());

CREATE POLICY "eval_talleres_delete_facilitador"
  ON evaluacion_talleres FOR DELETE
  USING (public.get_my_role() IN ('decano', 'facilitador', 'developer') AND facilitador_id = auth.uid());


-- ============================================================
-- 5. INDICES PARA RENDIMIENTO
-- ============================================================

-- 1.15 PUBLICACIONES (Muro de Noticias)
CREATE TABLE IF NOT EXISTS publicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  enlace_url TEXT,
  enlace_titulo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publicaciones_autor ON publicaciones(autor_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_fecha ON publicaciones(created_at DESC);

ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publicaciones_select_auth" ON publicaciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "publicaciones_insert_facilitador" ON publicaciones
  FOR INSERT WITH CHECK (
    public.get_my_role() IN ('decano', 'facilitador', 'developer')
    AND autor_id = auth.uid()
  );

CREATE POLICY "publicaciones_delete_own" ON publicaciones
  FOR DELETE USING (
    autor_id = auth.uid() OR public.get_my_role() IN ('decano', 'developer')
  );

-- 1.16 REACCIONES
CREATE TABLE IF NOT EXISTS reacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('me_gusta', 'me_encanta', 'me_enoja', 'me_entristece', 'me_divierte', 'estoy_confundido')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(publicacion_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_reacciones_publicacion ON reacciones(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario ON reacciones(usuario_id);

ALTER TABLE reacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reacciones_select_auth" ON reacciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "reacciones_insert_own" ON reacciones
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "reacciones_delete_own" ON reacciones
  FOR DELETE USING (usuario_id = auth.uid());

-- 1.17 ENCUESTAS
CREATE TABLE IF NOT EXISTS encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  multiple BOOLEAN DEFAULT FALSE,
  cerrada BOOLEAN DEFAULT FALSE,
  fecha_cierre TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encuestas_publicacion ON encuestas(publicacion_id);

ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encuestas_select_auth" ON encuestas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "encuestas_insert_facilitador" ON encuestas
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- 1.18 OPCIONES DE ENCUESTA
CREATE TABLE IF NOT EXISTS encuesta_opciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encuesta_opciones_encuesta ON encuesta_opciones(encuesta_id);

ALTER TABLE encuesta_opciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encuesta_opciones_select_auth" ON encuesta_opciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "encuesta_opciones_insert_facilitador" ON encuesta_opciones
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- 1.19 VOTOS DE ENCUESTA
CREATE TABLE IF NOT EXISTS encuesta_votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  opcion_id UUID NOT NULL REFERENCES encuesta_opciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(encuesta_id, usuario_id, opcion_id)
);

CREATE INDEX IF NOT EXISTS idx_encuesta_votos_encuesta ON encuesta_votos(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_votos_usuario ON encuesta_votos(usuario_id);

ALTER TABLE encuesta_votos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encuesta_votos_select_auth" ON encuesta_votos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "encuesta_votos_insert_own" ON encuesta_votos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "encuesta_votos_delete_own" ON encuesta_votos
  FOR DELETE USING (usuario_id = auth.uid());

-- ============================================================
-- 1.20 COMPETENCIAS
-- ============================================================

CREATE TABLE IF NOT EXISTS competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cargo_competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  competencia_id UUID NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  nivel_requerido INTEGER DEFAULT 3 CHECK (nivel_requerido BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cargo_id, competencia_id)
);

ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_competencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competencias_select_all" ON competencias;
CREATE POLICY "competencias_select_all" ON competencias FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "competencias_insert_admin" ON competencias;
CREATE POLICY "competencias_insert_admin" ON competencias FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "competencias_update_admin" ON competencias;
CREATE POLICY "competencias_update_admin" ON competencias FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "competencias_delete_admin" ON competencias;
CREATE POLICY "competencias_delete_admin" ON competencias FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "cargo_competencias_select_all" ON cargo_competencias;
CREATE POLICY "cargo_competencias_select_all" ON cargo_competencias FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "cargo_competencias_insert_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_insert_admin" ON cargo_competencias FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "cargo_competencias_update_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_update_admin" ON cargo_competencias FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "cargo_competencias_delete_admin" ON cargo_competencias;
CREATE POLICY "cargo_competencias_delete_admin" ON cargo_competencias FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

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
-- 1.21 TESTS PSICOLÓGICOS
-- ============================================================

CREATE TABLE IF NOT EXISTS tests_psicologicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('cuestionario', 'proyectivo')),
  duracion_minutos INTEGER,
  instrucciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preguntas_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests_psicologicos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  tipo_respuesta TEXT NOT NULL DEFAULT 'escala' CHECK (tipo_respuesta IN ('escala', 'texto', 'opcion_multiple', 'dibujo')),
  opciones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS respuestas_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests_psicologicos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado')),
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

CREATE TABLE IF NOT EXISTS detalles_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respuesta_id UUID NOT NULL REFERENCES respuestas_tests(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES preguntas_tests(id) ON DELETE CASCADE,
  valor TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(respuesta_id, pregunta_id)
);

CREATE TABLE IF NOT EXISTS resultados_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respuesta_id UUID NOT NULL REFERENCES respuestas_tests(id) ON DELETE CASCADE,
  interpretacion TEXT,
  puntuacion JSONB,
  creado_por UUID REFERENCES profiles(id),
  fecha_interpretacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tests_psicologicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tests_select_all" ON tests_psicologicos;
CREATE POLICY "tests_select_all" ON tests_psicologicos FOR SELECT USING (activo = TRUE);
DROP POLICY IF EXISTS "preguntas_select_all" ON preguntas_tests;
CREATE POLICY "preguntas_select_all" ON preguntas_tests FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "respuestas_select_own" ON respuestas_tests;
CREATE POLICY "respuestas_select_own" ON respuestas_tests FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "respuestas_select_profesional" ON respuestas_tests;
CREATE POLICY "respuestas_select_profesional" ON respuestas_tests FOR SELECT USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "respuestas_insert_own" ON respuestas_tests;
CREATE POLICY "respuestas_insert_own" ON respuestas_tests FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "respuestas_update_own" ON respuestas_tests;
CREATE POLICY "respuestas_update_own" ON respuestas_tests FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "detalles_select_own" ON detalles_respuestas;
CREATE POLICY "detalles_select_own" ON detalles_respuestas FOR SELECT USING (respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "detalles_insert_own" ON detalles_respuestas;
CREATE POLICY "detalles_insert_own" ON detalles_respuestas FOR INSERT WITH CHECK (respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "detalles_update_own" ON detalles_respuestas;
CREATE POLICY "detalles_update_own" ON detalles_respuestas FOR UPDATE USING (respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "resultados_select_own" ON resultados_tests;
CREATE POLICY "resultados_select_own" ON resultados_tests FOR SELECT USING (respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "resultados_select_profesional" ON resultados_tests;
CREATE POLICY "resultados_select_profesional" ON resultados_tests FOR SELECT USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "resultados_insert_profesional" ON resultados_tests;
CREATE POLICY "resultados_insert_profesional" ON resultados_tests FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));
DROP POLICY IF EXISTS "resultados_update_profesional" ON resultados_tests;
CREATE POLICY "resultados_update_profesional" ON resultados_tests FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('Test Moss', 'Cuestionario de valores y actitudes en el trabajo', 'cuestionario', 30, 'Responde cada pregunta seleccionando la opción que mejor describa lo que harías en esa situación.'),
  ('Figura Humana Bajo la Lluvia', 'Test proyectivo de dibujo', 'proyectivo', 15, 'Dibuja una figura humana bajo la lluvia. No hay tiempo límite.'),
  ('Wartegg', 'Test proyectivo de completamiento de figuras', 'proyectivo', 20, 'Completa los 8 campos con dibujos que surjan de tu imaginación.'),
  ('16 PF', 'Cuestionario de 16 factores de personalidad', 'cuestionario', 45, 'Responde cada pregunta indicando si es verdadera (V) o falsa (F).'),
  ('Test Zavic', 'Cuestionario de valores y actitudes', 'cuestionario', 25, 'Responde cada pregunta seleccionando la opción que mejor te represente.')
ON CONFLICT DO NOTHING;

-- Preguntas Test Moss (30)
DO $$ DECLARE moss_test_id UUID; BEGIN
  SELECT id INTO moss_test_id FROM tests_psicologicos WHERE nombre = 'Test Moss' LIMIT 1;
  IF moss_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones)
    SELECT moss_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones FROM (VALUES
      ('Se le ha asignado un puesto en una gran empresa. La mejor forma de establecer relaciones amistosas y cordiales con sus nuevos compañeros será:', 1, '["Evitando tomar nota de los errores en que incurran", "Hablando bien de ellos al jefe", "Mostrando interés en el trabajo de ellos", "Pidiéndoles les permitan hacer los trabajos que usted puede hacer mejor"]'::jsonb),
      ('Tiene usted un empleado muy eficiente pero que constantemente se queja del trabajo, sus quejas producen mal efecto en los demás empleados, lo mejor sería:', 2, '["Pedir a los demás empleados que no hagan caso", "Averiguar la causa de esa actitud y procurar su modificación", "Cambiarlo de departamento donde quede a cargo de otro jefe", "Permitirle planear lo más posible acerca de su trabajo"]'::jsonb),
      ('Un empleado de 60 años de edad que ha sido leal a la empresa durante 25 años se queja del exceso de trabajo. Lo mejor sería:', 3, '["Decirle que vuelva a su trabajo porque si no será desvinculado", "Despedirlo, substituyéndolo por alguien más joven", "Darle un aumento de sueldo que evite que continúe quejándose", "Aminorar su trabajo"]'::jsonb),
      ('Uno de los socios, sin autoridad sobre usted le ordena haga algo en forma bien distinta de lo que planeaba. ¿Qué haría usted?', 4, '["Acatar la orden y no armar mayor revuelo", "Ignorar las indicaciones y hacerlo según había planeado", "Decirle que esto no es asunto que a usted le interesa y que usted hará las cosas a su modo", "Decirle que lo haga él mismo"]'::jsonb),
      ('Usted visita a un amigo íntimo que ha estado enfermo por algún tiempo. Lo mejor sería:', 5, '["Platicarle sus diversiones recientes", "Platicarle nuevas cosas referentes a sus amigos mutuos", "Comentar su enfermedad", "Enfatizar lo mucho que le apena verle enfermo"]'::jsonb),
      ('Trabaja usted en una industria y su jefe quiere que tome un curso relacionado con su carrera pero que sea compatible con el horario de su trabajo. Lo mejor sería:', 6, '["Continuar normalmente su carrera e informar al jefe sí pregunta", "Explicar la situación u obtener su opinión en cuanto a la importancia relativa de ambas situaciones", "Dejar la escuela en relación a los intereses del trabajo", "Asistir en forma alterna y no hacer comentarios"]'::jsonb),
      ('Un agente viajero con 15 años de antigüedad decide, presionado por su familia sentar raíces. Se le cambia a las oficinas generales. Es de esperar que:', 7, '["Guste de los descansos del trabajo de oficina", "Se sienta inquieto por la rutina de la oficina", "Busque otro trabajo", "Resulte muy ineficiente en el trabajo de oficina"]'::jsonb),
      ('Tiene dos invitados a cenar, el uno radical y el otro conservador. Surge una acalorada discusión respecto a la política. Lo mejor sería:', 8, '["Tomar partido", "Intentar cambiar de tema", "Intervenir dando los propios puntos de vista y mostrar donde ambos pecan de extremosos", "Pedir cambien de tema para evitar mayor discusión"]'::jsonb),
      ('Un joven invita a una dama al teatro, al llegar se percata de que ha olvidado la cartera. Sería mejor:', 9, '["Tratar de obtener boletos dejando el reloj en prenda", "Buscar a algún amigo a quien pedir prestado", "Decidir de acuerdo con ella lo procedente", "Dar una excusa plausible para ir a casa por dinero"]'::jsonb),
      ('Usted ha tenido experiencia como vendedor y acaba de conseguir de una tienda un empleo. La mejor forma de relacionarse con los empleados del departamento sería:', 10, '["Permitirle hacer la mayoría de las ventas por unos días en tanto observa sus métodos", "Tratar de instituir los métodos que anteriormente le fueron útiles", "Adaptarse mejor a las condiciones y aceptar consejos de sus compañeros", "Pedir al jefe todo el consejo necesario"]'::jsonb),
      ('Es usted un joven empleado que va a comer con una maestra a quien conoce superficialmente. Lo mejor sería iniciar la conversación acerca de:', 11, '["Algún tópico de actualidad", "Algún aspecto interesante de su propio trabajo", "Las tendencias actuales en el terreno docente", "Las sociedades de padres de familia"]'::jsonb),
      ('Una señora de especiales méritos que por largo tiempo ha dirigido trabajos benéficos dejando las labores de su casa a cargo de la servidumbre, se cambia a otra población. Es de esperarse que ella:', 12, '["Se sienta insatisfecha de su nuevo hogar", "Se interese más por los trabajos domésticos", "Intervenga poco a poco en la vida de la comunidad, continuando así sus intereses", "Adopte nuevos intereses en la nueva comunidad"]'::jsonb),
      ('Quiere pedirle un favor a un conocido con quien tiene poca confianza. La mejor forma de lograrlo sería:', 13, '["Haciéndole creer que será él quien se beneficie más", "Enfatice la importancia que para usted tiene que se le conceda", "Ofrecer algo de retribución", "Decir que lo que desea en forma breve indicando los motivos"]'::jsonb),
      ('Un joven de 24 años gasta bastante tiempo y dinero en diversiones, solo ha hecho ver que así no logrará al éxito en el trabajo. Probablemente cambie sus costumbres. Si:', 14, '["Sus hábitos nocturnos lesionan su salud", "Sus amigos enfatizan el daño que se hace a sí mismo", "Su jefe se da cuenta y lo previene", "Se interesa en el desarrollo de alguna fase de su trabajo"]'::jsonb),
      ('Tras de haber hecho un buen número de favores a un amigo, este empieza a dar por hecho que usted será quien le resuelva todas sus pequeñas dificultades. La mejor forma de readaptar la situación sin ofenderle sería:', 15, '["Explicar el daño que se está causando", "Pedir a un amigo mutuo que trate de arreglar las cosas", "Ayudarle una vez más pero de tal manera que sienta que mejor hubiera sido no haberlo solicitado", "Darle una excusa para no seguir ayudándole"]'::jsonb),
      ('Una persona recién ascendida a un mejor puesto de autoridad lograría mejor sus metas y la buena voluntad de los empleados:', 16, '["Tratando de que cada empleado entienda qué es la verdadera eficiencia", "Ascendiendo cuanto antes a quienes considere lo merezcan", "Preguntando confidencialmente a cada empleado en cuanto a los cambios que estiman necesarios", "Seguir los sistemas del anterior jefe y gradualmente hacer los cambios necesarios"]'::jsonb),
      ('Vive a 15 km. del centro y ha ofrecido llevar de regreso a un amigo a las 16:00 p.m. él lo espera desde las 15:00 y a las 16:00 horas usted se entera que no podrá salir antes de las 17:30, sería mejor:', 17, '["Pedirle un taxi", "Explicarle y dejar que él decida", "Pedirle que espere hasta las 17:30 horas", "Proponerle que se lleve su auto"]'::jsonb),
      ('Es usted un ejecutivo y dos de sus empleados se llevan mal, ambos son eficientes. Lo mejor sería:', 18, '["Despedir al menos eficiente", "Dar trabajo en común que a ambos interese", "Hacerles ver el daño que se hacen", "Darles trabajos distintos"]'::jsonb),
      ('El señor González ha estado conservando su puesto subordinado por 10 años. De obtener el trabajo en otra empresa, muy probablemente:', 19, '["Asuma fácilmente responsabilidad como supervisor", "Haga ver de inmediato su valor", "Sea lento para abrirse las necesarias oportunidades", "Renuncie ante la más ligera crítica de su trabajo"]'::jsonb),
      ('Va usted a ser maestro de ceremonias, en una cena el próximo sábado día en que por la mañana, debido a enfermedad de su familia, se ve imposibilitado para asistir lo mejor sería:', 20, '["Cancelar la cena", "Encontrar quien lo sustituya", "Detallar los planes que tenía y evitarlos", "Enviar una nota explicando la causa de su ausencia"]'::jsonb),
      ('En igualdad de circunstancias el empleado que mejor se adapta a un nuevo puesto es aquel que:', 21, '["Ha sido bueno en puestos anteriores", "Ha tenido éxito durante 10 años en su puesto", "Tiene sus propias ideas e invariablemente se rige por ellas", "Cuenta con una buena recomendación de su jefe anterior"]'::jsonb),
      ('Un conocido le platica acerca de una afición que él tiene, su conversación le aburre. Lo mejor sería:', 22, '["Escuchar de manera cortés, pero aburrida", "Escuchar con fingido interés", "Decirle francamente que el tema no le interesa", "Mirar el reloj con impaciencia"]'::jsonb),
      ('Es usted un empleado ordinario en una oficina grande. El jefe entra cuando usted lee en vez de trabajar. Lo mejor sería:', 23, '["Doblar el periódico y volver a trabajo", "Pretender que obtiene recortes necesarios al trabajo", "Tratar de interesar al jefe leyéndole un encabezado importante", "Seguir leyendo sin mostrar embarazo"]'::jsonb),
      ('Es usted un maestro de primaria. Camino a la escuela tras de la primera nevada, algunos de sus alumnos lanzan bolas de nieve. Usted debería:', 24, '["Castigarle ahí mismo por su indisciplina", "Decirles que de volverlo a hacer los castigará", "Pasar la queja a sus padres", "Tomarlo como broma y no hacer caso al respecto"]'::jsonb),
      ('Preside el Comité de Mejoras Materiales en su colonia; las últimas reuniones han sido de escasa asistencia. Se mejoraría la asistencia:', 25, '["Visitando vecinos prominentes explicándoles los problemas", "Avisar de un programa interesante para la reunión", "Poner avisos en los lugares públicos", "Enviar avisos personales"]'::jsonb),
      ('Salinas, eficiente, pero de esos que "todo lo saben", critica a Montoya, el jefe opina que la idea de Montoya ahorra tiempo. Probablemente Salinas:', 26, '["Pida otro trabajo al jefe", "Lo haga a su modo sin comentarios", "Lo haga con Montoya, pero siga criticándolo", "Lo haga con Montoya, pero mal a propósito"]'::jsonb),
      ('Un hombre de 64 años tuvo algún éxito cuando joven como político, sus modos directos le han impedido descollar los últimos 20 años, lo más probable es que:', 27, '["Persista en su manera de ser", "Cambie para lograr éxito", "Forme un nuevo partido político", "Abandone la política por inmoral"]'::jsonb),
      ('Es usted un joven que encuentra en la calle a una mujer de más edad a quien apenas conoce y que parece haber estado llorando. Lo mejor sería:', 28, '["Preguntarle por qué está triste", "Pasarle el brazo por el hombro y consolarla", "Simular no advertir su pena", "Simular no haberla visto"]'::jsonb),
      ('Un compañero flojea de tal manera que usted le toca más de lo que le corresponde. La mejor forma de conservar las relaciones sería:', 29, '["Explicar el caso al jefe cortésmente", "Cortésmente indicarle que debe hacer lo que le corresponde o que usted se quejara con el jefe", "Hacer tanto como pueda eficientemente y no decir nada del caso al jefe", "Hacer lo suyo y dejar pendiente lo que el compañero no haga"]'::jsonb),
      ('Se le ha asignado un puesto ejecutivo. Para ganar el respeto y la admiración de sus subordinados habría que:', 30, '["Ceder en todos los pequeños puntos posibles", "Tratar de convencerlos de todas sus ideas", "Ceder parcialmente en todas las cuestiones importantes", "Abogar por muchas reformas"]'::jsonb)
    ) AS t(texto, orden, opciones) WHERE NOT EXISTS (SELECT 1 FROM preguntas_tests p WHERE p.test_id = moss_test_id AND p.texto = t.texto);
  END IF;
END $$;

-- Preguntas 16 PF (10)
DO $$ DECLARE pf_test_id UUID; BEGIN
  SELECT id INTO pf_test_id FROM tests_psicologicos WHERE nombre = '16 PF' LIMIT 1;
  IF pf_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones)
    SELECT pf_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones FROM (VALUES
      ('Me gusta hacer amigos nuevos', 1, '["Verdadero", "Falso"]'::jsonb),
      ('Prefiero trabajar solo que en grupo', 2, '["Verdadero", "Falso"]'::jsonb),
      ('Me siento cómodo hablando en público', 3, '["Verdadero", "Falso"]'::jsonb),
      ('Me preocupo mucho por los detalles', 4, '["Verdadero", "Falso"]'::jsonb),
      ('Disfruto tomando decisiones importantes', 5, '["Verdadero", "Falso"]'::jsonb),
      ('Me molesta la gente que no sigue las reglas', 6, '["Verdadero", "Falso"]'::jsonb),
      ('Me adapto fácilmente a los cambios', 7, '["Verdadero", "Falso"]'::jsonb),
      ('Prefiero seguir instrucciones claras', 8, '["Verdadero", "Falso"]'::jsonb),
      ('Me siento energizado después de socializar', 9, '["Verdadero", "Falso"]'::jsonb),
      ('Analizo las situaciones antes de actuar', 10, '["Verdadero", "Falso"]'::jsonb)
    ) AS t(texto, orden, opciones) WHERE NOT EXISTS (SELECT 1 FROM preguntas_tests p WHERE p.test_id = pf_test_id AND p.texto = t.texto);
  END IF;
END $$;

-- Preguntas Zavic (10)
DO $$ DECLARE zavic_test_id UUID; BEGIN
  SELECT id INTO zavic_test_id FROM tests_psicologicos WHERE nombre = 'Test Zavic' LIMIT 1;
  IF zavic_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones)
    SELECT zavic_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones FROM (VALUES
      ('Me siento motivado cuando tengo metas claras', 1, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Valoro el trabajo en equipo por encima del individual', 2, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Busco constantemente aprender cosas nuevas', 3, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Prefiero tareas que requieren creatividad', 4, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me siento satisfecho cuando ayudo a otros', 5, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me importa más la calidad que la cantidad', 6, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Disfruto asumir responsabilidades de liderazgo', 7, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Prefiero un ambiente de trabajo estructurado', 8, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me motiva el reconocimiento de mis logros', 9, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Valoro la estabilidad laboral por encima de todo', 10, '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb)
    ) AS t(texto, orden, opciones) WHERE NOT EXISTS (SELECT 1 FROM preguntas_tests p WHERE p.test_id = zavic_test_id AND p.texto = t.texto);
  END IF;
END $$;

-- ============================================================
-- 1.22 IMAGEN PORTADA CURSOS + ANCLADO PUBLICACIONES
-- ============================================================

ALTER TABLE cursos ADD COLUMN IF NOT EXISTS imagen_portada TEXT;
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS anclado_hasta TIMESTAMPTZ;
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS sucursales_destino TEXT[] DEFAULT '{}';

-- ============================================================
-- 5. INDICES PARA RENDIMIENTO
-- ============================================================
CREATE INDEX idx_cursos_facilitador ON cursos(facilitador_id);
CREATE INDEX idx_cursos_nivel ON cursos USING gin(nivel);
CREATE INDEX idx_modulos_curso ON modulos(curso_id);
CREATE INDEX idx_modulos_orden ON modulos(curso_id, orden);
CREATE INDEX idx_preguntas_modulo ON preguntas(modulo_id);
CREATE INDEX idx_inscripciones_user ON inscripciones(user_id);
CREATE INDEX idx_inscripciones_curso ON inscripciones(curso_id);
CREATE INDEX idx_progreso_user ON progreso_modulos(user_id);
CREATE INDEX idx_progreso_curso ON progreso_modulos(curso_id);
CREATE INDEX idx_certificados_user ON certificados(user_id);
CREATE INDEX idx_certificados_cert_id ON certificados(cert_id);
CREATE INDEX idx_ruta_cursos_ruta ON ruta_cursos(ruta_id);
CREATE INDEX idx_cargos_nombre ON cargos(nombre);
CREATE INDEX idx_cargos_unidad ON cargos(unidad_id);
CREATE INDEX idx_cargos_jefe ON cargos(jefe_id);
CREATE INDEX idx_unidades_parent ON unidades_organizacionales(parent_id);
CREATE INDEX idx_cargo_elementos_cargo ON cargo_elementos(cargo_id);
CREATE INDEX idx_competencias_nombre ON competencias(nombre);
CREATE INDEX idx_cargo_competencias_cargo ON cargo_competencias(cargo_id);
CREATE INDEX idx_cargo_competencias_competencia ON cargo_competencias(competencia_id);
CREATE INDEX idx_preguntas_test ON preguntas_tests(test_id);
CREATE INDEX idx_respuestas_user ON respuestas_tests(user_id);
CREATE INDEX idx_respuestas_test ON respuestas_tests(test_id);
CREATE INDEX idx_detalles_respuesta ON detalles_respuestas(respuesta_id);
CREATE INDEX idx_resultados_respuesta ON resultados_tests(respuesta_id);
