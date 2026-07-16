import type { RutaAprendizaje } from "@/types/ruta-aprendizaje"

export const mockRutas: RutaAprendizaje[] = [
  {
    id: "cajero",
    cargo: "Cajero",
    descripcion: "Atención al cliente en puntos de venta y manejo de cobros",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Manejo de Caja y Cobros", tipo: "curso", descripcion: "Sistemas POS, billetes, monederos y pagos electrónicos", duracion: "2 semanas", orden: 2, obligatorio: true, cursoId: "curso-caja-01" },
      { id: "e3", titulo: "Atención al Cliente Premium", tipo: "curso", descripcion: "Técnicas de servicio, manejo de quejas y fidelización", duracion: "1 semana", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Simulación de Atención en Caja", tipo: "taller", descripcion: "Role-playing de situaciones reales: cobros, devoluciones, quejas", duracion: "2 días", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Examen de Conocimientos de Caja", tipo: "examen", descripcion: "Evaluación escrita sobre procedimientos de cobro y atención", duracion: "1 hora", orden: 5, obligatorio: true },
    ],
  },
  {
    id: "reposador",
    cargo: "Reposador",
    descripcion: "Reposición de mercancía y organización de estantes",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Manejo de Mercancía y Cadena de Frío", tipo: "curso", descripcion: "Procedimientos de recepción, almacenamiento y conservación", duracion: "2 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Organización de Piso y Exhibición", tipo: "curso", descripcion: "Planogramas, rotación de mercancía y visual merchandising", duracion: "1 semana", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Taller de Reposición Práctica", tipo: "taller", descripcion: "Práctica en piso real: recepción, acomodo y rotación", duracion: "3 días", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Examen de Conocimientos de Piso", tipo: "examen", descripcion: "Evaluación sobre procedimientos de reposición y seguridad", duracion: "1 hora", orden: 5, obligatorio: true },
    ],
  },
  {
    id: "promotor_ventas",
    cargo: "Promotor de Ventas",
    descripcion: "Promoción de productos y atención especializada al cliente",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Técnicas de Venta y Persuasión", tipo: "curso", descripcion: "Estrategias de venta cruzada, up-selling y cierre", duracion: "2 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Conocimiento de Productos", tipo: "curso", descripcion: "Características, beneficios y diferenciación de productos", duracion: "1 semana", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Simulación de Ventas", tipo: "taller", descripcion: "Role-playing de atención especializada y cierre de venta", duracion: "2 días", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Examen de Técnicas de Venta", tipo: "examen", descripcion: "Evaluación escrita sobre técnicas de venta y productos", duracion: "1 hora", orden: 5, obligatorio: true },
    ],
  },
  {
    id: "encargado_almacen",
    cargo: "Encargado de Almacén",
    descripcion: "Gestión de recepción, almacenamiento y distribución de mercancía",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Gestión de Almacén y Logística", tipo: "curso", descripcion: "Control de inventarios, reception y distribución eficiente", duracion: "3 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Seguridad e Higiene en Almacén", tipo: "curso", descripcion: "Normas de seguridad, prevención de accidentes y manejo de materiales", duracion: "1 semana", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Taller de Control de Inventario", tipo: "taller", descripcion: "Práctica de conteo cíclico, discrepancy y ajustes", duracion: "2 días", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Examen de Logística y Almacén", tipo: "examen", descripcion: "Evaluación sobre procedimientos de almacén y control", duracion: "1.5 horas", orden: 5, obligatorio: true },
    ],
  },
  {
    id: "coordinador_piso",
    cargo: "Coordinador de Piso",
    descripcion: "Supervisión de operaciones, equipo de piso y estándares de servicio",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Liderazgo y Gestión de Equipos", tipo: "curso", descripcion: "Habilidades de liderazgo, motivación y resolución de conflictos", duracion: "2 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Operaciones de Piso", tipo: "curso", descripcion: "Procedimientos operativos, estándares de servicio y productividad", duracion: "2 semanas", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Prevención de Pérdidas", tipo: "curso", descripcion: "Estrategias para reducir mermas, robos y fraudes", duracion: "1 semana", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Taller de Resolución de Conflictos", tipo: "taller", descripcion: "Práctica de manejo de situaciones difíciles con clientes y equipo", duracion: "2 días", orden: 5, obligatorio: true },
      { id: "e6", titulo: "Simulación de Gestión de Piso", tipo: "taller", descripcion: "Práctica de apertura, cierre y gestión de turnos", duracion: "3 días", orden: 6, obligatorio: true },
      { id: "e7", titulo: "Examen de Liderazgo y Operaciones", tipo: "examen", descripcion: "Evaluación escrita de competencias de liderazgo y operaciones", duracion: "2 horas", orden: 7, obligatorio: true },
    ],
  },
  {
    id: "analista_administrativo",
    cargo: "Analista Administrativo",
    descripcion: "Gestión documental, procesos administrativos y control de inventarios",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa", tipo: "curso", descripcion: "Valores, misión, visión y cultura Luxor", duracion: "1 semana", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Procesos Administrativos", tipo: "curso", descripcion: "Flujos de trabajo, estandarización y eficiencia operativa", duracion: "2 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Gestión Documental", tipo: "curso", descripcion: "Manejo de expedientes, control documental y archivo", duracion: "1 semana", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Normativas y Cumplimiento", tipo: "curso", descripcion: "Marco legal, regulaciones y cumplimiento normativo del sector", duracion: "1 semana", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Taller de Procesos Administrativos", tipo: "taller", descripcion: "Práctica de gestión documental y control de inventarios", duracion: "2 días", orden: 5, obligatorio: true },
      { id: "e6", titulo: "Examen de Conocimientos Administrativos", tipo: "examen", descripcion: "Evaluación sobre procedimientos y normativa administrativa", duracion: "2 horas", orden: 6, obligatorio: true },
    ],
  },
  {
    id: "gerente_sucursal",
    cargo: "Gerente de Sucursal",
    descripcion: "Dirección operativa, financiera y de recursos humanos de la sucursal",
    elementos: [
      { id: "e1", titulo: "Inducción Corporativa VIP", tipo: "curso", descripcion: "Inmersión en cultura organizacional, estructura y visión estratégica", duracion: "2 semanas", orden: 1, obligatorio: true },
      { id: "e2", titulo: "Desarrollo Gerencial", tipo: "curso", descripcion: "Habilidades directivas, toma de decisiones y gestión estratégica", duracion: "4 semanas", orden: 2, obligatorio: true },
      { id: "e3", titulo: "Gestión Financiera", tipo: "curso", descripcion: "Análisis financiero, presupuestos, control de costos y rentabilidad", duracion: "3 semanas", orden: 3, obligatorio: true },
      { id: "e4", titulo: "Gestión de Recursos Humanos", tipo: "curso", descripcion: "Selección, capacitación, evaluación y desarrollo de talento", duracion: "2 semanas", orden: 4, obligatorio: true },
      { id: "e5", titulo: "Taller de Planeación Estratégica", tipo: "taller", descripcion: "Ejercicio práctico de planificación anual de sucursal", duracion: "3 días", orden: 5, obligatorio: true },
      { id: "e6", titulo: "Shadowing Gerencial", tipo: "taller", descripcion: "Acompañamiento a gerente en funciones reales durante 1 semana", duracion: "1 semana", orden: 6, obligatorio: true },
      { id: "e7", titulo: "Examen de Competencias Gerenciales", tipo: "examen", descripcion: "Evaluación integral de conocimientos gerenciales y financieros", duracion: "3 horas", orden: 7, obligatorio: true },
    ],
  },
]
