-- Simular que un facilitador ganó la insignia "Creador I"
-- Las noticias del sistema usan es_sistema = true para mostrar "Academia Luxor"

DO $$
DECLARE
  v_insignia_id UUID;
  v_facilitador_id UUID;
  v_facilitador_nombre TEXT;
  v_insignia_nombre TEXT;
BEGIN
  -- Obtener ID de la insignia
  SELECT id, nombre INTO v_insignia_id, v_insignia_nombre
  FROM insignias
  WHERE nombre ILIKE '%creador%' AND activa = true
  LIMIT 1;

  -- Si no existe, crearla
  IF v_insignia_id IS NULL THEN
    INSERT INTO insignias (nombre, descripcion, parametro, umbral, xp, color, activa)
    VALUES ('Creador I', 'Ha creado su primer curso', 'cursos_creados', 1, 50, '#6366f1', true)
    RETURNING id, nombre INTO v_insignia_id, v_insignia_nombre;
  END IF;

  -- Obtener un facilitador de prueba
  SELECT id, nombre INTO v_facilitador_id, v_facilitador_nombre
  FROM profiles
  WHERE rol = 'facilitador'
  LIMIT 1;

  -- Insertar la insignia ganada
  IF v_facilitador_id IS NOT NULL THEN
    INSERT INTO insignias_facilitadores (insignia_id, user_id)
    VALUES (v_insignia_id, v_facilitador_id)
    ON CONFLICT (insignia_id, user_id) DO NOTHING;

    -- Crear la noticia como sistema (es_sistema = true)
    INSERT INTO publicaciones (autor_id, contenido, imagen_url, tipo, es_sistema)
    SELECT
      v_facilitador_id,
      'Felicidades ' || v_facilitador_nombre || ' has obtenido la insignia "' || v_insignia_nombre || '"',
      i.imagen_url,
      'insignia',
      true
    FROM insignias i
    WHERE i.id = v_insignia_id;

    RAISE NOTICE 'Simulación completada: Academia Luxor anunció que % ganó la insignia %', v_facilitador_nombre, v_insignia_nombre;
  ELSE
    RAISE NOTICE 'No se encontró ningún facilitador';
  END IF;
END $$;
