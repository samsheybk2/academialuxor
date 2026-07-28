# Progreso del Proyecto - 2026-07-28

## Resumen General

Se completó la conexión de todas las páginas del módulo CST (Captación y Selección de Talento) a Supabase, eliminando datos mock y reemplazándolos con consultas reales a la base de datos.

## Cambios Recientes

### 1. Módulo CST - Conexión a Supabase

#### Plantilla Activa (`/cst/plantilla`)
- **Conectado a Supabase**: Tabla `cst_empleados` para empleados, tabla `cargos` para cargos, tabla `unidades_organizacionales` para gerencias
- **Rediseño de UI**: Estructura jerárquica de 3 niveles:
  1. **Gerencia** (unidad organizacional) - expandible con estadísticas agregadas
  2. **Cargo** - expandible con total plazas, activos, vacantes
  3. **Empleados** - activos y retirados con detalles (nombre, cédula, email, fecha ingreso)
- **Funcionalidades**:
  - Agregar empleados con cargo seleccionado
  - Retirar empleados (cambia estado a "retirado")
  - Búsqueda por nombre, cargo o cédula
  - Estados `gerenciaExpandida` y `cargoExpandido` para controlar expansión
  - Estadísticas por gerencia: total plazas, activos, vacantes
  - Cargos sin gerencia no se muestran (filtrados por `unidad_id`)

#### Candidatos (`/cst/candidatos`)
- **Conectado a Supabase**: Tabla `cst_candidatos` y `cst_candidato_historial`
- **Vista Kanban**: Pipeline de 7 etapas (Nuevo → Revisión → Entrevista → Evaluación → Oferta → Contratado → Rechazado)
- **Funcionalidades**:
  - Mover candidatos entre etapas (actualiza tabla y crea entrada en historial)
  - Crear nuevos candidatos con cargo desde tabla `cargos`
  - Vista de lista alternativa
  - Filtros por fuente y puesto
  - Búsqueda por nombre, email o puesto

#### Test de Competencias (`/cst/test-competencias`)
- **Conectado a Supabase**: Tablas `cst_test_competencias`, `cst_test_preguntas`, `cst_test_asignaciones`
- **Funcionalidades**:
  - Crear nuevos tests con tipo, duración y calificación mínima
  - Ver preguntas de cada test
  - Asignar tests a candidatos (desde tabla `cst_candidatos`)
  - Filtros por tipo y estado
  - Búsqueda por nombre o descripción

### 2. Estructura de Base de Datos

#### Tablas CST (en `supabase/migrate-cst.sql`)
- `cst_empleados`: Registro de empleados con cargo, fecha ingreso, estado
- `cst_candidatos`: Candidatos en pipeline ATS
- `cst_candidato_historial`: Historial de cambios de etapa
- `cst_test_competencias`: Tests creados
- `cst_test_preguntas`: Preguntas de cada test
- `cst_test_asignaciones`: Asignación de tests a candidatos
- `cst_test_resultados`: Respuestas y calificaciones

#### Cambios en Tabla `cargos`
- Se agregó columna `total_plazas INTEGER DEFAULT 1` para control de vacantes
- Se eliminó tabla `cst_plantilla_cargos` (ya no se usa)

### 3. Organización del Código

#### Interfaces TypeScript
- `Empleado`: Datos de empleado con `cargo_id` y `cargo_nombre` (calculado desde `cargos`)
- `CargoPlaza`: Cargo con `id`, `nombre`, `total_plazas` (opcional)
- `Candidato`: Candidato con `cargo_id` y `cargo_nombre` (calculado desde `cargos`)
- `TestCompetencia`: Test con campos de DB (`duracion_minutos`, `calificacion_promedio`, etc.)
- `Pregunta`: Pregunta con `respuesta_correcta` en lugar de `respuestaCorrecta`

