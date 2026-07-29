-- ============================================================
-- CST - 30 Competencias Clave y sus Pruebas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. LIDERAZGO
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Liderazgo', 'Evalua capacidades de liderazgo y toma de decisiones', 'competencias', 'activo', 30, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Como describiria su estilo de liderazgo?', 'opcion_multiple',
  '["Autoritario", "Democratico", "Laissez-faire", "Transformacional"]'::jsonb,
  'Liderazgo', 1 FROM cst_test_competencias WHERE nombre = 'Test de Liderazgo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Prefiero liderar con el ejemplo antes que con ordenes', 'escala',
  'Liderazgo', 2 FROM cst_test_competencias WHERE nombre = 'Test de Liderazgo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Un buen lider delega responsabilidades adecuadamente', 'verdadero_falso',
  'Liderazgo', 3 FROM cst_test_competencias WHERE nombre = 'Test de Liderazgo';

-- 2. TRABAJO EN EQUIPO
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Trabajo en Equipo', 'Mide habilidades de colaboracion y comunicacion grupal', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'En un proyecto grupal, usted prefiere:', 'opcion_multiple',
  '["Liderar el equipo", "Colaborar activamente", "Trabajar independientemente", "Coordinar tareas"]'::jsonb,
  'Trabajo en Equipo', 1 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo en Equipo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Prefiero trabajar en equipo antes que individualmente', 'escala',
  'Trabajo en Equipo', 2 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo en Equipo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La comunicacion efectiva es esencial para el trabajo en equipo', 'verdadero_falso',
  'Trabajo en Equipo', 3 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo en Equipo';

-- 3. COMUNICACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Comunicacion', 'Evalua habilidades de comunicacion verbal y escrita', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Al comunicar una idea compleja, usted prefiere:', 'opcion_multiple',
  '["Explicarlo verbalmente", "Escribir un documento", "Usar diagramas", "Combinar varios metodos"]'::jsonb,
  'Comunicacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Comunicacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Me resulta facil expresar mis ideas claramente', 'escala',
  'Comunicacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Comunicacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Escuchar activamente es tan importante como hablar bien', 'verdadero_falso',
  'Comunicacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Comunicacion';

-- 4. RESOLUCION DE CONFLICTOS
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Resolucion de Conflictos', 'Mide capacidad para manejar y resolver desacuerdos', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Ante un conflicto con un compañero, usted:', 'opcion_multiple',
  '["Busca un mediador", "Habla directamente con la persona", "Evita el conflicto", "Busca compromiso"]'::jsonb,
  'Resolucion de Conflictos', 1 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Conflictos';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Puedo mantener la calma en situaciones de tension', 'escala',
  'Resolucion de Conflictos', 2 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Conflictos';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Los conflictos bien manejados pueden mejorar las relaciones', 'verdadero_falso',
  'Resolucion de Conflictos', 3 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Conflictos';

-- 5. ORIENTACION AL CLIENTE
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Orientacion al Cliente', 'Evalua enfoque en satisfaccion y servicio al cliente', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando un cliente presenta una queja, usted:', 'opcion_multiple',
  '["Escucha y busca solucion", "Deriva a otro departamento", "Se disculpa sin compromiso", "Ofrece compensacion inmediata"]'::jsonb,
  'Orientacion al Cliente', 1 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Cliente';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Me esfuerzo por superar las expectativas del cliente', 'escala',
  'Orientacion al Cliente', 2 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Cliente';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La satisfaccion del cliente es mas importante que las ventas', 'verdadero_falso',
  'Orientacion al Cliente', 3 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Cliente';

-- 6. ADAPTABILIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Adaptabilidad', 'Mide capacidad de ajuste a cambios y nuevas situaciones', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Ante un cambio inesperado en el trabajo, usted:', 'opcion_multiple',
  '["Se adapta rapidamente", "Necesita tiempo para ajustarse", "Resiste el cambio", "Busca alternativas"]'::jsonb,
  'Adaptabilidad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Adaptabilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Me siento comodo trabajando en entornos cambiantes', 'escala',
  'Adaptabilidad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Adaptabilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El cambio es una oportunidad de crecimiento', 'verdadero_falso',
  'Adaptabilidad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Adaptabilidad';

