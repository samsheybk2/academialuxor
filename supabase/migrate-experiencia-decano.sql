-- Habilita el módulo Experiencia (insignias, niveles, categorías) para el rol decano
-- Gestión (SELECT/INSERT/UPDATE/DELETE): decano + developer
-- Lectura: cualquier usuario autenticado (para mostrar insignias en el perfil)

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (
    SELECT tablename, policyname FROM pg_policies
    WHERE tablename IN ('insignias', 'niveles', 'categoria_insignias', 'insignia_cargos')
  ) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
  END LOOP;
END $$;

-- INSIGNIAS
CREATE POLICY "insignias_select_authenticated" ON insignias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "insignias_all_admin" ON insignias
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

-- NIVELES
CREATE POLICY "niveles_select_authenticated" ON niveles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "niveles_all_admin" ON niveles
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

-- CATEGORIA INSIGNIAS
CREATE POLICY "categoria_insignias_select_authenticated" ON categoria_insignias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categoria_insignias_all_admin" ON categoria_insignias
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));

-- INSIGNIA CARGOS
CREATE POLICY "insignia_cargos_select_authenticated" ON insignia_cargos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "insignia_cargos_all_admin" ON insignia_cargos
  FOR ALL USING (public.get_my_role() IN ('decano', 'developer'));
