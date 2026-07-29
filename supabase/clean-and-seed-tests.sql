-- LIMPIEZA COMPLETA DE TABLAS DE TEST
TRUNCATE TABLE cst_test_resultados, cst_test_asignaciones, cst_test_preguntas, cst_test_competencias CASCADE;

-- ========================================
-- BANCO DE COMPETENCIAS (15 competencias base)
-- ========================================
CREATE OR REPLACE FUNCTION seed_competencias_completas() RETURNS void AS $$
DECLARE
  comp_liderazgo UUID;
  comp_etica UUID;
  comp_integridad UUID;
  comp_comunicacion UUID;
  comp_trabajo_equipo UUID;
  comp_adaptabilidad UUID;
  comp_toma_decisiones UUID;
  comp_resolucion_conflictos UUID;
  comp_orientacion_cliente UUID;
  comp_pensamiento_analitico UUID;
  comp_gestion_tiempo UUID;
  comp_confidencialidad UUID;
  comp_negociacion UUID;
  comp_innovacion UUID;
  comp_resiliencia UUID;
BEGIN
  -- Insertar competencias
  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Liderazgo', 'Capacidad de guiar, motivar y dirigir equipos hacia objetivos comunes', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_liderazgo;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Ética', 'Actuación basada en principios morales y valores profesionales', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_etica;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Integridad', 'Coherencia entre lo que se piensa, dice y hace', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_integridad;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Comunicación', 'Habilidad para transmitir información de manera clara y efectiva', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_comunicacion;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Trabajo en Equipo', 'Capacidad de colaborar efectivamente con otros', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_trabajo_equipo;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Adaptabilidad', 'Flexibilidad para ajustarse a cambios y nuevas situaciones', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_adaptabilidad;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Toma de Decisiones', 'Capacidad de elegir la mejor opción entre varias alternativas', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_toma_decisiones;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Resolución de Conflictos', 'Habilidad para manejar y resolver desacuerdos', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_resolucion_conflictos;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Orientación al Cliente', 'Enfoque en satisfacer las necesidades del cliente', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_orientacion_cliente;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Pensamiento Analítico', 'Capacidad de analizar información y resolver problemas complejos', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_pensamiento_analitico;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Gestión del Tiempo', 'Habilidad para organizar y priorizar tareas eficientemente', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_gestion_tiempo;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Confidencialidad', 'Manejo discreto y seguro de información sensible', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_confidencialidad;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Negociación', 'Capacidad de llegar a acuerdos beneficiosos para todas las partes', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_negociacion;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Innovación', 'Generación de ideas creativas y mejoras', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_innovacion;

  INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
  VALUES ('Resiliencia', 'Capacidad de recuperarse ante adversidades', 'competencias', 'activo', 15, 70)
  RETURNING id INTO comp_resiliencia;

  -- ========================================
  -- PREGUNTAS POR COMPETENCIA (4 preguntas cada una)
  -- ========================================

  -- LIDERAZGO
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_liderazgo, 'Tu equipo está desmotivado por la carga de trabajo. ¿Qué haces?', 'opcion_multiple', 
    '[{"texto": "Les escucho, reorganizo prioridades y celebro pequeños logros", "puntos": 5}, {"texto": "Les digo que se esfuercen más porque es necesario", "puntos": 3}, {"texto": "Ignoro el problema y sigo con mi trabajo", "puntos": 1}, {"texto": "Reporto a RRHH que el equipo está quejándose", "puntos": 2}]'::jsonb, 'Liderazgo', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_liderazgo, 'Un colaborador nuevo comete errores repetidos. ¿Cómo lo manejas?', 'opcion_multiple',
    '[{"texto": "Lo siento a su lado, le explico y le doy feedback constructivo", "puntos": 5}, {"texto": "Le asigno tareas más simples para que no afecte al equipo", "puntos": 3}, {"texto": "Lo reporto a RRHH para que lo evalúen", "puntos": 2}, {"texto": "Dejo que aprenda solo, es la mejor forma", "puntos": 1}]'::jsonb, 'Liderazgo', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_liderazgo, 'Debes implementar un cambio impopular en el equipo. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Explico el porqué, escucho preocupaciones y acompaño el proceso", "puntos": 5}, {"texto": "Lo impongo porque soy el jefe y se acabó", "puntos": 2}, {"texto": "Lo anuncio por email para evitar confrontación", "puntos": 1}, {"texto": "Dejo que el equipo decida si lo implementa o no", "puntos": 3}]'::jsonb, 'Liderazgo', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_liderazgo, 'Dos miembros clave de tu equipo tienen un conflicto personal. ¿Intervienes?', 'opcion_multiple',
    '[{"texto": "Sí, los reúno, median el conflicto y busco solución conjunta", "puntos": 5}, {"texto": "Los separo en diferentes proyectos para que no interactúen", "puntos": 3}, {"texto": "Espero que lo resuelvan solos, son adultos", "puntos": 2}, {"texto": "Les digo que si no se portan profesionalmente, habrá consecuencias", "puntos": 1}]'::jsonb, 'Liderazgo', 4);

  -- ÉTICA
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_etica, 'Descubres que un proveedor entregó menos mercancía de la facturada pero te ofrece un bono personal por "no ver nada". ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Reporto inmediatamente a mi superior y al proveedor por escrito", "puntos": 5}, {"texto": "Hablo con el proveedor para que lo corrija sin avisar a nadie", "puntos": 3}, {"texto": "Acepto el bono, total nadie se va a enterar", "puntos": 1}, {"texto": "Ignoro el tema, no es mi problema", "puntos": 1}]'::jsonb, 'Ética', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_etica, 'Un compañero te pide que firmes un documento sin revisarlo porque "es solo trámite". ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Lo reviso completo antes de firmar, es mi responsabilidad", "puntos": 5}, {"texto": "Lo firmo, confío en mi compañero", "puntos": 2}, {"texto": "Le digo que no sin explicarle por qué", "puntos": 3}, {"texto": "Lo firmo pero le digo que la próxima vez me avise antes", "puntos": 1}]'::jsonb, 'Ética', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_etica, 'Encuentras una forma de evadir impuestos legalmente pero cuestionable éticamente. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Consulto con el área legal y contable antes de tomar cualquier decisión", "puntos": 5}, {"texto": "Lo implemento, si es legal está bien", "puntos": 2}, {"texto": "Lo descarto completamente, no vale la pena el riesgo", "puntos": 3}, {"texto": "Lo comparto con mi equipo para ver qué opinan", "puntos": 1}]'::jsonb, 'Ética', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_etica, 'Tu jefe te pide que manipules un reporte para que se vea mejor. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Me niego respetuosamente y explico por qué es incorrecto", "puntos": 5}, {"texto": "Lo hago, es mi jefe y tengo que obedecer", "puntos": 1}, {"texto": "Lo hago pero me siento incómodo", "puntos": 2}, {"texto": "Lo hablo con RRHH de forma anónima", "puntos": 3}]'::jsonb, 'Ética', 4);

  -- INTEGRIDAD
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_integridad, 'Cometes un error que afecta un proyecto importante. Nadie lo sabe aún. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Lo reconozco inmediatamente, asumo responsabilidad y propongo solución", "puntos": 5}, {"texto": "Espero a ver si alguien más lo descubre", "puntos": 2}, {"texto": "Trato de arreglarlo en secreto antes de que alguien lo note", "puntos": 3}, {"texto": "Culpo a otro factor o persona para no quedar mal", "puntos": 1}]'::jsonb, 'Integridad', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_integridad, 'Un cliente te ofrece un regalo costoso por "agilizar" su proceso. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Lo rechazo amablemente y explico la política de la empresa", "puntos": 5}, {"texto": "Lo acepto, total es solo un regalo", "puntos": 1}, {"texto": "Lo acepto y lo reporto a mi jefe", "puntos": 3}, {"texto": "Lo dono a caridad para no quedármelo", "puntos": 2}]'::jsonb, 'Integridad', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_integridad, 'Descubres que un compañero está usando recursos de la empresa para su negocio personal. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Hablo con él primero, si no cambia, lo reporto", "puntos": 5}, {"texto": "Lo reporto inmediatamente a RRHH", "puntos": 3}, {"texto": "No hago nada, no es mi problema", "puntos": 1}, {"texto": "Le pido que me incluya en su negocio", "puntos": 1}]'::jsonb, 'Integridad', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_integridad, 'Te ofrecen ascender si "cierras los ojos" ante ciertas prácticas cuestionables. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Rechazo el ascenso, mis valores no son negociables", "puntos": 5}, {"texto": "Acepto, es una oportunidad de carrera", "puntos": 1}, {"texto": "Lo consulto con mi familia antes de decidir", "puntos": 2}, {"texto": "Acepto pero trato de cambiar las cosas desde adentro", "puntos": 3}]'::jsonb, 'Integridad', 4);

  -- COMUNICACIÓN
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_comunicacion, 'Debes explicar un tema técnico complejo a personas no técnicas. ¿Cómo lo haces?', 'opcion_multiple',
    '[{"texto": "Uso analogías simples, ejemplos visuales y verifico que entiendan", "puntos": 5}, {"texto": "Les doy la información técnica completa, ellos deben entender", "puntos": 2}, {"texto": "Les digo que consulten con el área técnica", "puntos": 1}, {"texto": "Les envío un documento extenso para que lo lean", "puntos": 3}]'::jsonb, 'Comunicación', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_comunicacion, 'Un cliente está furioso y te grita por teléfono. ¿Cómo respondes?', 'opcion_multiple',
    '[{"texto": "Mantengo la calma, escucho activamente y busco solución", "puntos": 5}, {"texto": "Le grito de vuelta, no voy a dejar que me falten al respeto", "puntos": 1}, {"texto": "Cuelgo el teléfono, es inaceptable", "puntos": 2}, {"texto": "Lo transfiero a otro departamento para no lidiar con él", "puntos": 3}]'::jsonb, 'Comunicación', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_comunicacion, 'Descubres que tu equipo no entendió las instrucciones que diste. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Asumo responsabilidad, reformulo y verifico comprensión", "puntos": 5}, {"texto": "Les digo que no prestaron atención", "puntos": 1}, {"texto": "Les envío las instrucciones por escrito para que las lean", "puntos": 3}, {"texto": "Dejo que figuren como están, ya aprenderán", "puntos": 2}]'::jsonb, 'Comunicación', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_comunicacion, 'Debes dar feedback negativo a un colaborador. ¿Cómo lo haces?', 'opcion_multiple',
    '[{"texto": "En privado, específico, enfocado en comportamiento y solución", "puntos": 5}, {"texto": "En público para que todos aprendan", "puntos": 1}, {"texto": "Por email para evitar confrontación", "puntos": 2}, {"texto": "Espero a la evaluación anual para decírselo", "puntos": 3}]'::jsonb, 'Comunicación', 4);

  -- TRABAJO EN EQUIPO
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_trabajo_equipo, 'Un compañero no cumple su parte del proyecto y te afecta. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Hablo con él para entender qué pasa y buscar solución conjunta", "puntos": 5}, {"texto": "Lo hago yo para no afectar el proyecto", "puntos": 3}, {"texto": "Lo reporto al jefe inmediatamente", "puntos": 2}, {"texto": "Dejo que se note su falta de responsabilidad", "puntos": 1}]'::jsonb, 'Trabajo en Equipo', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_trabajo_equipo, 'El equipo debe tomar una decisión y hay dos posturas divididas. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Facilito diálogo, busco puntos en común y consenso", "puntos": 5}, {"texto": "Voto por la opción que me parece mejor", "puntos": 3}, {"texto": "Dejo que el jefe decida", "puntos": 2}, {"texto": "Me quedo con mi postura y discuto hasta ganar", "puntos": 1}]'::jsonb, 'Trabajo en Equipo', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_trabajo_equipo, 'Un compañero nuevo se integra a tu equipo. ¿Cómo lo recibes?', 'opcion_multiple',
    '[{"texto": "Lo presento al equipo, le explico dinámicas y me ofrezco a ayudarlo", "puntos": 5}, {"texto": "Lo dejo que se adapte solo, es lo mejor", "puntos": 2}, {"texto": "Le asigno un buddy para que no me quite tiempo", "puntos": 3}, {"texto": "Le doy la información básica y espero que pregunte si necesita algo", "puntos": 1}]'::jsonb, 'Trabajo en Equipo', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_trabajo_equipo, 'El equipo logra un éxito importante. ¿Cómo celebras?', 'opcion_multiple',
    '[{"texto": "Reconozco el esfuerzo de todos públicamente", "puntos": 5}, {"texto": "Celebro mi contribución individual", "puntos": 1}, {"texto": "Organizo una celebración para todo el equipo", "puntos": 4}, {"texto": "No hago nada especial, es parte del trabajo", "puntos": 2}]'::jsonb, 'Trabajo en Equipo', 4);

  -- ADAPTABILIDAD
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_adaptabilidad, 'Cambian completamente los requisitos del proyecto a mitad de camino. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Reevalúo el plan, priorizo y me adapto a los nuevos requisitos", "puntos": 5}, {"texto": "Me quejo porque se pierde el trabajo hecho", "puntos": 2}, {"texto": "Insisto en mantener el plan original", "puntos": 1}, {"texto": "Hago ambos planes para cubrir todas las posibilidades", "puntos": 3}]'::jsonb, 'Adaptabilidad', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_adaptabilidad, 'Te asignan a un área completamente nueva para ti. ¿Cómo reaccionas?', 'opcion_multiple',
    '[{"texto": "Acepto el reto, investigo y pido ayuda si la necesito", "puntos": 5}, {"texto": "Digo que no estoy calificado para eso", "puntos": 2}, {"texto": "Acepto pero me siento ansioso todo el tiempo", "puntos": 3}, {"texto": "Rechazo el cambio, me gusta mi área actual", "puntos": 1}]'::jsonb, 'Adaptabilidad', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_adaptabilidad, 'La empresa implementa un nuevo sistema que complica tu trabajo diario. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Aprendo el sistema, doy feedback constructivo sobre mejoras", "puntos": 5}, {"texto": "Sigo usando el sistema anterior en paralelo", "puntos": 2}, {"texto": "Me quejo con mis compañeros sobre el cambio", "puntos": 1}, {"texto": "Uso el sistema solo cuando es obligatorio", "puntos": 3}]'::jsonb, 'Adaptabilidad', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_adaptabilidad, 'Tu horario de trabajo cambia por necesidades del negocio. ¿Cómo lo manejas?', 'opcion_multiple',
    '[{"texto": "Me ajusto, reorganizo mi vida personal para adaptarme", "puntos": 5}, {"texto": "Acepto pero busco otro trabajo con horario fijo", "puntos": 3}, {"texto": "Me niego, tengo compromisos personales inamovibles", "puntos": 1}, {"texto": "Acepto pero llego tarde o me voy temprano cuando puedo", "puntos": 2}]'::jsonb, 'Adaptabilidad', 4);

  -- TOMA DE DECISIONES
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_toma_decisiones, 'Debes tomar una decisión urgente sin tener toda la información. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Analizo lo que tengo, consulto rápido y decido con lo disponible", "puntos": 5}, {"texto": "Espero a tener toda la información antes de decidir", "puntos": 2}, {"texto": "Delego la decisión a alguien con más información", "puntos": 3}, {"texto": "Tomo la decisión más conservadora para no arriesgar", "puntos": 1}]'::jsonb, 'Toma de Decisiones', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_toma_decisiones, 'Dos opciones son igualmente válidas pero contradictorias. ¿Cómo eliges?', 'opcion_multiple',
    '[{"texto": "Evalúo impacto a largo plazo, consulto stakeholders y decido", "puntos": 5}, {"texto": "Elijo la opción más popular entre el equipo", "puntos": 3}, {"texto": "Lanzo una moneda, es igual de bueno", "puntos": 1}, {"texto": "No decido y dejo que el tiempo resuelva", "puntos": 2}]'::jsonb, 'Toma de Decisiones', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_toma_decisiones, 'Tu decisión fue incorrecta y causó problemas. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Asumo responsabilidad, corrijo y aprendo para la próxima", "puntos": 5}, {"texto": "Culpo a la información que me dieron", "puntos": 1}, {"texto": "Trato de minimizar el daño sin admitir el error", "puntos": 2}, {"texto": "Analizo qué salió mal pero no lo comunico", "puntos": 3}]'::jsonb, 'Toma de Decisiones', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_toma_decisiones, 'Debes decidir entre dos candidatos igualmente calificados. ¿En qué te basas?', 'opcion_multiple',
    '[{"texto": "Evalúo competencias blandas, cultura y potencial de crecimiento", "puntos": 5}, {"texto": "Elijo al que tiene más experiencia", "puntos": 3}, {"texto": "Dejo que el equipo vote", "puntos": 2}, {"texto": "Elijo al que me cae mejor", "puntos": 1}]'::jsonb, 'Toma de Decisiones', 4);

  -- RESOLUCIÓN DE CONFLICTOS
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resolucion_conflictos, 'Dos departamentos tienen objetivos contradictorios. ¿Cómo lo manejas?', 'opcion_multiple',
    '[{"texto": "Reúno a ambos, busco objetivos comunes y acuerdo mutuamente beneficioso", "puntos": 5}, {"texto": "Favorezco al departamento que tiene razón", "puntos": 2}, {"texto": "Dejo que lo resuelvan los jefes de cada área", "puntos": 3}, {"texto": "Ignoro el conflicto, no es mi responsabilidad", "puntos": 1}]'::jsonb, 'Resolución de Conflictos', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resolucion_conflictos, 'Un cliente exige algo que va contra la política de la empresa. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Explico la política, ofrezco alternativas y busco solución creativa", "puntos": 5}, {"texto": "Hago una excepción para no perder al cliente", "puntos": 2}, {"texto": "Me niego rotundamente, la política es la política", "puntos": 3}, {"texto": "Lo transfiero a otro departamento para que lidie con él", "puntos": 1}]'::jsonb, 'Resolución de Conflictos', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resolucion_conflictos, 'Dos miembros de tu equipo tienen un desacuerdo personal que afecta el trabajo. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Los reúno, median el conflicto y establezco acuerdos de trabajo", "puntos": 5}, {"texto": "Los separo en diferentes proyectos", "puntos": 3}, {"texto": "Les digo que son profesionales y deben resolverlo", "puntos": 2}, {"texto": "Espero que se les pase solo", "puntos": 1}]'::jsonb, 'Resolución de Conflictos', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resolucion_conflictos, 'Recibes críticas injustas de un superior. ¿Cómo respondes?', 'opcion_multiple',
    '[{"texto": "Escucho, pido ejemplos específicos y busco clarificación", "puntos": 5}, {"texto": "Me defiendo inmediatamente y explico mi versión", "puntos": 3}, {"texto": "Me callo pero me siento resentido", "puntos": 2}, {"texto": "Me quejo con otros compañeros sobre la injusticia", "puntos": 1}]'::jsonb, 'Resolución de Conflictos', 4);

  -- ORIENTACIÓN AL CLIENTE
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_orientacion_cliente, 'Un cliente tiene una queja válida pero la solución es costosa. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Busco la mejor solución posible dentro de lo razonable y la comunico", "puntos": 5}, {"texto": "Le ofrezco una solución mínima para cumplir", "puntos": 2}, {"texto": "Le explico que es muy costoso y no podemos hacerlo", "puntos": 3}, {"texto": "Lo transfiero a otro departamento", "puntos": 1}]'::jsonb, 'Orientación al Cliente', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_orientacion_cliente, 'Un cliente pide información que no está en tu área. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Lo conecto con la persona correcta y hago seguimiento", "puntos": 5}, {"texto": "Le digo que no es mi área y le doy el contacto", "puntos": 3}, {"texto": "Le digo que no sé y que busque en otro lado", "puntos": 1}, {"texto": "Trato de ayudarlo aunque no sea mi área", "puntos": 4}]'::jsonb, 'Orientación al Cliente', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_orientacion_cliente, 'Un cliente está insatisfecho con el servicio. ¿Cómo reaccionas?', 'opcion_multiple',
    '[{"texto": "Escucho, me disculpo, investigo y ofrezco solución concreta", "puntos": 5}, {"texto": "Le explico que hicimos todo correctamente", "puntos": 2}, {"texto": "Le ofrezco un descuento para que se calle", "puntos": 3}, {"texto": "Le digo que si no le gusta, puede irse a la competencia", "puntos": 1}]'::jsonb, 'Orientación al Cliente', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_orientacion_cliente, 'Debes negar una solicitud de un cliente importante. ¿Cómo lo haces?', 'opcion_multiple',
    '[{"texto": "Explico el porqué, ofrezco alternativas y mantengo la relación", "puntos": 5}, {"texto": "Le digo que no sin explicación", "puntos": 2}, {"texto": "Hago una excepción para no perderlo", "puntos": 1}, {"texto": "Lo postergo para no darle la mala noticia", "puntos": 3}]'::jsonb, 'Orientación al Cliente', 4);

  -- PENSAMIENTO ANALÍTICO
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_pensamiento_analitico, 'Los datos muestran una tendencia preocupante pero no hay causa clara. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Analizo variables, busco patrones y formulo hipótesis para probar", "puntos": 5}, {"texto": "Reporto la tendencia y espero que alguien más la analice", "puntos": 2}, {"texto": "Asumo la causa más obvia y actúo sobre ella", "puntos": 3}, {"texto": "Ignoro la tendencia, probablemente es temporal", "puntos": 1}]'::jsonb, 'Pensamiento Analítico', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_pensamiento_analitico, 'Debes presentar un problema complejo a la dirección. ¿Cómo lo haces?', 'opcion_multiple',
    '[{"texto": "Descompongo el problema, presento datos, causas y opciones de solución", "puntos": 5}, {"texto": "Presento el problema general y dejo que ellos lo analicen", "puntos": 2}, {"texto": "Presento solo la solución que yo prefiero", "puntos": 3}, {"texto": "Espero a que alguien más lo note y lo presente", "puntos": 1}]'::jsonb, 'Pensamiento Analítico', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_pensamiento_analitico, 'Recibes información contradictoria de dos fuentes confiables. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Verifico fuentes, cruzo datos y busco evidencia adicional", "puntos": 5}, {"texto": "Creo en la fuente que me parece más confiable", "puntos": 3}, {"texto": "Presento ambas versiones y dejo que otros decidan", "puntos": 2}, {"texto": "Ignoro ambas y busco una tercera opinión", "puntos": 1}]'::jsonb, 'Pensamiento Analítico', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_pensamiento_analitico, 'Un proceso no funciona como debería. ¿Cómo lo mejoras?', 'opcion_multiple',
    '[{"texto": "Mapeo el proceso, identifico cuellos de botella y propongo mejoras", "puntos": 5}, {"texto": "Cambio lo que claramente no funciona", "puntos": 3}, {"texto": "Dejo que el equipo lo mejore solo", "puntos": 2}, {"texto": "Sigo como está, si funciona más o menos, no lo toco", "puntos": 1}]'::jsonb, 'Pensamiento Analítico', 4);

  -- GESTIÓN DEL TIEMPO
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_gestion_tiempo, 'Tienes múltiples tareas urgentes y no puedes hacerlas todas. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Priorizo por impacto y deadline, comunico y renegocio plazos", "puntos": 5}, {"texto": "Hago todas un poco, aunque ninguna quede perfecta", "puntos": 3}, {"texto": "Hago la más fácil primero para sentir progreso", "puntos": 2}, {"texto": "Espero a ver cuáles son realmente urgentes", "puntos": 1}]'::jsonb, 'Gestión del Tiempo', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_gestion_tiempo, 'Una reunión se extiende más de lo planeado y afecta tu agenda. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Propongo continuar por email o reagendar lo no esencial", "puntos": 5}, {"texto": "Me quedo aunque se afecte mi agenda, es importante", "puntos": 3}, {"texto": "Me voy a la mitad para cumplir con mis otras tareas", "puntos": 2}, {"texto": "Me quejo internamente pero me quedo", "puntos": 1}]'::jsonb, 'Gestión del Tiempo', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_gestion_tiempo, 'Te interrumpen constantemente y no avanzas en tus tareas. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Bloqueo tiempo en agenda, comunico disponibilidad y agrupo interrupciones", "puntos": 5}, {"texto": "Atiendo las interrupciones y trabajo extra después", "puntos": 2}, {"texto": "Ignoro las interrupciones y sigo trabajando", "puntos": 3}, {"texto": "Me quejo pero no hago nada para cambiarlo", "puntos": 1}]'::jsonb, 'Gestión del Tiempo', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_gestion_tiempo, 'Un proyecto toma más tiempo del esperado. ¿Cómo lo manejas?', 'opcion_multiple',
    '[{"texto": "Reevalúo el plan, priorizo lo esencial y comunico el nuevo timeline", "puntos": 5}, {"texto": "Trabajo horas extra para cumplir el plazo original", "puntos": 3}, {"texto": "Entrego lo que tenga en la fecha original", "puntos": 2}, {"texto": "Pido más tiempo sin explicar por qué", "puntos": 1}]'::jsonb, 'Gestión del Tiempo', 4);

  -- CONFIDENCIALIDAD
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_confidencialidad, 'Un compañero te pregunta sobre el salario de otro colega. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Me niego amablemente, es información confidencial", "puntos": 5}, {"texto": "Le doy un rango aproximado, no es exacto", "puntos": 2}, {"texto": "Le digo que pregunte directamente al colega", "puntos": 3}, {"texto": "Se lo digo, total todos hablan de eso", "puntos": 1}]'::jsonb, 'Confidencialidad', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_confidencialidad, 'Descubres información sensible sobre un despido próximo. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Mantengo total confidencialidad hasta que se anuncie oficialmente", "puntos": 5}, {"texto": "Se lo digo a la persona involucrada para que se prepare", "puntos": 1}, {"texto": "Se lo cuento solo a mi compañero más cercano", "puntos": 2}, {"texto": "Dejo pistas para que la persona lo sospeche", "puntos": 3}]'::jsonb, 'Confidencialidad', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_confidencialidad, 'Un cliente te pide información confidencial de otro cliente. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Me niego, es información confidencial de otro cliente", "puntos": 5}, {"texto": "Le doy información general sin datos específicos", "puntos": 3}, {"texto": "Se la doy, es un cliente importante", "puntos": 1}, {"texto": "Le digo que consulte con el otro cliente directamente", "puntos": 2}]'::jsonb, 'Confidencialidad', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_confidencialidad, 'Encuentras documentos confidenciales en la impresora. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Los recojo, los destruyo y busco al dueño para avisarle", "puntos": 5}, {"texto": "Los dejo ahí, alguien los recogerá", "puntos": 2}, {"texto": "Los leo por curiosidad y los dejo", "puntos": 1}, {"texto": "Los recojo y los guardo en mi escritorio", "puntos": 3}]'::jsonb, 'Confidencialidad', 4);

  -- NEGOCIACIÓN
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_negociacion, 'Un proveedor quiere subir precios 20%. ¿Cómo negocias?', 'opcion_multiple',
    '[{"texto": "Analizo el mercado, presento datos y busco acuerdo mutuamente beneficioso", "puntos": 5}, {"texto": "Acepto si es el único proveedor disponible", "puntos": 2}, {"texto": "Me niego rotundamente y busco otro proveedor", "puntos": 3}, {"texto": "Acepto pero pido mejores condiciones de pago", "puntos": 4}]'::jsonb, 'Negociación', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_negociacion, 'Dos áreas quieren el mismo presupuesto limitado. ¿Cómo decides?', 'opcion_multiple',
    '[{"texto": "Evalúo ROI de cada proyecto y busco alternativas de financiamiento", "puntos": 5}, {"texto": "Divido el presupuesto 50/50 para ser justo", "puntos": 3}, {"texto": "Doy todo al área que me parece más importante", "puntos": 2}, {"texto": "Dejo que los jefes de área lo resuelvan", "puntos": 1}]'::jsonb, 'Negociación', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_negociacion, 'Un cliente quiere un descuento grande que no puedes dar. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Ofrezco valor agregado, mejores condiciones o alternativas", "puntos": 5}, {"texto": "Doy el descuento aunque afecte mi margen", "puntos": 2}, {"texto": "Me niego, el precio es el precio", "puntos": 3}, {"texto": "Lo transfiero a otro vendedor para que lidie con él", "puntos": 1}]'::jsonb, 'Negociación', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_negociacion, 'Tu equipo quiere trabajar remoto pero la empresa prefiere presencial. ¿Cómo negocias?', 'opcion_multiple',
    '[{"texto": "Presento datos, propongo modelo híbrido y mido resultados", "puntos": 5}, {"texto": "Acepto lo que diga la empresa sin negociar", "puntos": 2}, {"texto": "Insisto en remoto aunque la empresa se niegue", "puntos": 3}, {"texto": "Dejo que cada quien decida individualmente", "puntos": 1}]'::jsonb, 'Negociación', 4);

  -- INNOVACIÓN
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_innovacion, 'Un proceso funciona pero es muy lento. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Analizo el proceso, investigo mejores prácticas y propongo mejoras", "puntos": 5}, {"texto": "Lo dejo como está, si funciona no lo toco", "puntos": 2}, {"texto": "Cambio lo obvio pero mantengo la estructura", "puntos": 3}, {"texto": "Espero a que alguien más lo mejore", "puntos": 1}]'::jsonb, 'Innovación', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_innovacion, 'Tienes una idea innovadora pero arriesgada. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "La presento con datos, análisis de riesgo y plan de contingencia", "puntos": 5}, {"texto": "La implemento sin avisar para ver si funciona", "puntos": 2}, {"texto": "La guardo, probablemente la rechacen", "puntos": 1}, {"texto": "La comparto con compañeros para ver qué opinan", "puntos": 3}]'::jsonb, 'Innovación', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_innovacion, 'La competencia implementa algo nuevo y exitoso. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Analizo su enfoque, adapto a nuestro contexto y mejoro la idea", "puntos": 5}, {"texto": "Copio exactamente lo que hicieron", "puntos": 2}, {"texto": "Ignoro, nosotros tenemos nuestra forma de hacer las cosas", "puntos": 1}, {"texto": "Espero a ver si funciona a largo plazo antes de copiar", "puntos": 3}]'::jsonb, 'Innovación', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_innovacion, 'Tu idea es rechazada por la dirección. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Pido feedback, mejoro la propuesta y la presento de nuevo", "puntos": 5}, {"texto": "Me frustro y dejo de proponer ideas", "puntos": 1}, {"texto": "La implemento por mi cuenta para demostrar que funciona", "puntos": 2}, {"texto": "Acepto la decisión y paso a otra cosa", "puntos": 3}]'::jsonb, 'Innovación', 4);

  -- RESILIENCIA
  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resiliencia, 'Fallas en un proyecto importante frente a todos. ¿Cómo reaccionas?', 'opcion_multiple',
    '[{"texto": "Asumo responsabilidad, aprendo y me enfoco en la próxima oportunidad", "puntos": 5}, {"texto": "Me siento avergonzado y evito a la gente por un tiempo", "puntos": 2}, {"texto": "Culpo a factores externos para no sentirme mal", "puntos": 1}, {"texto": "Me quejo de que no me dieron las herramientas necesarias", "puntos": 3}]'::jsonb, 'Resiliencia', 1);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resiliencia, 'Recibes múltiples rechazos en tu área de trabajo. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Analizo feedback, ajusto enfoque y sigo intentando", "puntos": 5}, {"texto": "Me desanimo y considero cambiar de área", "puntos": 2}, {"texto": "Insisto con el mismo enfoque, eventualmente funcionará", "puntos": 3}, {"texto": "Dejo de intentarlo, claramente no es para mí", "puntos": 1}]'::jsonb, 'Resiliencia', 2);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resiliencia, 'Cambian las reglas del juego en medio de un proyecto importante. ¿Qué haces?', 'opcion_multiple',
    '[{"texto": "Me adapto rápidamente, reevalúo y ajusto el plan", "puntos": 5}, {"texto": "Me frustro pero sigo adelante", "puntos": 3}, {"texto": "Me quejo del cambio y sigo con el plan original", "puntos": 1}, {"texto": "Abandono el proyecto, ya no tiene sentido", "puntos": 2}]'::jsonb, 'Resiliencia', 3);

  INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
  VALUES (comp_resiliencia, 'Tienes un día terrible en el trabajo. ¿Cómo lo manejas?', 'opcion_multiple',
    '[{"texto": "Desconecto al salir, descanso y mañana será otro día", "puntos": 5}, {"texto": "Me llevo el estrés a casa y no puedo dormir", "puntos": 2}, {"texto": "Salgo a desahogarme con amigos o familia", "puntos": 3}, {"texto": "Sigo trabajando aunque me sienta mal", "puntos": 1}]'::jsonb, 'Resiliencia', 4);

END;
$$ LANGUAGE plpgsql;

SELECT seed_competencias_completas();
