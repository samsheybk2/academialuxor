-- ============================================================
-- TESTS PSICOLÓGICOS - Schema y Datos Completos
-- ============================================================

-- 1.13 TESTS PSICOLÓGICOS (catálogo)
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

-- 1.14 PREGUNTAS DE TESTS
CREATE TABLE IF NOT EXISTS preguntas_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests_psicologicos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  tipo_respuesta TEXT NOT NULL DEFAULT 'escala' CHECK (tipo_respuesta IN ('escala', 'texto', 'opcion_multiple', 'dibujo')),
  opciones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.15 RESPUESTAS DE TESTS
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

-- 1.16 DETALLES DE RESPUESTAS
CREATE TABLE IF NOT EXISTS detalles_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respuesta_id UUID NOT NULL REFERENCES respuestas_tests(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES preguntas_tests(id) ON DELETE CASCADE,
  valor TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(respuesta_id, pregunta_id)
);

-- 1.17 RESULTADOS DE TESTS
CREATE TABLE IF NOT EXISTS resultados_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respuesta_id UUID NOT NULL REFERENCES respuestas_tests(id) ON DELETE CASCADE,
  interpretacion TEXT,
  puntuacion JSONB,
  creado_por UUID REFERENCES profiles(id),
  fecha_interpretacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POLICIES RLS
-- ============================================================

ALTER TABLE tests_psicologicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tests_select_all" ON tests_psicologicos;
CREATE POLICY "tests_select_all" ON tests_psicologicos
  FOR SELECT USING (activo = TRUE);

DROP POLICY IF EXISTS "preguntas_select_all" ON preguntas_tests;
CREATE POLICY "preguntas_select_all" ON preguntas_tests
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "respuestas_select_own" ON respuestas_tests;
CREATE POLICY "respuestas_select_own" ON respuestas_tests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "respuestas_select_profesional" ON respuestas_tests;
CREATE POLICY "respuestas_select_profesional" ON respuestas_tests
  FOR SELECT USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "respuestas_insert_own" ON respuestas_tests;
