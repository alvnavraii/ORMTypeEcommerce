-- Configuración de timezone para PostgreSQL
-- Este archivo debe ejecutarse en la base de datos

-- 1. Establecer timezone por defecto
SET timezone = 'Europe/Madrid';
SET TIME ZONE 'Europe/Madrid';

-- 2. Función para actualizar updated_at con timezone correcto
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Madrid')::timestamptz;
    RETURN NEW;
END;
$function$;

-- 3. Crear trigger en la tabla users (si existe)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Verificar configuración
SELECT name, setting FROM pg_settings WHERE name = 'timezone';
SELECT 'Europe/Madrid timezone test:', CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Madrid' as madrid_time;
SELECT 'UTC timezone test:', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as utc_time;

-- 5. Mostrar información de la tabla users si existe
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('created_at', 'updated_at')
ORDER BY ordinal_position;