-- 7. PROACTIVIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Proactividad', 'Evalua iniciativa y anticipacion de necesidades', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando identifica un problema potencial, usted:', 'opcion_multiple',
  '["Actua preventivamente", "Espera instrucciones", "Informa a su supervisor", "Lo ignora si no le afecta"]'::jsonb,
  'Proactividad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Proactividad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Tomo iniciativa sin esperar que me lo pidan', 'escala',
  'Proactividad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Proactividad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Es mejor prevenir problemas que resolverlos despues', 'verdadero_falso',
  'Proactividad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Proactividad';

-- 8. INTEGRIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Integridad', 'Mide honestidad y principios eticos', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Si encuentra un error a su favor en un reporte, usted:', 'opcion_multiple',
  '["Lo reporta inmediatamente", "Lo ignora", "Lo corrige en silencio", "Consulta con un compañero"]'::jsonb,
  'Integridad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Integridad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Siempre actuo conforme a mis valores eticos', 'escala',
  'Integridad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Integridad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La honestidad es mas importante que el beneficio personal', 'verdadero_falso',
  'Integridad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Integridad';

-- 9. RESPONSABILIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Responsabilidad', 'Evalua compromiso y cumplimiento de obligaciones', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando no puede cumplir con un plazo, usted:', 'opcion_multiple',
  '["Comunica con anticipacion", "Trabaja horas extra", "Busca ayuda", "Asume las consecuencias"]'::jsonb,
  'Responsabilidad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Responsabilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Asumo responsabilidad por mis errores', 'escala',
  'Responsabilidad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Responsabilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Cumplir compromisos es fundamental en el trabajo', 'verdadero_falso',
  'Responsabilidad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Responsabilidad';

-- 10. ORGANIZACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Organizacion', 'Mide capacidad de planificacion y estructuracion', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para manejar multiples tareas, usted:', 'opcion_multiple',
  '["Prioriza por importancia", "Hace una lista", "Trabaja en lo mas urgente", "Delega cuando es posible"]'::jsonb,
  'Organizacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Organizacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Mantengo mi area de trabajo ordenada', 'escala',
  'Organizacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Organizacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La planificacion es clave para el exito', 'verdadero_falso',
  'Organizacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Organizacion';

-- 11. PENSAMIENTO CRITICO
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Pensamiento Critico', 'Evalua analisis objetivo y evaluacion de informacion', 'competencias', 'activo', 30, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Ante una decision importante, usted:', 'opcion_multiple',
  '["Analiza pros y contras", "Consulta con expertos", "Sigue su intuicion", "Investiga a fondo"]'::jsonb,
  'Pensamiento Critico', 1 FROM cst_test_competencias WHERE nombre = 'Test de Pensamiento Critico';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Cuestiono la informacion antes de aceptarla', 'escala',
  'Pensamiento Critico', 2 FROM cst_test_competencias WHERE nombre = 'Test de Pensamiento Critico';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Es importante considerar multiples perspectivas', 'verdadero_falso',
  'Pensamiento Critico', 3 FROM cst_test_competencias WHERE nombre = 'Test de Pensamiento Critico';

-- 12. CREATIVIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Creatividad', 'Mide capacidad de innovacion y pensamiento original', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para resolver un problema complejo, usted:', 'opcion_multiple',
  '["Busca soluciones originales", "Aplica metodos probados", "Colabora con otros", "Investiga mejores practicas"]'::jsonb,
  'Creatividad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Creatividad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Disfruto proponiendo nuevas ideas', 'escala',
  'Creatividad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Creatividad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La innovacion es esencial para el crecimiento', 'verdadero_falso',
  'Creatividad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Creatividad';

-- 13. MANEJO DEL ESTRES
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Manejo del Estres', 'Evalua capacidad de manejar presion y ansiedad', 'psicometrico', 'activo', 30, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Bajo presion, usted:', 'opcion_multiple',
  '["Mantiene la calma", "Se enfoca en soluciones", "Pide apoyo", "Se siente abrumado"]'::jsonb,
  'Manejo del Estres', 1 FROM cst_test_competencias WHERE nombre = 'Test de Manejo del Estres';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Puedo mantener el rendimiento bajo presion', 'escala',
  'Manejo del Estres', 2 FROM cst_test_competencias WHERE nombre = 'Test de Manejo del Estres';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El estres puede ser motivador si se maneja bien', 'verdadero_falso',
  'Manejo del Estres', 3 FROM cst_test_competencias WHERE nombre = 'Test de Manejo del Estres';