#### Patrón de Fetch
```typescript
const supabase = createSupabaseClient()

useEffect(() => {
  const fetchData = async () => {
    const [dataRes, cargosRes] = await Promise.all([
      supabase.from("tabla").select("*").order("campo"),
      supabase.from("cargos").select("id, nombre").order("nombre"),
    ])
    if (cargosRes.data) setCargos(cargosRes.data)
    if (dataRes.data) {
      const cargoNombreMap = new Map(cargosRes.data.map(c => [c.id, c.nombre]))
      const dataConNombre = dataRes.data.map(e => ({
        ...e,
        cargo_nombre: cargoNombreMap.get(e.cargo_id) || "",
      }))
      setData(dataConNombre)
    }
  }
  fetchData()
}, [supabase])
```

## Estado Actual

### Completado
- ✅ Plantilla Activa conectada a Supabase con UI jerárquica (Gerencia → Cargo → Empleados)
- ✅ Candidatos conectado a Supabase con pipeline Kanban
- ✅ Test de Competencias conectado a Supabase
- ✅ Organigrama CST (ya estaba conectado)
- ✅ Migración SQL actualizada (eliminada `cst_plantilla_cargos`, agregado `total_plazas` a `cargos`)
- ✅ Títulos eliminados de todas las vistas CST
- ✅ Botones "Nuevo/Agregar" movidos al lado del campo de búsqueda
- ✅ Logo de Academia Luxor reemplazado por icono de menú en Sidebar y Header
- ✅ Botón de hamburguesa ahora abre el menú de aplicaciones (App Switcher) en lugar del sidebar
- ✅ CST removido de la navegación de CYD (Sidebar, Header, MobileNav)
- ✅ App Switcher agregado a CST (CstHeader) y NOM (NomHeader)
- ✅ App Switcher rediseñado como barra lateral con iconos (reemplaza modal)
- ✅ Logo de Academia Luxor removido de la página de Login
- ✅ Logo de Academia Luxor removido del componente de Certificado
- ✅ Botón de hamburguesa (App Sidebar) solo visible para rol "developer"
- ✅ Texto de copyright "Supermercados Luxor © 2026" removido del Login
- ✅ Checkbox de términos y condiciones removido del formulario de registro
- ✅ Botón de CYD eliminado de CstHeader y NomHeader
- ✅ Página de postulación con fondo emerald-600 y textos blancos
- ✅ Página de postulación: campos blancos sin bordes con esquinas cuadradas
- ✅ Página de postulación: fondo cubre toda la pantalla en móvil (w-full)
- ✅ Página de postulación: botón fijo en la parte inferior, solo visible al completar 100%
- ✅ Página de postulación: barra de progreso fija en la parte superior
- ✅ Build exitoso sin errores

### Pendiente
- Ejecutar migración SQL en Supabase para agregar `total_plazas` a tabla `cargos`
- Panel de Control (`/cst/panel-control`) - aún con datos mock
- Configuración (`/cst/configuracion`) - aún con datos mock

## Notas Técnicas

### Manejo de `cargo_nombre`
Como `cst_empleados` y `cst_candidatos` solo tienen `cargo_id` (no `cargo_nombre`), se construye un mapa desde la tabla `cargos` para enriquecer los datos:

```typescript
const cargoNombreMap = new Map(cargos.map(c => [c.id, c.nombre]))
const empleadoConNombre = { ...empleado, cargo_nombre: cargoNombreMap.get(empleado.cargo_id) || "" }
```

### Campo `total_plazas` en `cargos`
- Es opcional en la interfaz (`total_plazas?: number`)
- Se usa fallback `|| 1` cuando la columna no existe en la DB
- La migración debe ejecutarse para agregar la columna: `ALTER TABLE cargos ADD COLUMN total_plazas INTEGER DEFAULT 1`

### Estado `gerenciaExpandida` y `cargoExpandido` en Plantilla
- Dos niveles de expansión independientes
- `gerenciaExpandida: string | null` - gerencia actualmente expandida
- `cargoExpandido: string | null` - cargo actualmente expandido
- Click en gerencia expande/colapsa la gerencia y sus cargos
- Click en cargo expande/colapsa solo ese cargo mostrando empleados
- Solo un elemento de cada nivel puede estar expandido a la vez
