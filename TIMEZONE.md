# Configuración de Zona Horaria - Caracas, Venezuela

## Supabase (PostgreSQL)

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase
2. Click en **Settings** (ícono de engranaje)
3. Click en **Database**
4. Busca la sección **Timezone**
5. Selecciona **America/Caracas** (UTC-4)
6. Click en **Save**

### Opción 2: Usando SQL Editor

Ejecuta este comando en el SQL Editor de Supabase:

```sql
ALTER DATABASE postgres SET timezone = 'America/Caracas';
```

### Verificar la zona horaria actual

```sql
SHOW timezone;
SELECT NOW();
```

## Aplicación Next.js

La aplicación ya está configurada para usar la zona horaria de Caracas:

- **Frontend**: Usa `toLocaleDateString("es-VE")` para formatear fechas
- **Utilidades**: Ver `src/lib/dateUtils.ts` para funciones helper
- **Base de datos**: Configurar en Supabase (ver arriba)

## Notas Importantes

- Venezuela usa UTC-4 todo el año (no hay horario de verano)
- Las fechas en la base de datos se almacenan en UTC (TIMESTAMPTZ)
- La conversión a hora local se hace al mostrar las fechas
- El formato de fecha venezolano es: DD/MM/YYYY