-- 14. TOMA DE DECISIONES
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Toma de Decisiones', 'Mide capacidad de decidir efectiva y rapidamente', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Ante una decision urgente con informacion limitada, usted:', 'opcion_multiple',
  '["Decide con lo disponible", "Busca mas informacion", "Consulta con otros", "Posterga la decision"]'::jsonb,
  'Toma de Decisiones', 1 FROM cst_test_competencias WHERE nombre = 'Test de Toma de Decisiones';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Me siento comodo tomando decisiones dificiles', 'escala',
  'Toma de Decisiones', 2 FROM cst_test_competencias WHERE nombre = 'Test de Toma de Decisiones';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Una decision imperfecta a tiempo es mejor que ninguna decision', 'verdadero_falso',
  'Toma de Decisiones', 3 FROM cst_test_competencias WHERE nombre = 'Test de Toma de Decisiones';

-- 15. NEGOCIACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Negociacion', 'Evalua habilidades de persuasion y acuerdo', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'En una negociacion, usted prioriza:', 'opcion_multiple',
  '["Ganar-ganar", "Maximizar beneficios", "Mantener la relacion", "Llegar a un acuerdo rapido"]'::jsonb,
  'Negociacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Negociacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Puedo encontrar puntos en comun con personas dificiles', 'escala',
  'Negociacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Negociacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La preparacion es clave para una buena negociacion', 'verdadero_falso',
  'Negociacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Negociacion';

-- 16. PLANIFICACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Planificacion', 'Mide capacidad de establecer objetivos y estrategias', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para iniciar un proyecto, usted primero:', 'opcion_multiple',
  '["Define objetivos claros", "Establece cronograma", "Asigna recursos", "Identifica riesgos"]'::jsonb,
  'Planificacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Planificacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Establezco metas realistas y medibles', 'escala',
  'Planificacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Planificacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Un plan bien estructurado aumenta las probabilidades de exito', 'verdadero_falso',
  'Planificacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Planificacion';

-- 17. CONTROL DE CALIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Control de Calidad', 'Evalua atencion a estandares y excelencia', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para asegurar la calidad de su trabajo, usted:', 'opcion_multiple',
  '["Revisa meticulosamente", "Sigue procedimientos", "Busca retroalimentacion", "Aplica estandares"]'::jsonb,
  'Control de Calidad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Control de Calidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Presto atencion a los detalles en mi trabajo', 'escala',
  'Control de Calidad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Control de Calidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La calidad no es negociable', 'verdadero_falso',
  'Control de Calidad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Control de Calidad';

-- 18. ATENCION AL DETALLE
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Atencion al Detalle', 'Mide precision y cuidado en tareas', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Al revisar un documento, usted:', 'opcion_multiple',
  '["Lee cada palabra", "Busca errores comunes", "Verifica datos clave", "Revisa formato y contenido"]'::jsonb,
  'Atencion al Detalle', 1 FROM cst_test_competencias WHERE nombre = 'Test de Atencion al Detalle';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Notifico errores pequenos que otros pasan por alto', 'escala',
  'Atencion al Detalle', 2 FROM cst_test_competencias WHERE nombre = 'Test de Atencion al Detalle';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Los pequenos detalles pueden tener grandes consecuencias', 'verdadero_falso',
  'Atencion al Detalle', 3 FROM cst_test_competencias WHERE nombre = 'Test de Atencion al Detalle';

-- 19. TRABAJO BAJO PRESION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Trabajo Bajo Presion', 'Evalua rendimiento en situaciones demandantes', 'psicometrico', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Con plazos ajustados, usted:', 'opcion_multiple',
  '["Se enfoca en prioridades", "Trabaja mas rapido", "Pide extension", "Mantiene calidad"]'::jsonb,
  'Trabajo Bajo Presion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo Bajo Presion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Mantengo mi rendimiento bajo presion', 'escala',
  'Trabajo Bajo Presion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo Bajo Presion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La presion puede mejorar el desempeno', 'verdadero_falso',
  'Trabajo Bajo Presion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Trabajo Bajo Presion';

