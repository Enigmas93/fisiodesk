-- ============================================================
-- CORRECAO DO RLS DE PROFESSIONALS PARA BOOTSTRAP E LOGIN
-- ============================================================

CREATE OR REPLACE FUNCTION has_professional_profile()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professionals
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "clinic_isolation" ON professionals;
DROP POLICY IF EXISTS professionals_select_own_profile ON professionals;
DROP POLICY IF EXISTS professionals_insert_clinic_members ON professionals;
DROP POLICY IF EXISTS professionals_bootstrap_own_admin_profile ON professionals;
DROP POLICY IF EXISTS professionals_update_clinic_members ON professionals;
DROP POLICY IF EXISTS professionals_delete_clinic_members ON professionals;

CREATE POLICY professionals_select_own_profile ON professionals
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      clinic_id = get_user_clinic_id()
      AND (is_subscription_active() OR is_super_admin())
    )
  );

CREATE POLICY professionals_insert_clinic_members ON professionals
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

CREATE POLICY professionals_bootstrap_own_admin_profile ON professionals
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'admin'
    AND NOT has_professional_profile()
  );

CREATE POLICY professionals_update_clinic_members ON professionals
  FOR UPDATE
  USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

CREATE POLICY professionals_delete_clinic_members ON professionals
  FOR DELETE
  USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );
