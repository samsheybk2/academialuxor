export type PreguntaTipo = "multiple" | "libre" | "analisis"

export interface Pregunta {
  id: string
  pregunta: string
  opciones: string[]
  respuestaCorrecta: number
  tipo?: PreguntaTipo
}

export interface ModuloCurso {
  id: string
  titulo: string
  descripcion: string
  videoUrl: string
  duracion: string
  preguntas: Pregunta[]
  orden: number
}

export interface CursoDetalle {
  id: string
  titulo: string
  nivel: string
  facilitador: string
  descripcion: string
  duracionTotal: string
  modulos: ModuloCurso[]
}

export const mockCursosDetalle: CursoDetalle[] = [
  {
    id: "servicio-al-cliente",
    titulo: "Servicio al Cliente",
    nivel: "operadores",
    facilitador: "Carlos Mendez",
    descripcion:
      "Técnicas de atención al cliente, manejo de quejas y fidelización para el sector retail",
    duracionTotal: "10 horas",
    modulos: [
      {
        id: "sc-1",
        titulo: "Introducción al Servicio al Cliente",
        descripcion:
          "Conceptos fundamentales, importancia del cliente y primer impacto",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "15 min",
        orden: 1,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Cuál es el objetivo principal del servicio al cliente?",
            opciones: [
              "Vender más productos",
              "Satisfacer las necesidades del cliente",
              "Reducir costos",
              "Aumentar el inventario",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta: "¿Qué es el primer impacto?",
            opciones: [
              "La primera vez que el cliente compra",
              "La primera impresión que tiene el cliente al entrar",
              "El primer producto que ve",
              "La primera queja del cliente",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cuál de estas es una cualidad importante para un asesor de ventas?",
            opciones: [
              "Impaciencia",
              "Empatía",
              "Desinterés",
              "Rudeness",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta: "¿Qué hacer cuando un cliente no sabe qué comprar?",
            opciones: [
              "Ignorarlo",
              "Obligarlo a comprar algo",
              "Ofrecer orientación personalizada",
              "Decirle que vuelva después",
            ],
            respuestaCorrecta: 2,
          },
        ],
      },
      {
        id: "sc-2",
        titulo: "Comunicación Efectiva",
        descripcion:
          "Técnicas de comunicación verbal y no verbal con el cliente",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "20 min",
        orden: 2,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Qué porcentaje de la comunicación es no verbal?",
            opciones: ["10%", "30%", "55%", "90%"],
            respuestaCorrecta: 2,
          },
          {
            id: "p2",
            pregunta: "¿Cuál es una barrera efectiva en la comunicación?",
            opciones: [
              "Escuchar activamente",
              "Usar jerga técnica con el cliente",
              "Hacer preguntas abiertas",
              "Mantener contacto visual",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta: "¿Qué es la escucha activa?",
            opciones: [
              "Escuchar mientras se hace otra cosa",
              "Prestar atención completa al interlocutor",
              "Hablar más que escuchar",
              "Interumpir cuando sea necesario",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Cuál es la mejor forma de manejar un cliente molesto?",
            opciones: [
              "Devolverle el gritito",
              "Ignorarlo hasta que se calme",
              "Escuchar, empathizar y buscar solución",
              "Llamar a seguridad",
            ],
            respuestaCorrecta: 2,
          },
        ],
      },
      {
        id: "sc-3",
        titulo: "Manejo de Quejas",
        descripcion:
          "Protocolo para recibir, resolver y aprender de las quejas del cliente",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "18 min",
        orden: 3,
        preguntas: [
          {
            id: "p1",
            pregunta:
              "¿Cuál es el primer paso al recibir una queja?",
            opciones: [
              "Discutir con el cliente",
              "Escuchar activamente y validar su molestia",
              "Ofrecer un descuento inmediato",
              "Llamar al gerente",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta: "¿Qué es el método L.A.S.T.?",
            opciones: [
              "Listen, Apologize, Solve, Thank",
              "Look, Ask, Suggest, Take",
              "Learn, Apply, Study, Teach",
              "List, Analyze, Solve, Test",
            ],
            respuestaCorrecta: 0,
          },
          {
            id: "p3",
            pregunta:
              "¿Por qué es importante documentar las quejas?",
            opciones: [
              "Para culpar al cliente",
              "Paraidentificar patrones y mejorar",
              "Para despedir al empleado",
              "Para no hacer nada",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué hacer cuando no puedes resolver una queja inmediatamente?",
            opciones: [
              "Decir que no hay nada que hacer",
              "Dar seguimiento y mantener al cliente informado",
              "Ignorar al cliente",
              "Cambiar de tema",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "sc-4",
        titulo: "Técnicas de Venta",
        descripcion:
          "Estrategias para aumentar ventas y crear experiencias de compra",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "22 min",
        orden: 4,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Qué es el upselling?",
            opciones: [
              "Vender productos más baratos",
              "Vender un producto de mayor gasto",
              "No vender nada",
              "Devolver productos",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta: "¿Cuál es la regla de oro en ventas?",
            opciones: [
              "Hablar siempre",
              "Escuchar más de lo que hablas",
              "No saludar al cliente",
              "Forzar la venta",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta: "¿Qué es el cross-selling?",
            opciones: [
              "Vender en otro idioma",
              "Vender productos complementarios",
              "Vender productos defectuosos",
              "No vender",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Cómo finalizar una venta exitosamente?",
            opciones: [
              "Irte sin decir nada",
              "Agradecer y ofrecer seguimiento",
              "Pedir más dinero",
              "No dar recibo",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "sc-5",
        titulo: "Fidelización del Cliente",
        descripcion:
          "Estrategias para retener clientes y crear relación a largo plazo",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "15 min",
        orden: 5,
        preguntas: [
          {
            id: "p1",
            pregunta:
              "¿Cuánto cuesta conseguir un cliente nuevo vs. retener uno?",
            opciones: [
              "Costar lo mismo",
              "Conseguir un nuevo cuesta 5x más",
              "Retener cuesta más",
              "No hay diferencia",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Cuál es la clave de la fidelización?",
            opciones: [
              "Precios bajos siempre",
              "Experiencias consistentes y personalizadas",
              "No cambiar nunca",
              "Ignorar al cliente después de la venta",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta: "¿Qué es un programa de lealtad?",
            opciones: [
              "Un castigo para clientes",
              "Un sistema de recompensas para clientes frecuentes",
              "Un tipo de queja",
              "Un producto nuevo",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué hacer con un cliente que no vuelve?",
            opciones: [
              "Nada, ya no es nuestro cliente",
              "Contactarlo para ofrecer atención personalizada",
              "Bloquearlo",
              "Hablar mal de él",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
    ],
  },
  {
    id: "escuela-de-liderazgo",
    titulo: "Escuela de Liderazgo",
    nivel: "coordinadores",
    facilitador: "Ana Torres",
    descripcion:
      "Habilidades de liderazgo, motivación de equipos y gestión de conflictos",
    duracionTotal: "20 horas",
    modulos: [
      {
        id: "el-1",
        titulo: "Fundamentos del Liderazgo",
        descripcion:
          "Estilos de liderazgo, inteligencia emocional y toma de decisiones",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "25 min",
        orden: 1,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Cuál es la base del liderazgo efectivo?",
            opciones: [
              "El poder absoluto",
              "La confianza y el respeto",
              "Los títulos laborales",
              "La cantidad de subordinados",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta: "¿Qué es la inteligencia emocional?",
            opciones: [
              "Ser el más inteligente",
              "Controlar las emociones propias y ajenas",
              "No tener emociones",
              "Gritar para ser escuchado",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cuál es un estilo de liderazgo autocrático?",
            opciones: [
              "Decidir con el equipo",
              "Decidir solo sin consultar",
              "No decidir nunca",
              "Dejar que otros decidan",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Por qué es importante la toma de decisiones?",
            opciones: [
              "Para demostrar poder",
              "Para avanzar y resolver problemas",
              "Para castsar al equipo",
              "No es importante",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "el-2",
        titulo: "Motivación de Equipos",
        descripcion:
          "Técnicas para inspirar, reconocer y mantener al equipo motivado",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "20 min",
        orden: 2,
        preguntas: [
          {
            id: "p1",
            pregunta:
              "¿Qué es más efectivo para motivar al equipo?",
            opciones: [
              "Solo el dinero",
              "Reconocimiento + crecimiento",
              "Castigos",
              "No hacer nada",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Qué es la Teoría de Herzberg?",
            opciones: [
              "Todos son malos",
              "Factores de higiene y motivación",
              "Solo importa el sueldo",
              "Trabajar más horas",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cómo reconocer el buen desempeño?",
            opciones: [
              "Ignorarlo",
              "Destacarlo públicamente y dar retroalimentación",
              "Decir que es lo mínimo",
              "No decir nada",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué hacer con un empleado desmotivado?",
            opciones: [
              "Despedirlo",
              "Escuchar sus necesidades y buscar soluciones",
              "Ignorarlo",
              "Dar más trabajo",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "el-3",
        titulo: "Gestión de Conflictos",
        descripcion:
          "Resolución de conflictos, negociación y comunicación asertiva",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "22 min",
        orden: 3,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Cuál es la primera regla en un conflicto?",
            opciones: [
              "Ganar siempre",
              "Mantener la calma y escuchar",
              "Ignorar el problema",
              "Castigar a uno de los dos",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Qué es la negociación ganar-ganar?",
            opciones: [
              "Ganar Yo, perder tú",
              "Que ambas partes obtengan algo positivo",
              "Que nadie gane",
              "No negociar",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cuándo escalar un conflicto?",
            opciones: [
              "Nunca",
              "Cuando no se puede resolver entre las partes",
              "Siempre",
              "Solo los viernes",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué es la comunicación asertiva?",
            opciones: [
              "Gritar para ser escuchado",
              "Expresar respetando al otro",
              "No decir nada",
              "Hablar por los demás",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "el-4",
        titulo: "Delegación Efectiva",
        descripcion:
          "Cómo delegar tareas correctamente sin perder el control",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "18 min",
        orden: 4,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Qué es delegar?",
            opciones: [
              "Culpar a otros",
              "Asignar responsabilidades con autoridad",
              "No trabajar",
              "Dar todo el trabajo",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Cuál es un error común al delegar?",
            opciones: [
              "Dar instrucciones claras",
              "No dar seguimiento",
              "Explicar bien",
              "Confiar en el equipo",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Qué debe incluir una buena delegación?",
            opciones: [
              "Solo el nombre de la tarea",
              "Objetivo, recursos, plazo y seguimiento",
              "Nada, que se ingenien",
              "Un castigo si no lo hacen",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿De quién es la responsabilidad final?",
            opciones: [
              "Del equipo",
              "Del líder que delegó",
              "De nadie",
              "Del cliente",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
    ],
  },
  {
    id: "manipulacion-de-alimentos",
    titulo: "Manipulación de Alimentos",
    nivel: "operadores",
    facilitador: "Carlos Mendez",
    descripcion:
      "Buenas prácticas de higiene, cadena de frío y manipulación segura de alimentos",
    duracionTotal: "8 horas",
    modulos: [
      {
        id: "ma-1",
        titulo: "Higiene Personal del Manipulador",
        descripcion:
          "Lavado de manos, uso de uniforme y hábitos de higiene",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "12 min",
        orden: 1,
        preguntas: [
          {
            id: "p1",
            pregunta:
              "¿Cada cuánto debe lavarse las manos un manipulador?",
            opciones: [
              "Solo al llegar",
              "Cada vez que cambie de actividad",
              "Una vez al día",
              "Solo cuando está sucio",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Qué NO debe usar un manipulador de alimentos?",
            opciones: [
              "Gorra",
              "Joyas y relojes",
              "Uniforme limpio",
              "Guantes desechables",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cuánto tiempo debe durar el lavado de manos?",
            opciones: [
              "5 segundos",
              "20 segundos mínimo",
              "1 minuto",
              "30 minutos",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué hacer si tiene una herida en la mano?",
            opciones: [
              "Taparla con esparadrapo y usar guante",
              "Trabajar normal",
              "No hacer nada",
              "Ponerle vinagre",
            ],
            respuestaCorrecta: 0,
          },
        ],
      },
      {
        id: "ma-2",
        titulo: "Cadena de Frío",
        descripcion:
          "Temperaturas de almacenamiento, transporte y exhibición",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "15 min",
        orden: 2,
        preguntas: [
          {
            id: "p1",
            pregunta:
              "¿A qué temperatura debe mantenerse el refrigerador?",
            opciones: [
              "10°C",
              "4°C o menos",
              "20°C",
              "0°C",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p2",
            pregunta:
              "¿Qué es la zona de peligro de temperatura?",
            opciones: [
              "Entre 0°C y 4°C",
              "Entre 5°C y 60°C",
              "Entre 60°C y 100°C",
              "Solo arriba de 100°C",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Cuánto tiempo puede estar un alimento fuera de refrigeración?",
            opciones: [
              "Todo el día",
              "Máximo 2 horas",
              "Solo 10 minutos",
              "Sin límite",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Qué producto debe congelarse a -18°C o menos?",
            opciones: [
              "Pan",
              "Carnes y pescados",
              "Frutas",
              "Verduras",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
      {
        id: "ma-3",
        titulo: "Almacenamiento y Rotación",
        descripcion:
          "Primeras salidas, etiquetado yorganización de almacén",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "14 min",
        orden: 3,
        preguntas: [
          {
            id: "p1",
            pregunta: "¿Qué significa FIFO?",
            opciones: [
              "First In, First Out",
              "Forever In, Forever Out",
              "Food Is Our Opportunity",
              "Final Inspection, Final Outcome",
            ],
            respuestaCorrecta: 0,
          },
          {
            id: "p2",
            pregunta:
              "¿Dónde deben colocarse los productos con fecha próxima a vencer?",
            opciones: [
              "Al fondo del estante",
              "Donde se vea primero",
              "En el piso",
              "En otro almacén",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p3",
            pregunta:
              "¿Qué debe tener todo producto en almacén?",
            opciones: [
              "Nada especial",
              "Etiqueta con fecha de ingreso y vencimiento",
              "Solo el nombre",
              "Un dibujo",
            ],
            respuestaCorrecta: 1,
          },
          {
            id: "p4",
            pregunta:
              "¿Dónde se almacenan los productos químicos?",
            opciones: [
              "Junto a los alimentos",
              "En un área separada y identificada",
              "En el piso",
              "En el refrigerador",
            ],
            respuestaCorrecta: 1,
          },
        ],
      },
    ],
  },
  {
    id: "escuela-comercial",
    titulo: "Escuela Comercial",
    nivel: "operadores",
    facilitador: "Carlos Mendez",
    descripcion: "Formación en técnicas comerciales y ventas para el sector retail",
    duracionTotal: "16 horas",
    modulos: [
      {
        id: "ec-1",
        titulo: "Fundamentos de Ventas",
        descripcion: "Conceptos básicos de venta y comportamiento del consumidor",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "20 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Cuál es el primer paso en una venta?", opciones: ["Cerrar la venta", "Identificar las necesidades del cliente", "Mostrar el producto", "Cobrar"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Qué es el upselling?", opciones: ["Vender menos", "Ofrecer un producto de mayor valor", "No vender nada", "Devolver productos"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Por qué es importante conocer el producto?", opciones: ["Para engañar al cliente", "Para generar confianza y recomendar bien", "No es importante", "Para hablar de más"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Qué hacer cuando el cliente dice que no?", opciones: ["Insistir agresivamente", "Agradecer y ofrecer alternativas", "Ignorarlo", "Regañar al cliente"], respuestaCorrecta: 1 },
        ],
      },
      {
        id: "ec-2",
        titulo: "Técnicas de Cierre",
        descripcion: "Estrategias para cerrar ventas exitosamente",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "18 min",
        orden: 2,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es el cierre alternativo?", opciones: ["No vender", "Dar dos opciones de compra", "Decir que no hay stock", "Cerrar la tienda"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Cuándo es el mejor momento para cerrar?", opciones: ["Nunca", "Cuando el cliente muestra interés", "Siempre al inicio", "Al final del día"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué es la urgencia artificial?", opciones: ["Crear escasez para motivar la compra", "No tener productos", "Cerrar la tienda", "No hacer nada"], respuestaCorrecta: 0 },
          { id: "p4", pregunta: "¿Cómo manejar objeciones?", opciones: ["Ignorarlas", "Escuchar y responder con beneficios", "Discutir", "Despedir al cliente"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "induccion-corporativa",
    titulo: "Inducción Corporativa",
    nivel: "operadores",
    facilitador: "Ana Torres",
    descripcion: "Onboarding para nuevos colaboradores: valores, misión y cultura Luxor",
    duracionTotal: "8 horas",
    modulos: [
      {
        id: "ic-1",
        titulo: "Bienvenida a Luxor",
        descripcion: "Historia, valores y visión de Supermercados Luxor",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "15 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Cuál es el valor fundamental de Luxor?", opciones: ["Solo ganar dinero", "Servir al cliente con excelencia", "No tener valores", "Trabajar menos"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Qué representa el logo de Luxor?", opciones: ["Nada", "Calidad y confianza", "Un animal", "Una fruta"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Por qué es importante la cultura organizacional?", opciones: ["No lo es", "Define cómo trabajamos juntos", "Para tener reglas", "Para complicar todo"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Cuál es nuestra misión?", opciones: ["Vender barato", "Ofrecer calidad y servicio al mejor precio", "No tener misión", "Cerrar pronto"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "protocolos-seguridad",
    titulo: "Protocolos de Seguridad y Salud Industrial",
    nivel: "operadores",
    facilitador: "Ana Torres",
    descripcion: "Normativas de seguridad, prevención de riesgos y salud ocupacional",
    duracionTotal: "12 horas",
    modulos: [
      {
        id: "ps-1",
        titulo: "Normas Generales de Seguridad",
        descripcion: "Protocolos básicos de seguridad en el área de trabajo",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "18 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué hacer ante una emergencia?", opciones: ["Ignorarla", "Seguir el protocolo de evacuación", "Correr sin rumbo", "Esperar a que pase"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Dónde están los extintores?", opciones: ["No importa", "En puntos estratégicos señalizados", "En la oficina del gerente", "No hay"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué hacer si ves un piso mojado?", opciones: ["Pasar rápido", "Señalizar y reportar", "Ignorarlo", "Echar más agua"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Cuál es el EPP básico?", opciones: ["Nada", "Zapatos de seguridad, gorra y guantes", "Solo una camisa", "Un sombrero"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "prevencion-perdidas",
    titulo: "Prevención de Pérdidas",
    nivel: "coordinadores",
    facilitador: "Carlos Mendez",
    descripcion: "Estrategias para reducir mermas, robos y pérdidas en operaciones",
    duracionTotal: "10 horas",
    modulos: [
      {
        id: "pp-1",
        titulo: "Tipos de Pérdidas en Retail",
        descripcion: "Identificación de mermas, robos internos y externos",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "20 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es una merma?", opciones: ["Una ganancia", "Pérdida de producto por deterioro o error", "Un tipo de venta", "Un descuento"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Cuál es la principal causa de pérdidas?", opciones: ["Los clientes", "Errores internos y robos", "El clima", "Los proveedores"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Cómo se previene el robo interno?", opciones: ["No se puede", "Controles, supervisión y cultura de integridad", "Despedir a todos", "No contratar a nadie"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Qué es el inventario cíclico?", opciones: ["Contar todo una vez al año", "Conteo rotativo periódico de productos", "No contar nada", "Contar solo lo caro"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "procesos-operativos",
    titulo: "Procesos Operativos",
    nivel: "administrativos",
    facilitador: "Carlos Mendez",
    descripcion: "Estandarización de procesos, flujos de trabajo y eficiencia operativa",
    duracionTotal: "14 horas",
    modulos: [
      {
        id: "po-1",
        titulo: "Estandarización de Procesos",
        descripcion: "Cómo documentar y mejorar procesos operativos",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "22 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es un proceso estandarizado?", opciones: ["Un proceso que nadie sigue", "Un flujo de trabajo documentado y repetible", "Un proceso nuevo cada vez", "Algo opcional"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Por qué estandarizar procesos?", opciones: ["Para complicar todo", "Para reducir errores y mejorar eficiencia", "No sirve de nada", "Para tener más papeles"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué es un flujo de trabajo?", opciones: ["Un tipo de danza", "La secuencia de pasos para completar una tarea", "Un documento legal", "Una queja del cliente"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Cómo se mejora un proceso?", opciones: ["No se puede", "Analizando datos y retroalimentación", "Cambiar todo sin sentido", "No hacer nada"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "normativas",
    titulo: "Normativas",
    nivel: "administrativos",
    facilitador: "Ana Torres",
    descripcion: "Marco legal, regulaciones y cumplimiento normativo del sector",
    duracionTotal: "8 horas",
    modulos: [
      {
        id: "no-1",
        titulo: "Marco Legal del Sector Comercio",
        descripcion: "Regulaciones aplicables a supermercados y comercio minorista",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "20 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es la PROFECO?", opciones: ["Un producto", "Protección al Consumidor", "Un proveedor", "Un tipo de comida"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Qué derechos tienen los consumidores?", opciones: ["Ninguno", "Información clara, devolución y garantía", "Solo comprar", "No quejarse"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué es el etiquetado obligatorio?", opciones: ["Un adorno", "Información nutricional y de contenido", "Un precio", "Una marca"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Cuál es la multa por no cumplir normativas?", opciones: ["No hay", "Puede ser desde amonestación hasta cierre", "Solo una advertencia", "Nada"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "cultura-organizacional",
    titulo: "Cultura Organizacional",
    nivel: "gerentes",
    facilitador: "Ana Torres",
    descripcion: "Valores, misión, visión y construcción de cultura corporativa",
    duracionTotal: "10 horas",
    modulos: [
      {
        id: "co-1",
        titulo: "Construyendo Cultura Corporativa",
        descripcion: "Cómo crear y mantener una cultura organizacional sólida",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "25 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es la cultura organizacional?", opciones: ["El edificio", "El conjunto de valores, creencias y comportamientos", "Las oficinas", "El mobiliario"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Quién lidera la cultura?", opciones: ["Solo RRHH", "Todos, desde la dirección hasta el operador", "Nadie", "Los clientes"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Cómo se mantiene la cultura?", opciones: ["Con castigos", "Con coherencia, reconocimiento y ejemplo", "No se puede", "Con reuniones infinitas"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Por qué fallan las culturas?", opciones: ["Por tener valores", "Por falta de coherencia entre discurso y práctica", "No fallan", "Por tener buenos líderes"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "desarrollo-gerencial",
    titulo: "Desarrollo Gerencial",
    nivel: "gerentes",
    facilitador: "Carlos Mendez",
    descripcion: "Habilidades directivas, toma de decisiones y gestión estratégica",
    duracionTotal: "16 horas",
    modulos: [
      {
        id: "dg-1",
        titulo: "Toma de Decisiones Estratégicas",
        descripcion: "Marcos de decisión, análisis de riesgo y planificación",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "30 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es una decisión estratégica?", opciones: ["Elegir el almuerzo", "Una decisión a largo plazo con alto impacto", "Una decisión diaria", "Una decisión de bajo nivel"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Qué es el análisis FODA?", opciones: ["Un tipo de comida", "Fortalezas, Oportunidades, Debilidades, Amenazas", "Un programa de电视", "Un defecto"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Cómo se evalúa el riesgo?", opciones: ["No se evalúa", "Probabilidad x Impacto", "Adivinando", "Con suerte"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Qué es la planificación estratégica?", opciones: ["No planear", "Definir objetivos a largo plazo y cómo alcanzarlos", "Hacer una lista de compras", "Trabajar sin rumbo"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "calidad-servicio",
    titulo: "Calidad de Servicio y Atención al Cliente",
    nivel: "coordinadores",
    facilitador: "Ana Torres",
    descripcion: "Estándares de calidad, métricas de satisfacción y mejora continua",
    duracionTotal: "12 horas",
    modulos: [
      {
        id: "cs-1",
        titulo: "Estándares de Calidad",
        descripcion: "Definición y medición de estándares de servicio",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "22 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué es un estándar de calidad?", opciones: ["Un ideal imposible", "Un nivel mínimo aceptable de servicio", "Un castigo", "Un precio"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Cómo se mide la satisfacción?", opciones: ["No se mide", "Encuestas, NPS, quejas y sugerencias", "Con la vista", "Adivinando"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué es el NPS?", opciones: ["Un tipo de producto", "Net Promoter Score - indicador de lealtad", "Una marca", "Un defecto"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Qué es la mejora continua?", opciones: ["Cambiar todo cada día", "Proceso constante de optimización", "No cambiar nada", "Hacer las cosas peor"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
  {
    id: "buenas-practicas-fabricacion",
    titulo: "Buenas Prácticas de Fabricación",
    nivel: "operadores",
    facilitador: "Carlos Mendez",
    descripcion: "BPF, control de calidad en procesamiento y estándares de producción",
    duracionTotal: "10 horas",
    modulos: [
      {
        id: "bpf-1",
        titulo: "Introducción a BPF",
        descripcion: "Principios de Buenas Prácticas de Fabricación",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duracion: "18 min",
        orden: 1,
        preguntas: [
          { id: "p1", pregunta: "¿Qué significa BPF?", opciones: ["Buenos Productos Frescos", "Buenas Prácticas de Fabricación", "Buena Performance Fiscal", "Buen Proveeduría y Finanzas"], respuestaCorrecta: 1 },
          { id: "p2", pregunta: "¿Para qué sirven las BPF?", opciones: ["Para complicar la producción", "Para garantizar productos seguros y de calidad", "Para aumentar costos", "Para tener más paperwork"], respuestaCorrecta: 1 },
          { id: "p3", pregunta: "¿Qué es un plan de saneamiento?", opciones: ["Un plan de vacaciones", "Protocolo de limpieza y desinfección", "Un tipo de seguro", "Un manual de ventas"], respuestaCorrecta: 1 },
          { id: "p4", pregunta: "¿Cuál es el objetivo de BPF?", opciones: ["Producir rápido", "Prevenir contaminationes y garantizar inocuidad", "Reducir personal", "Ahorrar materiales"], respuestaCorrecta: 1 },
        ],
      },
    ],
  },
]

export function getCursoById(id: string): CursoDetalle | undefined {
  return mockCursosDetalle.find((c) => c.id === id)
}