-- 20. EMPATIA
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Empatia', 'Mide capacidad de comprender perspectivas ajenas', 'psicometrico', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando un compañero esta preocupado, usted:', 'opcion_multiple',
  '["Escucha activamente", "Ofrece ayuda practica", "Da espacio", "Comparte experiencia"]'::jsonb,
  'Empatia', 1 FROM cst_test_competencias WHERE nombre = 'Test de Empatia';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Puedo ponerme en el lugar de los demas', 'escala',
  'Empatia', 2 FROM cst_test_competencias WHERE nombre = 'Test de Empatia';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Entender las emociones ajenas mejora las relaciones', 'verdadero_falso',
  'Empatia', 3 FROM cst_test_competencias WHERE nombre = 'Test de Empatia';

-- 21. ETICA PROFESIONAL
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Etica Profesional', 'Evalua principios morales en el trabajo', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Si descubre una practica no etica en la empresa, usted:', 'opcion_multiple',
  '["Lo reporta", "Habla con su supervisor", "Lo ignora si no le afecta", "Busca consejo"]'::jsonb,
  'Etica Profesional', 1 FROM cst_test_competencias WHERE nombre = 'Test de Etica Profesional';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Actuo con integridad incluso cuando nadie me ve', 'escala',
  'Etica Profesional', 2 FROM cst_test_competencias WHERE nombre = 'Test de Etica Profesional';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La etica profesional es no negociable', 'verdadero_falso',
  'Etica Profesional', 3 FROM cst_test_competencias WHERE nombre = 'Test de Etica Profesional';

-- 22. INNOVACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Innovacion', 'Mide capacidad de generar mejoras y novedades', 'competencias', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para mejorar un proceso, usted:', 'opcion_multiple',
  '["Propone cambios", "Analiza datos", "Consulta mejores practicas", "Prueba nuevas ideas"]'::jsonb,
  'Innovacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Innovacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Busco constantemente formas de mejorar', 'escala',
  'Innovacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Innovacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La innovacion es clave para la competitividad', 'verdadero_falso',
  'Innovacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Innovacion';

-- 23. GESTION DEL TIEMPO
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Gestion del Tiempo', 'Evalua uso eficiente del tiempo', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para manejar su tiempo, usted:', 'opcion_multiple',
  '["Prioriza tareas", "Usa herramientas de planificacion", "Establece limites", "Evita distracciones"]'::jsonb,
  'Gestion del Tiempo', 1 FROM cst_test_competencias WHERE nombre = 'Test de Gestion del Tiempo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Cumplo con los plazos establecidos', 'escala',
  'Gestion del Tiempo', 2 FROM cst_test_competencias WHERE nombre = 'Test de Gestion del Tiempo';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El tiempo es el recurso mas valioso', 'verdadero_falso',
  'Gestion del Tiempo', 3 FROM cst_test_competencias WHERE nombre = 'Test de Gestion del Tiempo';

-- 24. RESOLUCION DE PROBLEMAS
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Resolucion de Problemas', 'Mide capacidad de identificar y solucionar problemas', 'competencias', 'activo', 30, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Ante un problema complejo, usted primero:', 'opcion_multiple',
  '["Analiza la causa raiz", "Busca informacion", "Genera alternativas", "Implementa solucion rapida"]'::jsonb,
  'Resolucion de Problemas', 1 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Problemas';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Disfruto resolver desafios complejos', 'escala',
  'Resolucion de Problemas', 2 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Problemas';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Todo problema tiene una solucion', 'verdadero_falso',
  'Resolucion de Problemas', 3 FROM cst_test_competencias WHERE nombre = 'Test de Resolucion de Problemas';

-- 25. COLABORACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Colaboracion', 'Evalua trabajo conjunto y cooperacion', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'En un equipo, usted contribuye:', 'opcion_multiple',
  '["Con ideas y ejecucion", "Coordinando esfuerzos", "Apoyando a otros", "Aportando experiencia"]'::jsonb,
  'Colaboracion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Colaboracion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Comparto conocimiento con mis compañeros', 'escala',
  'Colaboracion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Colaboracion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El exito colectivo es mas importante que el individual', 'verdadero_falso',
  'Colaboracion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Colaboracion';

