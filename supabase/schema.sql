-- ============================================================
-- ACADEMIA LUXOR - Schema Completo de Base de Datos
-- Ejecutar TODO este script en Supabase SQL Editor una sola vez
-- ============================================================

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- 1.1 PERFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('decano', 'facilitador', 'estudiante')),
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
CREATE POLICY "preguntas_insert_facilitador" ON preguntas FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador'));
CREATE POLICY "preguntas_update_facilitador" ON preguntas FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador'));
CREATE POLICY "preguntas_delete_facilitador" ON preguntas FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador'));

CREATE POLICY "respuestas_select_authenticated" ON respuestas_preguntas FOR SELECT USING (auth.uid() = user_id OR public.get_my_role() IN ('decano', 'facilitador'));
CREATE POLICY "respuestas_insert_authenticated" ON respuestas_preguntas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "respuestas_update_authenticated" ON respuestas_preguntas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "respuestas_delete_authenticated" ON respuestas_preguntas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "material_pdf_select_authenticated" ON material_pdf FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "material_pdf_insert_facilitador" ON material_pdf FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador'));
CREATE POLICY "material_pdf_update_facilitador" ON material_pdf FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador'));
CREATE POLICY "material_pdf_delete_facilitador" ON material_pdf FOR DELETE USING (public.get_my_role() IN ('decano', 'facilitador'));

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

-- 1.11 CARGOS
CREATE TABLE IF NOT EXISTS cargos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT DEFAULT 'operadores',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 ELEMENTOS DE CARGO
CREATE TABLE IF NOT EXISTS cargo_elementos (
  id TEXT PRIMARY KEY,
  cargo_id TEXT NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
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
  FOR SELECT USING (public.get_my_role() = 'decano');

CREATE POLICY "p_select_facilitador" ON profiles
  FOR SELECT USING (public.get_my_role() = 'facilitador');

CREATE POLICY "p_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "p_insert_admin" ON profiles
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador'));

CREATE POLICY "p_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "p_update_decano" ON profiles
  FOR UPDATE USING (public.get_my_role() = 'decano');

CREATE POLICY "p_update_facilitador" ON profiles
  FOR UPDATE USING (public.get_my_role() = 'facilitador');

CREATE POLICY "p_delete_decano" ON profiles
  FOR DELETE USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

CREATE POLICY "cursos_insert_facilitador"
  ON cursos FOR INSERT
  WITH CHECK (public.get_my_role() = 'facilitador');

CREATE POLICY "cursos_update_facilitador"
  ON cursos FOR UPDATE
  USING (facilitador_id = auth.uid());

CREATE POLICY "cursos_update_decano"
  ON cursos FOR UPDATE
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

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
  USING (public.get_my_role() = 'decano');

-- -------------------------------------------------
-- 4.10 PROGRESO DE RUTAS
-- -------------------------------------------------
ALTER TABLE progreso_rutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progreso_rutas_select_own"
  ON progreso_rutas FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "progreso_rutas_select_decano"
  ON progreso_rutas FOR SELECT
  USING (public.get_my_role() = 'decano');

CREATE POLICY "progreso_rutas_insert_own"
  ON progreso_rutas FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "progreso_rutas_update_own"
  ON progreso_rutas FOR UPDATE
  USING (user_id = auth.uid());

-- -------------------------------------------------
-- 4.11 CARGOS
-- -------------------------------------------------
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cargos_select_authenticated"
  ON cargos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cargos_all_admin"
  ON cargos FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador'));

-- -------------------------------------------------
-- 4.12 CARGO_ELEMENTOS
-- -------------------------------------------------
ALTER TABLE cargo_elementos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cargo_elementos_select_authenticated"
  ON cargo_elementos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cargo_elementos_all_admin"
  ON cargo_elementos FOR ALL
  USING (public.get_my_role() IN ('decano', 'facilitador'));


-- ============================================================
-- 5. INDICES PARA RENDIMIENTO
-- ============================================================
CREATE INDEX idx_cursos_estado ON cursos(estado);
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
CREATE INDEX idx_cargo_elementos_cargo ON cargo_elementos(cargo_id);
