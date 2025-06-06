-- DROP FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Madrid';
    RETURN NEW;
END;
$function$;