-- 26. AUTOCONTROL
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Autocontrol', 'Mide regulacion emocional y comportamiento', 'psicometrico', 'activo', 25, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando se siente frustrado, usted:', 'opcion_multiple',
  '["Respira y se calma", "Expresa su frustracion", "Busca distraccion", "Analiza la causa"]'::jsonb,
  'Autocontrol', 1 FROM cst_test_competencias WHERE nombre = 'Test de Autocontrol';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Puedo controlar mis emociones en situaciones dificiles', 'escala',
  'Autocontrol', 2 FROM cst_test_competencias WHERE nombre = 'Test de Autocontrol';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El autocontrol es esencial en el ambito profesional', 'verdadero_falso',
  'Autocontrol', 3 FROM cst_test_competencias WHERE nombre = 'Test de Autocontrol';

-- 27. MOTIVACION
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Motivacion', 'Evalua impulso interno y persistencia', 'psicometrico', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Lo que mas le motiva en el trabajo es:', 'opcion_multiple',
  '["Lograr metas", "Aprender cosas nuevas", "Reconocimiento", "Ayudar a otros"]'::jsonb,
  'Motivacion', 1 FROM cst_test_competencias WHERE nombre = 'Test de Motivacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Mantengo mi motivacion incluso en tareas repetitivas', 'escala',
  'Motivacion', 2 FROM cst_test_competencias WHERE nombre = 'Test de Motivacion';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La motivacion interna es mas fuerte que la externa', 'verdadero_falso',
  'Motivacion', 3 FROM cst_test_competencias WHERE nombre = 'Test de Motivacion';

-- 28. FLEXIBILIDAD
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Flexibilidad', 'Mide apertura a cambios y nuevas formas', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Cuando cambian los requerimientos de un proyecto, usted:', 'opcion_multiple',
  '["Se adapta rapidamente", "Evalua el impacto", "Busca alternativas", "Resiste el cambio"]'::jsonb,
  'Flexibilidad', 1 FROM cst_test_competencias WHERE nombre = 'Test de Flexibilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Estoy abierto a nuevas formas de hacer las cosas', 'escala',
  'Flexibilidad', 2 FROM cst_test_competencias WHERE nombre = 'Test de Flexibilidad';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'La flexibilidad es una fortaleza en el mundo actual', 'verdadero_falso',
  'Flexibilidad', 3 FROM cst_test_competencias WHERE nombre = 'Test de Flexibilidad';

-- 29. ANALISIS
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Analisis', 'Evalua capacidad de examinar informacion detalladamente', 'competencias', 'activo', 30, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para tomar una decision basada en datos, usted:', 'opcion_multiple',
  '["Revisa estadisticas", "Busca tendencias", "Compara opciones", "Consulta expertos"]'::jsonb,
  'Analisis', 1 FROM cst_test_competencias WHERE nombre = 'Test de Analisis';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Disfruto analizar informacion compleja', 'escala',
  'Analisis', 2 FROM cst_test_competencias WHERE nombre = 'Test de Analisis';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Los datos son la base de buenas decisiones', 'verdadero_falso',
  'Analisis', 3 FROM cst_test_competencias WHERE nombre = 'Test de Analisis';

-- 30. SERVICIO
INSERT INTO cst_test_competencias (nombre, descripcion, tipo, estado, duracion_minutos, calificacion_minima)
VALUES ('Test de Orientacion al Servicio', 'Mide vocacion de ayuda y atencion', 'competencias', 'activo', 20, 70);

INSERT INTO cst_test_preguntas (test_id, texto, tipo, opciones, competencia, orden)
SELECT id, 'Para brindar un excelente servicio, usted:', 'opcion_multiple',
  '["Anticipa necesidades", "Escucha activamente", "Resuelve rapidamente", "Supera expectativas"]'::jsonb,
  'Servicio', 1 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Servicio';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'Me satisface ayudar a los demas', 'escala',
  'Servicio', 2 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Servicio';

INSERT INTO cst_test_preguntas (test_id, texto, tipo, competencia, orden)
SELECT id, 'El servicio al cliente es una prioridad', 'verdadero_falso',
  'Servicio', 3 FROM cst_test_competencias WHERE nombre = 'Test de Orientacion al Servicio';
