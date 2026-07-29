-- Políticas para acceso público a tests
-- Permitir que candidatos vean sus asignaciones sin autenticación

CREATE POLICY "public_test_assignments_select" ON cst_test_asignaciones
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "public_test_competencias_select" ON cst_test_competencias
  FOR SELECT TO anon
  USING (estado = 'activo');

CREATE POLICY "public_test_preguntas_select" ON cst_test_preguntas
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "public_test_resultados_insert" ON cst_test_resultados
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_test_resultados_update" ON cst_test_resultados
  FOR UPDATE TO anon
  USING (true);

CREATE POLICY "public_test_asignaciones_update" ON cst_test_asignaciones
  FOR UPDATE TO anon
  USING (true);
