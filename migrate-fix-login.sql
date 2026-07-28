-- Funcion SECURITY DEFINER para buscar email por username
-- Bypassa RLS ya que se ejecuta con permisos del definer
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM profiles WHERE username = p_username LIMIT 1;
$$;