CREATE POLICY "respuestas_insert_own" ON respuestas_tests
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "respuestas_update_own" ON respuestas_tests;
CREATE POLICY "respuestas_update_own" ON respuestas_tests
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "detalles_select_own" ON detalles_respuestas;
CREATE POLICY "detalles_select_own" ON detalles_respuestas
  FOR SELECT USING (
    respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "detalles_insert_own" ON detalles_respuestas;
CREATE POLICY "detalles_insert_own" ON detalles_respuestas
  FOR INSERT WITH CHECK (
    respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "detalles_update_own" ON detalles_respuestas;
CREATE POLICY "detalles_update_own" ON detalles_respuestas
  FOR UPDATE USING (
    respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "resultados_select_own" ON resultados_tests;
CREATE POLICY "resultados_select_own" ON resultados_tests
  FOR SELECT USING (
    respuesta_id IN (SELECT id FROM respuestas_tests WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "resultados_select_profesional" ON resultados_tests;
CREATE POLICY "resultados_select_profesional" ON resultados_tests
  FOR SELECT USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "resultados_insert_profesional" ON resultados_tests;
CREATE POLICY "resultados_insert_profesional" ON resultados_tests
  FOR INSERT WITH CHECK (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

DROP POLICY IF EXISTS "resultados_update_profesional" ON resultados_tests;
CREATE POLICY "resultados_update_profesional" ON resultados_tests
  FOR UPDATE USING (public.get_my_role() IN ('decano', 'facilitador', 'developer'));

-- ============================================================
-- DATOS INICIALES - TESTS
-- ============================================================

-- Test Moss
INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('Test Moss', 'Cuestionario de valores y actitudes en el trabajo', 'cuestionario', 30, 
   'Responde cada pregunta seleccionando la opción que mejor describa lo que harías en esa situación. No hay respuestas correctas o incorrectas.')
ON CONFLICT DO NOTHING;

-- Figura Humana Bajo la Lluvia
INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('Figura Humana Bajo la Lluvia', 'Test proyectivo de dibujo', 'proyectivo', 15,
   'Dibuja una figura humana bajo la lluvia. No hay tiempo límite, pero trata de hacerlo en menos de 15 minutos.')
ON CONFLICT DO NOTHING;

-- Wartegg
INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('Wartegg', 'Test proyectivo de completamiento de figuras', 'proyectivo', 20,
   'Completa los 8 campos con dibujos que surjan de tu imaginación. No hay respuestas correctas.')
ON CONFLICT DO NOTHING;

-- 16 PF
INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('16 PF', 'Cuestionario de 16 factores de personalidad', 'cuestionario', 45,
   'Responde cada pregunta indicando si es verdadera (V) o falsa (F) para ti. Sé honesto en tus respuestas.')
ON CONFLICT DO NOTHING;

-- Zavic
INSERT INTO tests_psicologicos (nombre, descripcion, tipo, duracion_minutos, instrucciones) VALUES
  ('Test Zavic', 'Cuestionario de valores y actitudes', 'cuestionario', 25,
   'Responde cada pregunta seleccionando la opción que mejor te represente.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PREGUNTAS TEST MOSS (30 preguntas)
-- ============================================================

DO $$
DECLARE
  moss_test_id UUID;
BEGIN
  SELECT id INTO moss_test_id FROM tests_psicologicos WHERE nombre = 'Test Moss' LIMIT 1;
  
  IF moss_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones) 
    SELECT moss_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones
    FROM (VALUES
      ('Se le ha asignado un puesto en una gran empresa. La mejor forma de establecer relaciones amistosas y cordiales con sus nuevos compañeros será:', 1, 
       '["Evitando tomar nota de los errores en que incurran", "Hablando bien de ellos al jefe", "Mostrando interés en el trabajo de ellos", "Pidiéndoles les permitan hacer los trabajos que usted puede hacer mejor"]'::jsonb),
      ('Tiene usted un empleado muy eficiente pero que constantemente se queja del trabajo, sus quejas producen mal efecto en los demás empleados, lo mejor sería:', 2,
       '["Pedir a los demás empleados que no hagan caso", "Averiguar la causa de esa actitud y procurar su modificación", "Cambiarlo de departamento donde quede a cargo de otro jefe", "Permitirle planear lo más posible acerca de su trabajo"]'::jsonb),
      ('Un empleado de 60 años de edad que ha sido leal a la empresa durante 25 años se queja del exceso de trabajo. Lo mejor sería:', 3,
       '["Decirle que vuelva a su trabajo porque si no será desvinculado", "Despedirlo, substituyéndolo por alguien más joven", "Darle un aumento de sueldo que evite que continúe quejándose", "Aminorar su trabajo"]'::jsonb),
      ('Uno de los socios, sin autoridad sobre usted le ordena haga algo en forma bien distinta de lo que planeaba. ¿Qué haría usted?', 4,
       '["Acatar la orden y no armar mayor revuelo", "Ignorar las indicaciones y hacerlo según había planeado", "Decirle que esto no es asunto que a usted le interesa y que usted hará las cosas a su modo", "Decirle que lo haga él mismo"]'::jsonb),
      ('Usted visita a un amigo íntimo que ha estado enfermo por algún tiempo. Lo mejor sería:', 5,
       '["Platicarle sus diversiones recientes", "Platicarle nuevas cosas referentes a sus amigos mutuos", "Comentar su enfermedad", "Enfatizar lo mucho que le apena verle enfermo"]'::jsonb),
      ('Trabaja usted en una industria y su jefe quiere que tome un curso relacionado con su carrera pero que sea compatible con el horario de su trabajo. Lo mejor sería:', 6,
       '["Continuar normalmente su carrera e informar al jefe sí pregunta", "Explicar la situación u obtener su opinión en cuanto a la importancia relativa de ambas situaciones", "Dejar la escuela en relación a los intereses del trabajo", "Asistir en forma alterna y no hacer comentarios"]'::jsonb),
      ('Un agente viajero con 15 años de antigüedad decide, presionado por su familia sentar raíces. Se le cambia a las oficinas generales. Es de esperar que:', 7,
       '["Guste de los descansos del trabajo de oficina", "Se sienta inquieto por la rutina de la oficina", "Busque otro trabajo", "Resulte muy ineficiente en el trabajo de oficina"]'::jsonb),
      ('Tiene dos invitados a cenar, el uno radical y el otro conservador. Surge una acalorada discusión respecto a la política. Lo mejor sería:', 8,
       '["Tomar partido", "Intentar cambiar de tema", "Intervenir dando los propios puntos de vista y mostrar donde ambos pecan de extremosos", "Pedir cambien de tema para evitar mayor discusión"]'::jsonb),
      ('Un joven invita a una dama al teatro, al llegar se percata de que ha olvidado la cartera. Sería mejor:', 9,
       '["Tratar de obtener boletos dejando el reloj en prenda", "Buscar a algún amigo a quien pedir prestado", "Decidir de acuerdo con ella lo procedente", "Dar una excusa plausible para ir a casa por dinero"]'::jsonb),
      ('Usted ha tenido experiencia como vendedor y acaba de conseguir de una tienda un empleo. La mejor forma de relacionarse con los empleados del departamento sería:', 10,
       '["Permitirle hacer la mayoría de las ventas por unos días en tanto observa sus métodos", "Tratar de instituir los métodos que anteriormente le fueron útiles", "Adaptarse mejor a las condiciones y aceptar consejos de sus compañeros", "Pedir al jefe todo el consejo necesario"]'::jsonb),
      ('Es usted un joven empleado que va a comer con una maestra a quien conoce superficialmente. Lo mejor sería iniciar la conversación acerca de:', 11,
       '["Algún tópico de actualidad", "Algún aspecto interesante de su propio trabajo", "Las tendencias actuales en el terreno docente", "Las sociedades de padres de familia"]'::jsonb),
      ('Una señora de especiales méritos que por largo tiempo ha dirigido trabajos benéficos dejando las labores de su casa a cargo de la servidumbre, se cambia a otra población. Es de esperarse que ella:', 12,
       '["Se sienta insatisfecha de su nuevo hogar", "Se interese más por los trabajos domésticos", "Intervenga poco a poco en la vida de la comunidad, continuando así sus intereses", "Adopte nuevos intereses en la nueva comunidad"]'::jsonb),
      ('Quiere pedirle un favor a un conocido con quien tiene poca confianza. La mejor forma de lograrlo sería:', 13,
       '["Haciéndole creer que será él quien se beneficie más", "Enfatice la importancia que para usted tiene que se le conceda", "Ofrecer algo de retribución", "Decir que lo que desea en forma breve indicando los motivos"]'::jsonb),
      ('Un joven de 24 años gasta bastante tiempo y dinero en diversiones, solo ha hecho ver que así no logrará al éxito en el trabajo. Probablemente cambie sus costumbres. Si:', 14,
       '["Sus hábitos nocturnos lesionan su salud", "Sus amigos enfatizan el daño que se hace a sí mismo", "Su jefe se da cuenta y lo previene", "Se interesa en el desarrollo de alguna fase de su trabajo"]'::jsonb),
      ('Tras de haber hecho un buen número de favores a un amigo, este empieza a dar por hecho que usted será quien le resuelva todas sus pequeñas dificultades. La mejor forma de readaptar la situación sin ofenderle sería:', 15,
       '["Explicar el daño que se está causando", "Pedir a un amigo mutuo que trate de arreglar las cosas", "Ayudarle una vez más pero de tal manera que sienta que mejor hubiera sido no haberlo solicitado", "Darle una excusa para no seguir ayudándole"]'::jsonb),
      ('Una persona recién ascendida a un mejor puesto de autoridad lograría mejor sus metas y la buena voluntad de los empleados:', 16,
       '["Tratando de que cada empleado entienda qué es la verdadera eficiencia", "Ascendiendo cuanto antes a quienes considere lo merezcan", "Preguntando confidencialmente a cada empleado en cuanto a los cambios que estiman necesarios", "Seguir los sistemas del anterior jefe y gradualmente hacer los cambios necesarios"]'::jsonb),
      ('Vive a 15 km. del centro y ha ofrecido llevar de regreso a un amigo a las 16:00 p.m. él lo espera desde las 15:00 y a las 16:00 horas usted se entera que no podrá salir antes de las 17:30, sería mejor:', 17,
       '["Pedirle un taxi", "Explicarle y dejar que él decida", "Pedirle que espere hasta las 17:30 horas", "Proponerle que se lleve su auto"]'::jsonb),
      ('Es usted un ejecutivo y dos de sus empleados se llevan mal, ambos son eficientes. Lo mejor sería:', 18,
       '["Despedir al menos eficiente", "Dar trabajo en común que a ambos interese", "Hacerles ver el daño que se hacen", "Darles trabajos distintos"]'::jsonb),
      ('El señor González ha estado conservando su puesto subordinado por 10 años, desempeña su trabajo callado y confidencialmente y se le extrañará cuando se vaya. De obtener el trabajo en otra empresa, muy probablemente:', 19,
       '["Asuma fácilmente responsabilidad como supervisor", "Haga ver de inmediato su valor", "Sea lento para abrirse las necesarias oportunidades", "Renuncie ante la más ligera crítica de su trabajo"]'::jsonb),
      ('Va usted a ser maestro de ceremonias, en una cena el próximo sábado día en que por la mañana, debido a enfermedad de su familia, se ve imposibilitado para asistir lo mejor sería:', 20,
       '["Cancelar la cena", "Encontrar quien lo sustituya", "Detallar los planes que tenía y evitarlos", "Enviar una nota explicando la causa de su ausencia"]'::jsonb),
      ('En igualdad de circunstancias el empleado que mejor se adapta a un nuevo puesto es aquel que:', 21,
       '["Ha sido bueno en puestos anteriores", "Ha tenido éxito durante 10 años en su puesto", "Tiene sus propias ideas e invariablemente se rige por ellas", "Cuenta con una buena recomendación de su jefe anterior"]'::jsonb),
      ('Un conocido le platica acerca de una afición que él tiene, su conversación le aburre. Lo mejor sería:', 22,
       '["Escuchar de manera cortés, pero aburrida", "Escuchar con fingido interés", "Decirle francamente que el tema no le interesa", "Mirar el reloj con impaciencia"]'::jsonb),
      ('Es usted un empleado ordinario en una oficina grande. El jefe entra cuando usted lee en vez de trabajar. Lo mejor sería:', 23,
       '["Doblar el periódico y volver a trabajo", "Pretender que obtiene recortes necesarios al trabajo", "Tratar de interesar al jefe leyéndole un encabezado importante", "Seguir leyendo sin mostrar embarazo"]'::jsonb),
      ('Es usted un maestro de primaria. Camino a la escuela tras de la primera nevada, algunos de sus alumnos lanzan bolas de nieve. Desde el punto de vista de la buena administración de la escolar, usted debería:', 24,
       '["Castigarle ahí mismo por su indisciplina", "Decirles que de volverlo a hacer los castigará", "Pasar la queja a sus padres", "Tomarlo como broma y no hacer caso al respecto"]'::jsonb),
      ('Preside el Comité de Mejoras Materiales en su colonia; las últimas reuniones han sido de escasa asistencia. Se mejoraría la asistencia:', 25,
       '["Visitando vecinos prominentes explicándoles los problemas", "Avisar de un programa interesante para la reunión", "Poner avisos en los lugares públicos", "Enviar avisos personales"]'::jsonb),
      ('Salinas, eficiente, pero de esos que "todo lo saben", critica a Montoya, el jefe opina que la idea de Montoya ahorra tiempo. Probablemente Salinas:', 26,
       '["Pida otro trabajo al jefe", "Lo haga a su modo sin comentarios", "Lo haga con Montoya, pero siga criticándolo", "Lo haga con Montoya, pero mal a propósito"]'::jsonb),
      ('Un hombre de 64 años tuvo algún éxito cuando joven como político, sus modos directos le han impedido descollar los últimos 20 años, lo más probable es que:', 27,
       '["Persista en su manera de ser", "Cambie para lograr éxito", "Forme un nuevo partido político", "Abandone la política por inmoral"]'::jsonb),
      ('Es usted un joven que encuentra en la calle a una mujer de más edad a quien apenas conoce y que parece haber estado llorando. Lo mejor sería:', 28,
       '["Preguntarle por qué está triste", "Pasarle el brazo por el hombro y consolarla", "Simular no advertir su pena", "Simular no haberla visto"]'::jsonb),
      ('Un compañero flojea de tal manera que usted le toca más de lo que le corresponde. La mejor forma de conservar las relaciones sería:', 29,
       '["Explicar el caso al jefe cortésmente", "Cortésmente indicarle que debe hacer lo que le corresponde o que usted se quejara con el jefe", "Hacer tanto como pueda eficientemente y no decir nada del caso al jefe", "Hacer lo suyo y dejar pendiente lo que el compañero no haga"]'::jsonb),
      ('Se le ha asignado un puesto ejecutivo, en una organización. Para ganar el respeto y la admiración de sus subordinados, sin perjuicio de sus planes, habría que:', 30,
       '["Ceder en todos los pequeños puntos posibles", "Tratar de convencerlos de todas sus ideas", "Ceder parcialmente en todas las cuestiones importantes", "Abogar por muchas reformas"]'::jsonb)
    ) AS t(texto, orden, opciones)
    WHERE NOT EXISTS (
      SELECT 1 FROM preguntas_tests p 
      WHERE p.test_id = moss_test_id AND p.texto = t.texto
    );
  END IF;
END $$;

-- ============================================================
-- PREGUNTAS 16 PF (versión simplificada - 10 preguntas ejemplo)
-- ============================================================

DO $$
DECLARE
  pf_test_id UUID;
BEGIN
  SELECT id INTO pf_test_id FROM tests_psicologicos WHERE nombre = '16 PF' LIMIT 1;
  
  IF pf_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones) 
    SELECT pf_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones
    FROM (VALUES
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
    ) AS t(texto, orden, opciones)
    WHERE NOT EXISTS (
      SELECT 1 FROM preguntas_tests p 
      WHERE p.test_id = pf_test_id AND p.texto = t.texto
    );
  END IF;
END $$;

-- ============================================================
-- PREGUNTAS ZAVIC (versión simplificada - 10 preguntas ejemplo)
-- ============================================================

DO $$
DECLARE
  zavic_test_id UUID;
BEGIN
  SELECT id INTO zavic_test_id FROM tests_psicologicos WHERE nombre = 'Test Zavic' LIMIT 1;
  
  IF zavic_test_id IS NOT NULL THEN
    INSERT INTO preguntas_tests (test_id, texto, orden, tipo_respuesta, opciones) 
    SELECT zavic_test_id, t.texto, t.orden, 'opcion_multiple', t.opciones
    FROM (VALUES
      ('Me siento motivado cuando tengo metas claras', 1, 
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Valoro el trabajo en equipo por encima del individual', 2,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Busco constantemente aprender cosas nuevas', 3,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Prefiero tareas que requieren creatividad', 4,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me siento satisfecho cuando ayudo a otros', 5,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me importa más la calidad que la cantidad', 6,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Disfruto asumir responsabilidades de liderazgo', 7,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Prefiero un ambiente de trabajo estructurado', 8,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Me motiva el reconocimiento de mis logros', 9,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb),
      ('Valoro la estabilidad laboral por encima de todo', 10,
       '["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]'::jsonb)
    ) AS t(texto, orden, opciones)
    WHERE NOT EXISTS (
      SELECT 1 FROM preguntas_tests p 
      WHERE p.test_id = zavic_test_id AND p.texto = t.texto
    );
  END IF;
END $$;

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_preguntas_test ON preguntas_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_user ON respuestas_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_test ON respuestas_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_detalles_respuesta ON detalles_respuestas(respuesta_id);
CREATE INDEX IF NOT EXISTS idx_resultados_respuesta ON resultados_tests(respuesta_id);
